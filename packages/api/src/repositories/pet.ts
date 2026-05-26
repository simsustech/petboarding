import { Database, db } from '../kysely/index.js'
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres'
import { convertImageSql } from './index.js'
import type { Pets } from '../kysely/types.ts'
import env from '@vitrify/tools/env'
import {
  type Insertable,
  type Selectable,
  type Updateable,
  type ExpressionBuilder,
  sql
} from 'kysely'
import { Vaccination } from '../zod/index.js'
import { subYears } from 'date-fns'
export type Pet = Selectable<Pets>
type NewPet = Insertable<Pets>
type PetUpdate = Updateable<Pets>

export interface ParsedPet extends Omit<Pet, 'image'> {
  image: string | null
  vaccinations?: Vaccination[]
  validVaccinations?: string[]
  hasMandatoryVaccinations?: boolean
}

const mandatoryVaccinations: Record<string, string[]> = {
  dog: (
    env.read('MANDATORY_VACCINATIONS_DOG') ||
    env.read('VITE_MANDATORY_VACCINATIONS_DOG')
  )?.split(',') || ['parvo', 'distemper', 'hepatitis'],
  cat:
    (
      env.read('MANDATORY_VACCINATIONS_CAT') ||
      env.read('VITE_MANDATORY_VACCINATIONS_CAT')
    )?.split(',') || []
}
export const checkVaccinations = ({
  species,
  validVaccinations
}: {
  species: string
  validVaccinations?: string[] | null
}) => {
  if (
    validVaccinations &&
    mandatoryVaccinations[species].every((val) =>
      validVaccinations.includes(val)
    )
  ) {
    return true
  }
  return false
}

const defaultSelect = [
  'id',
  'name',
  'breed',
  'gender',
  'sterilized',
  'birthDate',
  'chemicalSterilizationDate',
  'chipNumber',
  'food',
  'medicines',
  'deceased',
  'color',
  'particularities',
  'species',
  'weight',
  'insured',
  'customerId',
  'categoryId'
] as (keyof Pet)[]

function withVaccinations(eb: ExpressionBuilder<Database, 'pets'>) {
  return jsonArrayFrom(
    eb
      .selectFrom('vaccinations')
      .select([
        'vaccinations.id',
        'vaccinations.expirationDate',
        'vaccinations.types',
        'vaccinations.petId',
        convertImageSql.as('image'),
        (seb) =>
          seb(
            'expirationDate',
            '<',
            sql<string>`CURRENT_DATE + integer '31'`
          ).as('hasExpired')
      ])
      .orderBy('vaccinations.expirationDate', 'desc')
      .where(
        'vaccinations.expirationDate',
        '>',
        subYears(new Date(), 2).toISOString().slice(0, 10)
      )
      .whereRef('vaccinations.petId', '=', 'pets.id')
  ).as('vaccinations')
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withValidVaccinations(eb: ExpressionBuilder<Database, any>) {
  return eb
    .selectFrom('vaccinations')
    .select(sql<string[]>`json_agg(v)`.as('validVaccinations'))
    .where(
      'vaccinations.expirationDate',
      '>',
      new Date().toISOString().slice(0, 10)
    )
    .whereRef('vaccinations.petId', '=', 'pets.id')
    .leftJoinLateral(sql`json_array_elements(types)`.as('v'), (join) =>
      join.onTrue()
    )
    .as('validVaccinations')
}

function withCustomer(eb: ExpressionBuilder<Database, 'pets'>) {
  return jsonObjectFrom(
    eb
      .selectFrom('customers')
      .select(['customers.id', 'customers.lastName'])
      .whereRef('pets.customerId', '=', 'customers.id')
  ).as('customer')
}

export function withRelations(eb: ExpressionBuilder<Database, 'pets'>) {
  return eb
    .selectFrom((subEb) =>
      subEb
        .selectFrom('petRelations')
        .select(['petId2 as petId', 'rating'])
        .whereRef('petId1', '=', 'pets.id')
        .union(
          subEb
            .selectFrom('petRelations')
            .select(['petId1 as petId', 'rating'])
            .whereRef('petId2', '=', 'pets.id')
        )
        .as('unioned_relations')
    )
    .innerJoin(
      'pets as relatedPets',
      'relatedPets.id',
      'unioned_relations.petId'
    )
    .innerJoin(
      'customers as relatedCustomers',
      'relatedCustomers.id',
      'relatedPets.customerId'
    )
    .select((subEb) =>
      subEb
        .fn('jsonb_object_agg', [
          // The object key must be a text/column reference
          subEb.ref('unioned_relations.petId'),
          // Build the nested object values explicitly
          subEb.fn('jsonb_build_object', [
            sql.lit('rating'),
            subEb.ref('unioned_relations.rating'),
            sql.lit('name'),
            sql<string>`concat(${subEb.ref('relatedPets.name')}, ' ', ${subEb.ref('relatedCustomers.lastName')})`
            // subEb.ref('relatedPets.name')
          ])
        ])
        .as('relations_obj')
    )
    .as('relations')
}

function find({
  criteria,
  select,
  relations
}: {
  criteria: Partial<Pet> & { ids?: number[] }
  select?: (keyof Pet)[]
  relations?: {
    vaccinations?: boolean
    relations?: boolean
  }
}) {
  if (select) select = [...defaultSelect, ...select]
  else select = [...defaultSelect]

  let query = db.selectFrom('pets')

  if (criteria.ids && !criteria.ids.length) {
    throw new Error('ids array cannot be empty')
  }

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  } else if (criteria.ids) {
    query = query.where('id', 'in', criteria.ids)
  }

  if (criteria.customerId) {
    query = query.where('customerId', '=', criteria.customerId)
  }

  if (criteria.deceased != void 0) {
    query = query.where('deceased', '=', criteria.deceased)
  }

  if (relations?.vaccinations) {
    query = query.select([withVaccinations, withValidVaccinations])
  }

  if (relations?.relations) {
    query = query.select([withRelations])
  }

  return query
    .select(select)
    .select([convertImageSql.as('image')])
    .select([withCustomer])
}

export async function findPet({
  criteria,
  select,
  relations
}: {
  criteria: Partial<Pet> & { ids?: number[] }
  select?: (keyof Pet)[]
  relations?: {
    vaccinations?: boolean
  }
}): Promise<ParsedPet | undefined> {
  const query = find({ criteria, select, relations })

  const result = (await query.executeTakeFirst()) as ParsedPet

  if (result.vaccinations) {
    result.hasMandatoryVaccinations = checkVaccinations({
      species: result.species,
      validVaccinations: result.validVaccinations
    })
  }
  return result
}

export async function findPets({
  criteria,
  select,
  relations
}: {
  criteria: Partial<Pet> & { ids?: number[] }
  select?: (keyof Pet)[]
  relations?: {
    vaccinations?: boolean
    relations?: boolean
  }
}) {
  const query = find({
    criteria,
    select,
    relations
  })
  let results = (await query.execute()) as ParsedPet[]

  results = results.map((pet) => {
    if (pet.vaccinations) {
      pet.hasMandatoryVaccinations = checkVaccinations({
        species: pet.species,
        validVaccinations: pet.validVaccinations
      })
    }
    return pet
  })
  return results
}

export async function createPet(pet: NewPet) {
  pet.name = pet.name.trim()
  pet.breed = pet.breed.trim()

  return db
    .insertInto('pets')
    .values(pet)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updatePet(criteria: Partial<Pet>, updateWith: PetUpdate) {
  let query = db.updateTable('pets')

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  }

  if (criteria.customerId) {
    query = query.where('customerId', '=', criteria.customerId)
  }
  if (updateWith.name) updateWith.name = updateWith.name.trim()
  if (updateWith.breed) updateWith.breed = updateWith.breed.trim()

  return query.set(updateWith).returningAll().executeTakeFirstOrThrow()
}

export async function searchPets(searchPhrase: string) {
  const searchTerms = searchPhrase.split(' ')

  try {
    const query = sql<ParsedPet[]>`
  with main as (
    select 
      p.id,
      p.customer_id,
      p.rating,
      p.chip_number,
      p.name,
      p.breed,
      p.gender,
      p.sterilized,
      p.chemical_sterilization_date,
      p.birth_date,
      p.color,
      p.medicines,
      p.food,
      p.weight,
      p.deceased,
      p.particularities,
      p.comments,
      c.last_name
    from 
      pets p 
      inner join customers c on p.customer_id = c.id 
    where 
      p.fulltext @@ to_tsquery(
        'english', ${sql.lit(
          searchTerms
            .map((term) => term + (term.length > 3 ? ':*' : ':'))
            .join(' | ')
        )}
        )
  ), relation as (
    select 
      p.id,
      p.customer_id,
      p.rating,
      p.chip_number,
      p.name,
      p.breed,
      p.gender,
      p.sterilized,
      p.chemical_sterilization_date,
      p.birth_date,
      p.color,
      p.medicines,
      p.food,
      p.weight,
      p.deceased,
      p.particularities,
      p.comments,
      c.last_name
    from 
      pets p 
      inner join customers c on p.customer_id = c.id 
    where 
      c.fulltext @@ to_tsquery(
        'english', ${sql.lit(
          searchTerms
            .map((term) => term + (term.length > 3 ? ':*' : ':'))
            .join(' | ')
        )}
      )
  )
  select distinct on (id) * from main union select * from relation;
  `

    const results = await query.execute(db)
    return results.rows
  } catch (e) {
    return []
  }
}

export async function deletePet(id: number) {
  return db.deleteFrom('pets').where('id', '=', id).executeTakeFirst()
}

export async function setPetRelation({
  petId1,
  petId2,
  rating
}: {
  petId1: number
  petId2: number
  rating: number
}) {
  return db
    .insertInto('petRelations')
    .values({
      petId1: petId1 < petId2 ? petId1 : petId2,
      petId2: petId1 < petId2 ? petId2 : petId1,
      rating
    })
    .onConflict((oc) =>
      oc.columns(['petId1', 'petId2']).doUpdateSet({
        rating: (eb) => eb.ref('excluded.rating')
      })
    )
    .execute()
}

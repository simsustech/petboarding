import { Database, db } from '../kysely/index.js'
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres'
import { convertImageSql } from './index.js'
import type { Pets } from '../kysely/types.d.ts'
import env from '@vitrify/tools/env'
import {
  type Insertable,
  type Selectable,
  type Updateable,
  type ExpressionBuilder,
  sql
} from 'kysely'
import { Vaccination } from 'src/zod'
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
        convertImageSql.as('image')
      ])
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

function find({
  criteria,
  select,
  relations
}: {
  criteria: Partial<Pet> & { ids?: number[] }
  select?: (keyof Pet)[]
  relations?: {
    vaccinations?: boolean
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

  if (criteria.deceased) {
    query = query.where('deceased', '=', criteria.deceased)
  }

  if (relations?.vaccinations) {
    query = query.select([withVaccinations, withValidVaccinations])
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
          searchTerms.map((term) => term + ':*').join(' | ')
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
          searchTerms.map((term) => term + ':*').join(' | ')
        )}
      )
  )
  select distinct on (id) * from main union select * from relation;
  `

  const results = await query.execute(db)
  return results.rows
}

export async function deletePet(id: number) {
  return db.deleteFrom('pets').where('id', '=', id).executeTakeFirst()
}

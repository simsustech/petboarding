import { convertImageSql } from './index.js'
import { db } from '../kysely/index.js'
import type { Vaccinations } from '../kysely/types.d.ts'

import type { Insertable, Selectable, Updateable } from 'kysely'
type Vaccination = Selectable<Vaccinations>
type NewVaccination = Insertable<Vaccinations>
type VaccinationUpdate = Updateable<Vaccinations>

const defaultSelect = [
  'id',
  'petId',
  'types',
  'expirationDate'
] as (keyof Vaccination)[]

function find({
  criteria,
  select
}: {
  criteria: Partial<Vaccination>
  select?: (keyof Vaccination)[]
}) {
  if (select) select = [...defaultSelect, ...select]
  else select = [...defaultSelect]

  let query = db.selectFrom('vaccinations')

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  }

  if (criteria.expirationDate) {
    query = query.where('expirationDate', '>', criteria.expirationDate)
  }

  return query.select(select).select([convertImageSql.as('image')])
}

export async function findVaccination({
  criteria,
  select
}: {
  criteria: Partial<Vaccination>
  select?: (keyof Vaccination)[]
}) {
  const query = find({ criteria, select })

  return query.executeTakeFirst()
}

export async function findVaccinations({
  criteria,
  select
}: {
  criteria: Partial<Vaccination>
  select?: (keyof Vaccination)[]
}) {
  const query = find({
    criteria,
    select
  })
  return query.execute()
}

export async function createVaccination(vaccination: NewVaccination) {
  return db
    .insertInto('vaccinations')
    .values(vaccination)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateVaccination(
  criteria: Partial<Vaccination>,
  updateWith: VaccinationUpdate
) {
  let query = db.updateTable('vaccinations')

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  }

  return query.set(updateWith).executeTakeFirstOrThrow()
}

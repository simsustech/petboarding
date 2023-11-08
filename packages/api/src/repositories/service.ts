import { db } from '../kysely/index.js'
import type { Services } from '../kysely/types.d.ts'

import type { Insertable, Selectable, Updateable } from 'kysely'
export type Service = Selectable<Services>
type NewService = Insertable<Services>
type ServiceUpdate = Updateable<Services>

const defaultSelect = [
  'id',
  'name',
  'type',
  'listPrice',
  'disabled',
  'hidden',
  'description'
] as (keyof Service)[]

function find({
  criteria,
  select
}: {
  criteria: Partial<Service>
  select?: (keyof Service)[]
}) {
  if (select) select = [...defaultSelect, ...select]
  else select = [...defaultSelect]

  let query = db.selectFrom('services')

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  }

  return query.select(select)
}

export async function findService({
  criteria,
  select
}: {
  criteria: Partial<Service>
  select?: (keyof Service)[]
}) {
  const query = find({ criteria, select })

  return query.executeTakeFirst()
}

export async function findServices({
  criteria,
  select
}: {
  criteria: Partial<Service>
  select?: (keyof Service)[]
}) {
  const query = find({
    criteria,
    select
  })
  return query.execute()
}

export async function createService(service: NewService) {
  return db
    .insertInto('services')
    .values(service)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateService(
  criteria: Partial<Service>,
  updateWith: ServiceUpdate
) {
  let query = db.updateTable('services')

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  }

  return query.set(updateWith).executeTakeFirstOrThrow()
}

export async function deleteService(id: number) {
  return db.deleteFrom('services').where('id', '=', id).executeTakeFirst()
}

import { db } from '../kysely/index.js'
import type { Services } from '../kysely/types.ts'

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
  select,
  pagination
}: {
  criteria: Partial<Service>
  select?: (keyof Service)[]
  pagination?: {
    limit: number
    offset: number
    sortBy: 'name' | 'type' | 'listPrice' | null
    descending: boolean
  }
}) {
  if (select) select = [...defaultSelect, ...select]
  else select = [...defaultSelect]

  let query = db.selectFrom('services')

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  }

  if (pagination) {
    if (pagination.sortBy)
      query = query.orderBy(
        pagination.sortBy,
        pagination.descending ? 'desc' : 'asc'
      )

    query = query.limit(pagination.limit).offset(pagination.offset)
  }

  return query
    .select(select)
    .$if(pagination !== void 0, (qb) =>
      qb.select((seb) =>
        seb.cast<number>(seb.fn.count('id').over(), 'integer').as('total')
      )
    )
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
  select,
  pagination
}: {
  criteria: Partial<Service>
  select?: (keyof Service)[]
  pagination?: {
    limit: number
    offset: number
    sortBy: 'name' | 'type' | 'listPrice' | null
    descending: boolean
  }
}) {
  const query = find({
    criteria,
    select,
    pagination
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

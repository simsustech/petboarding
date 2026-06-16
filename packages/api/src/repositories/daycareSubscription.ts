import { db } from '../kysely/index.js'
import type { DaycareSubscriptions } from '../kysely/types.ts'

import type { Insertable, Selectable, Updateable } from 'kysely'
export type DaycareSubscription = Selectable<DaycareSubscriptions>
type NewDaycareSubscription = Insertable<DaycareSubscriptions>
type DaycareSubscriptionUpdate = Updateable<DaycareSubscriptions>

const defaultSelect = [
  'id',
  'description',
  'listPrice',
  'numberOfDays',
  'validityPeriod'
] as (keyof DaycareSubscription)[]

function find({
  criteria,
  select,
  pagination
}: {
  criteria: Partial<DaycareSubscription>
  select?: (keyof DaycareSubscription)[]
  pagination?: {
    limit: number
    offset: number
    sortBy: 'description' | 'numberOfDays' | 'listPrice' | null
    descending: boolean
  }
}) {
  if (select) select = [...defaultSelect, ...select]
  else select = [...defaultSelect]

  let query = db.selectFrom('daycareSubscriptions')

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

export async function findDaycareSubscription({
  criteria,
  select
}: {
  criteria: Partial<DaycareSubscription>
  select?: (keyof DaycareSubscription)[]
}) {
  const query = find({ criteria, select })

  return query.executeTakeFirst()
}

export async function findDaycareSubscriptions({
  criteria,
  select,
  pagination
}: {
  criteria: Partial<DaycareSubscription>
  select?: (keyof DaycareSubscription)[]
  pagination?: {
    limit: number
    offset: number
    sortBy: 'description' | 'numberOfDays' | 'listPrice' | null
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

export async function createDaycareSubscription(
  daycareSubscription: NewDaycareSubscription
) {
  return db
    .insertInto('daycareSubscriptions')
    .values(daycareSubscription)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateDaycareSubscription(
  criteria: Partial<DaycareSubscription>,
  updateWith: DaycareSubscriptionUpdate
) {
  let query = db.updateTable('daycareSubscriptions')

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  }

  return query.set(updateWith).executeTakeFirstOrThrow()
}

export async function deleteDaycareSubscription(id: number) {
  return db
    .deleteFrom('daycareSubscriptions')
    .where('id', '=', id)
    .executeTakeFirst()
}

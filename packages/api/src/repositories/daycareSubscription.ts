import { db } from '../kysely/index.js'
import type { DaycareSubscriptions } from '../kysely/types.d.ts'

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
  select
}: {
  criteria: Partial<DaycareSubscription>
  select?: (keyof DaycareSubscription)[]
}) {
  if (select) select = [...defaultSelect, ...select]
  else select = [...defaultSelect]

  let query = db.selectFrom('daycareSubscriptions')

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  }

  return query.select(select)
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
  select
}: {
  criteria: Partial<DaycareSubscription>
  select?: (keyof DaycareSubscription)[]
}) {
  const query = find({
    criteria,
    select
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

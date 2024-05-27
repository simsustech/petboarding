import { db } from '../kysely/index.js'
import type { Periods } from '../kysely/types.d.ts'

import type { Insertable, Selectable, Updateable } from 'kysely'
type Period = Selectable<Periods>
type NewPeriod = Insertable<Periods>
type PeriodUpdate = Updateable<Periods>

const defaultSelect = [
  'id',
  'startDate',
  'endDate',
  'type',
  'comments',
  'minimumRatingForException'
] as (keyof Period)[]

function find({
  criteria,
  select
}: {
  criteria: Partial<Period> & { from?: string }
  select?: (keyof Period)[]
}) {
  if (select) select = [...defaultSelect, ...select]
  else select = [...defaultSelect]

  let query = db.selectFrom('periods')

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  }

  if (criteria.from) {
    query = query.where('endDate', '>=', criteria.from)
  }

  if (criteria.endDate) {
    query = query.where('endDate', '>', criteria.endDate)
  }

  return query.select(select)
}

export async function findPeriod({
  criteria,
  select
}: {
  criteria: Partial<Period> & { from?: string }
  select?: (keyof Period)[]
}) {
  const query = find({ criteria, select })

  return query.executeTakeFirst()
}

export async function findPeriods({
  criteria,
  select
}: {
  criteria: Partial<Period> & { from?: string }
  select?: (keyof Period)[]
}) {
  const query = find({
    criteria,
    select
  })
  return query.orderBy('startDate').execute()
}

export async function createPeriod(period: NewPeriod) {
  return db
    .insertInto('periods')
    .values(period)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updatePeriod(
  criteria: Partial<Period>,
  updateWith: PeriodUpdate
) {
  let query = db.updateTable('periods')

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  }

  return query.set(updateWith).executeTakeFirstOrThrow()
}

export async function deletePeriod(id: number) {
  return db.deleteFrom('periods').where('id', '=', id).executeTakeFirst()
}

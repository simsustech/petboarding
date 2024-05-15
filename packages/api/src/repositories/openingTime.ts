import Holidays from 'date-holidays'
import { db } from '../kysely/index.js'
import type { OpeningTimes } from '../kysely/types.d.ts'

import type { Insertable, Selectable, Updateable } from 'kysely'
export type OpeningTime = Selectable<OpeningTimes>
type NewOpeningTime = Insertable<OpeningTimes>
type OpeningTimeUpdate = Updateable<OpeningTimes>

const defaultSelect = [
  'id',
  'startTime',
  'endTime',
  'startDayCounted',
  'endDayCounted',
  'daysOfWeek',
  'disabled',
  'unavailableHolidays',
  'name',
  'type'
] as (keyof OpeningTime)[]

function checkAvailableOnDate({
  openingTime,
  date
}: {
  openingTime: OpeningTime
  date: string
}) {
  const holidays = new Holidays()
  if (openingTime.unavailableHolidays && openingTime.daysOfWeek) {
    openingTime.unavailableHolidays.forEach((holiday) => {
      holidays.setHoliday(holiday, 'en')
    })

    if (
      !openingTime.daysOfWeek.includes(new Date(date).getDay()) ||
      holidays.isHoliday(new Date(date))
    ) {
      return false
    }
  }
  return true
}

function find({
  criteria,
  select
}: {
  criteria: Partial<OpeningTime>
  select?: (keyof OpeningTime)[]
}) {
  if (select) select = [...defaultSelect, ...select]
  else select = [...defaultSelect]

  let query = db.selectFrom('openingTimes')

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  }

  return query.select(select)
}

export async function findOpeningTime({
  criteria,
  select
}: {
  criteria: Partial<OpeningTime>
  select?: (keyof OpeningTime)[]
}) {
  const query = find({ criteria, select })

  return query.executeTakeFirst()
}

export async function findOpeningTimes({
  criteria,
  select,
  availableOnDate
}: {
  criteria: Partial<OpeningTime>
  select?: (keyof OpeningTime)[]
  availableOnDate?: string
}) {
  const query = find({
    criteria,
    select
  })
  const result = await query.execute()
  if (availableOnDate) {
    return result.filter((openingTime) =>
      checkAvailableOnDate({
        openingTime,
        date: availableOnDate
      })
    )
  }
  return result
}

export async function createOpeningTime(openingTime: NewOpeningTime) {
  return db
    .insertInto('openingTimes')
    .values(openingTime)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateOpeningTime(
  criteria: Partial<OpeningTime>,
  updateWith: OpeningTimeUpdate
) {
  let query = db.updateTable('openingTimes')

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  }

  return query.set(updateWith).executeTakeFirstOrThrow()
}

export async function deleteOpeningTime(id: number) {
  return db.deleteFrom('openingTimes').where('id', '=', id).executeTakeFirst()
}

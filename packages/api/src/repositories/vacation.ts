import { db } from '../kysely/index.js'
import type { Vacations } from '../kysely/types.js'
import type { Insertable, Selectable, Updateable } from 'kysely'

type Vacation = Selectable<Vacations>
type NewVacation = Insertable<Vacations>
type VacationUpdate = Updateable<Vacations>

const defaultSelect = [
  'id',
  'name',
  'startDate',
  'endDate',
  'surchargePerDay'
] as (keyof Vacation)[]

export async function findVacations(criteria?: {
  from?: string
  until?: string
}): Promise<Vacation[]> {
  let query = db.selectFrom('vacations').select(defaultSelect)

  if (criteria?.from) {
    query = query.where('endDate', '>=', criteria.from)
  }

  if (criteria?.until) {
    query = query.where('startDate', '<=', criteria.until)
  }

  return query.orderBy('startDate', 'asc').execute()
}

export async function createVacation(vacation: NewVacation) {
  return db
    .insertInto('vacations')
    .values(vacation)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateVacation(
  criteria: { id: number },
  updateWith: VacationUpdate
) {
  return db
    .updateTable('vacations')
    .set(updateWith)
    .where('id', '=', criteria.id)
    .executeTakeFirstOrThrow()
}

export async function deleteVacation(id: number) {
  return db.deleteFrom('vacations').where('id', '=', id).executeTakeFirst()
}

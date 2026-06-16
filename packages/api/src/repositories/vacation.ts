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

export async function findVacations(
  criteria?: {
    from?: string
    until?: string
  },
  pagination?: {
    limit: number
    offset: number
    sortBy: 'name' | 'startDate' | null
    descending: boolean
  }
): Promise<Vacation[]> {
  let query = db.selectFrom('vacations').select(defaultSelect)

  if (criteria?.from) {
    query = query.where('endDate', '>=', criteria.from)
  }

  if (criteria?.until) {
    query = query.where('startDate', '<=', criteria.until)
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
    .$if(pagination !== void 0, (qb) =>
      qb.select((seb) =>
        seb.cast<number>(seb.fn.count('id').over(), 'integer').as('total')
      )
    )
    .orderBy('startDate', 'asc')
    .execute()
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

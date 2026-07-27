import { type ExpressionBuilder, sql } from 'kysely'
import { type Database, db } from '../kysely/index.js'
import type { Kennels } from '../kysely/types.js'
import {
  BOOKING_STATUS,
  DAYCARE_DATE_STATUS
} from '@petboarding/tools/constants'

import type { Insertable, Selectable, Updateable } from 'kysely'
import { jsonObjectFrom } from 'kysely/helpers/postgres'
import { convertImageSql } from './index.js'
import { withRelations, withValidVaccinations } from './pet.js'
type Kennel = Selectable<Kennels>
type NewKennel = Insertable<Kennels>
type KennelUpdate = Updateable<Kennels>

const defaultSelect = [
  'id',
  'name',
  'description',
  'capacity',
  'order',
  'buildingId'
] as (keyof Kennel)[]

function withBuilding(eb: ExpressionBuilder<Database, 'kennels'>) {
  return jsonObjectFrom(
    eb
      .selectFrom('buildings')
      .selectAll()
      .whereRef('kennels.buildingId', '=', 'buildings.id')
  ).as('building')
}

function find({
  criteria,
  select,
  pagination
}: {
  criteria: Partial<Kennel>
  select?: (keyof Kennel)[]
  pagination?: {
    limit: number
    offset: number
    sortBy: 'name' | 'capacity' | 'order' | null
    descending: boolean
  }
}) {
  if (select) select = [...defaultSelect, ...select]
  else select = [...defaultSelect]

  let query = db.selectFrom('kennels')

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  }

  if (criteria.name) {
    query = query.where('name', '=', criteria.name)
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
    .select([withBuilding])
    .$if(pagination !== void 0, (qb) =>
      qb.select((seb) =>
        seb.cast<number>(seb.fn.count('id').over(), 'integer').as('total')
      )
    )
}

export async function findKennel({
  criteria,
  select
}: {
  criteria: Partial<Kennel>
  select?: (keyof Kennel)[]
}) {
  const query = find({ criteria, select })

  return query.executeTakeFirst()
}

export async function findKennels({
  criteria,
  select,
  pagination
}: {
  criteria: Partial<Kennel>
  select?: (keyof Kennel)[]
  pagination?: {
    limit: number
    offset: number
    sortBy: 'name' | 'capacity' | 'order' | null
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

export async function createKennel(kennel: NewKennel) {
  return db
    .insertInto('kennels')
    .values({
      name: kennel.name,
      buildingId: kennel.buildingId,
      description: kennel.description,
      order: kennel.order,
      capacity: kennel.capacity
    })
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateKennel(
  criteria: Partial<Kennel>,
  updateWith: KennelUpdate
) {
  let query = db.updateTable('kennels')

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  }

  return query
    .set({
      name: updateWith.name,
      buildingId: updateWith.buildingId,
      description: updateWith.description,
      order: updateWith.order,
      capacity: updateWith.capacity
    })
    .executeTakeFirstOrThrow()
}

export async function deleteKennel(id: number) {
  return db.deleteFrom('kennels').where('id', '=', id).executeTakeFirst()
}

export async function getBookingPetKennels(date: string) {
  return db
    .selectFrom('pets')
    .innerJoin('bookingPetKennel', 'pets.id', 'bookingPetKennel.petId')
    .innerJoin('bookings', 'bookings.id', 'bookingPetKennel.bookingId')
    .leftJoinLateral(
      (eb) =>
        eb
          .selectFrom('bookingPetKennelOverride as bpk_o')
          .select(['bpk_o.kennelId', 'bpk_o.bookingId as has_override'])
          .whereRef('bpk_o.bookingId', '=', 'bookingPetKennel.bookingId')
          .whereRef('bpk_o.petId', '=', 'bookingPetKennel.petId')
          .whereRef('bpk_o.date', '<=', sql<string>`${date}::date`)
          .whereRef('bpk_o.date', '>=', 'bookings.startDate')
          .whereRef('bpk_o.date', '<=', 'bookings.endDate')
          .orderBy('bpk_o.date', 'desc')
          .limit(1)
          .as('override'),
      (join) => join.onTrue()
    )
    .where('bookings.startDate', '<=', date)
    .where('bookings.endDate', '>=', date)
    .where(({ eb, selectFrom }) =>
      eb(
        'bookings.id',
        '=',
        selectFrom('bookingStatus')
          .whereRef('bookingStatus.bookingId', '=', 'bookings.id')
          .where(
            'bookingStatus.modifiedAt',
            '=',
            sql<string>`(select max(modified_at) from booking_status where booking_status.booking_id = bookings.id)`
          )
          .where((web) =>
            web.or([
              web('bookingStatus.status', '=', BOOKING_STATUS.APPROVED),
              web(
                'bookingStatus.status',
                '=',
                BOOKING_STATUS.AWAITING_DOWNPAYMENT
              )
            ])
          )
          .select('bookingStatus.bookingId')
      )
    )
    .select((seb) => [
      'pets.id as id',
      'pets.species as species',
      'pets.name as name',
      'pets.medicines as medicines',
      'pets.food as food',
      seb
        .case()
        .when('bookings.startDate', '=', date)
        .then(
          seb
            .selectFrom('bookings')
            .whereRef('bookings.id', '=', 'bookingPetKennel.bookingId')
            .select('bookings.startTimeId')
        )
        .else(undefined)
        .end()
        .as('arrivalTimeId'),
      seb
        .case()
        .when('bookings.endDate', '=', date)
        .then(
          seb
            .selectFrom('bookings')
            .whereRef('bookings.id', '=', 'bookingPetKennel.bookingId')
            .select('bookings.endTimeId')
        )
        .else(undefined)
        .end()
        .as('departureTimeId'),
      convertImageSql.as('image'),
      seb
        .case()
        .when('override.has_override', 'is not', null)
        .then(sql`override.kennel_id`)
        .else(sql`booking_pet_kennel.kennel_id`)
        .end()
        .as('kennelId'),
      'bookingPetKennel.bookingId as bookingId',
      jsonObjectFrom(
        seb
          .selectFrom('customers')
          .select('customers.lastName')
          .whereRef('customers.id', '=', 'pets.customerId')
      ).as('customer'),
      withValidVaccinations,
      withRelations,
      withAlerts(date)
    ])
    .execute()
}

export async function getDaycareDatePetKennels(date: string) {
  return db
    .selectFrom('pets')
    .innerJoin('daycareDatePetKennel', 'pets.id', 'daycareDatePetKennel.petId')
    .innerJoin(
      'daycareDates',
      'daycareDates.id',
      'daycareDatePetKennel.daycareDateId'
    )
    .where('daycareDates.date', '=', date)
    .where('daycareDates.status', '=', DAYCARE_DATE_STATUS.APPROVED)
    .select((seb) => [
      'pets.id as id',
      'pets.species as species',
      'pets.name as name',
      'pets.medicines as medicines',
      'pets.food as food',
      convertImageSql.as('image'),
      'daycareDatePetKennel.kennelId as kennelId',
      'daycareDatePetKennel.daycareDateId as daycareDateId',
      jsonObjectFrom(
        seb
          .selectFrom('customers')
          .select('customers.lastName')
          .whereRef('customers.id', '=', 'pets.customerId')
      ).as('customer'),
      withValidVaccinations,
      withRelations,
      withAlerts(date)
    ])
    .execute()
}

export async function setBookingPetKennel(bookingPetKennel: {
  id: number
  kennelId: number | null
  bookingId: number
}) {
  return db
    .updateTable('bookingPetKennel')
    .where('bookingPetKennel.petId', '=', bookingPetKennel.id)
    .where('bookingPetKennel.bookingId', '=', bookingPetKennel.bookingId)
    .set({
      kennelId: bookingPetKennel.kennelId
    })
    .execute()
}

export async function setDaycareDatePetKennel(daycareDatePetKennel: {
  id: number
  kennelId: number | null
  daycareDateId: number
}) {
  return db
    .updateTable('daycareDatePetKennel')
    .where('daycareDatePetKennel.petId', '=', daycareDatePetKennel.id)
    .where(
      'daycareDatePetKennel.daycareDateId',
      '=',
      daycareDatePetKennel.daycareDateId
    )
    .set({
      kennelId: daycareDatePetKennel.kennelId
    })
    .execute()
}

export async function setBookingPetKennelForDate(input: {
  bookingId: number
  petId: number
  date: string
  kennelId: number
}) {
  return db
    .insertInto('bookingPetKennelOverride')
    .values({
      bookingId: input.bookingId,
      petId: input.petId,
      date: input.date,
      kennelId: input.kennelId
    })
    .onConflict((oc) =>
      oc.columns(['bookingId', 'petId', 'date']).doUpdateSet({
        kennelId: input.kennelId
      })
    )
    .execute()
}

export async function clearForwardBookingPetKennelOverrides(input: {
  bookingId: number
  petId: number
  fromDate: string
}) {
  return db.transaction().execute(async (trx) => {
    await trx
      .deleteFrom('bookingPetKennelOverride')
      .where('bookingId', '=', input.bookingId)
      .where('petId', '=', input.petId)
      .where('date', '>=', input.fromDate)
      .execute()
    await trx
      .insertInto('bookingPetKennelOverride')
      .values({
        bookingId: input.bookingId,
        petId: input.petId,
        date: input.fromDate,
        kennelId: null
      })
      .onConflict((oc) =>
        oc.columns(['bookingId', 'petId', 'date']).doUpdateSet({
          kennelId: null
        })
      )
      .execute()
  })
}

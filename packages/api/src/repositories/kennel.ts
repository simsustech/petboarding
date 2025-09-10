import { ExpressionBuilder, sql } from 'kysely'
import { Database, db } from '../kysely/index.js'
import {
  BOOKING_STATUS,
  DAYCARE_DATE_STATUS,
  type Kennels
} from '../kysely/types.js'

import type { Insertable, Selectable, Updateable } from 'kysely'
import { jsonObjectFrom } from 'kysely/helpers/postgres'
import { convertImageSql } from './index.js'
import { withValidVaccinations } from './pet.js'
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
  select
}: {
  criteria: Partial<Kennel>
  select?: (keyof Kennel)[]
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

  return query.select(select).select([withBuilding])
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
  select
}: {
  criteria: Partial<Kennel>
  select?: (keyof Kennel)[]
}) {
  const query = find({
    criteria,
    select
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
      'bookingPetKennel.kennelId as kennelId',
      'bookingPetKennel.bookingId as bookingId',
      jsonObjectFrom(
        seb
          .selectFrom('customers')
          .select('customers.lastName')
          .whereRef('customers.id', '=', 'pets.customerId')
      ).as('customer'),
      withValidVaccinations
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
      withValidVaccinations
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

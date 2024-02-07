import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres'
import { Database, db } from '../kysely/index.js'
import env from '@vitrify/tools/env'
import {
  eachDayOfInterval,
  getOverlappingDaysInIntervals,
  parse,
  isBefore,
  isWithinInterval,
  parseISO,
  subMonths
} from 'date-fns'
import Holidays from 'date-holidays'
import { findCategories } from './category.js'

import { BOOKING_STATUS } from '../zod/index.js'
import type { OpeningTime } from './openingTime.js'
import {
  withValidVaccinations,
  checkVaccinations,
  type ParsedPet
} from './pet.js'
import type { Category } from './category.js'
import {
  type Insertable,
  type Selectable,
  type Updateable,
  type ExpressionBuilder,
  sql
} from 'kysely'
import type { Service } from './service.js'
import type {
  Bookings,
  BookingStatus as BookingStatusDb
} from '../kysely/types.d.ts'
import type {
  OrderDiscount,
  OrderLine,
  OrderSurcharge
} from '@modular-api/fastify-cart'
import { computedOrderSelect } from '@modular-api/fastify-cart'
import { BookingCostsHandler } from 'src/petboarding'
import { FastifyInstance } from 'fastify'
export type Booking = Selectable<Bookings>
type NewBooking = Insertable<Bookings>
type BookingUpdate = Updateable<Bookings>

type BookingStatus = Selectable<BookingStatusDb>

export interface BookingCosts {
  orderLines: OrderLine[]
  discounts: OrderDiscount[]
  surcharges: OrderSurcharge[]
}

export interface BookingService {
  id: number
  bookingId: number
  serviceId: number
  comments: string | null
  price: number | null
  listPrice: number | null
  service: Service | null
}

export type BookingPets = Pick<ParsedPet, 'id' | 'name' | 'categoryId'>[]
interface BookingCustomer {
  id: number
  gender: string
  firstName: string
  lastName: string
  address: string
  postalCode: string
  city: string
  telephoneNumber: string
  veterinarian: string
  accountId: number | null
}

export interface ParsedBooking extends Booking {
  days: number
  costs: BookingCosts
  startTime: OpeningTime | null
  endTime: OpeningTime | null
  customer: BookingCustomer | null
  pets: BookingPets
  services: BookingService[]
  status: BookingStatus | null
  statuses: BookingStatus[]
}

const defaultSelect = [
  'id',
  'startDate',
  'startTimeId',
  'endDate',
  'endTimeId',
  'comments',
  'customerId',
  'orderId'
] as (keyof Booking)[]

export const findIds = ({
  currentIds,
  newIds
}: {
  currentIds: number[]
  newIds: number[]
}) => {
  const createdIds = newIds.filter(
    (serviceId) => !currentIds.includes(serviceId)
  )
  const deletedIds = currentIds.filter(
    (serviceId) => !newIds.includes(serviceId)
  )
  return {
    createdIds,
    deletedIds
  }
}

function calculateBookingDays(
  booking: Omit<ParsedBooking, 'costs' | 'days' | 'status'>
) {
  if (booking.startTime && booking.endTime) {
    return (
      Math.ceil(
        (Date.parse(booking.endDate) - Date.parse(booking.startDate)) /
          (1000 * 3600 * 24)
      ) -
      1 +
      booking.startTime.startDayCounted +
      booking.endTime.endDayCounted
    )
  }
  return 0
}

async function calculateBookingCosts({
  booking,
  categories,
  withServices
}: {
  booking: Omit<ParsedBooking, 'costs' | 'status'>
  categories: Category[]
  withServices?: boolean
}): Promise<BookingCosts | null> {
  let orderLines: OrderLine[] = []
  let discounts: OrderDiscount[] = []
  let surcharges: OrderSurcharge[] = []
  if (
    booking.startDate &&
    booking.endDate &&
    booking.startTime &&
    booking.endTime &&
    booking.pets
  ) {
    if (!categories) {
      categories = await findCategories({
        criteria: {}
      })
    }
    const days = booking.days
    if (days && booking.pets && categories) {
      if (!booking.pets.every((pet) => pet.categoryId)) {
        return null
      }

      let bookingCostsHandler: BookingCostsHandler
      try {
        ;({ bookingCostsHandler } = await import('../api.config.js'))
        ;({ orderLines, discounts, surcharges } = bookingCostsHandler({
          period: {
            startDate: booking.startDate,
            endDate: booking.endDate,
            days
          },
          services: booking.services,
          pets: booking.pets,
          categories,
          withServices,
          dateFns: {
            eachDayOfInterval,
            getOverlappingDaysInIntervals,
            parse
          },
          dateHolidays: Holidays
        }))
      } catch (e) {
        console.error('Unable to load API config')
        orderLines = booking.pets.map((pet) => ({
          description: pet.name,
          listPrice:
            categories?.find((category) => category.id === pet.categoryId)
              ?.price || NaN,
          listPriceIncludesTax: true,
          quantity: days * 1000,
          quantityPerMille: true,
          discount: 0,
          taxRate: 21
        }))
        if (withServices) {
          for (const service of booking.services) {
            if (service.service && service.listPrice) {
              orderLines.push({
                description: service.service?.name,
                listPrice: service.listPrice,
                listPriceIncludesTax: true,
                quantity: 1,
                quantityPerMille: false,
                discount: 0,
                taxRate: 21
              })
            }
          }
        }
      }
    }
  }
  return {
    orderLines,
    discounts,
    surcharges
  }
}

function withCustomer(eb: ExpressionBuilder<Database, 'bookings'>) {
  return jsonObjectFrom(
    eb
      .selectFrom('customers')
      .select([
        'customers.id',
        'customers.accountId',
        'customers.firstName',
        'customers.lastName',
        'customers.gender',
        'customers.address',
        'customers.city',
        'customers.postalCode',
        'customers.telephoneNumber',
        'customers.veterinarian'
      ])
      .whereRef('bookings.customerId', '=', 'customers.id')
  ).as('customer')
}

function withPets(eb: ExpressionBuilder<Database, 'bookings'>) {
  return jsonArrayFrom(
    eb
      .selectFrom('pets')
      .innerJoin('bookingPetKennel', 'pets.id', 'bookingPetKennel.petId')
      .innerJoin('customers', 'pets.customerId', 'customers.id')
      .select(({ eb: ceb }) => [
        'pets.id',
        'pets.species',
        'pets.name',
        'pets.categoryId',
        'pets.breed',
        'pets.sterilized',
        'pets.gender',
        withValidVaccinations,
        jsonObjectFrom(
          ceb
            .selectFrom('customers')
            .select(['customers.id', 'customers.lastName'])
            .whereRef('customers.id', '=', 'pets.customerId')
        ).as('customer')
      ])
      .whereRef('bookings.id', '=', 'bookingPetKennel.bookingId')
  ).as('pets')
}

function withStartTime(eb: ExpressionBuilder<Database, 'bookings'>) {
  return jsonObjectFrom(
    eb
      .selectFrom('openingTimes')
      .select([
        'openingTimes.id',
        'openingTimes.name',
        'openingTimes.startTime',
        'openingTimes.endTime',
        'openingTimes.startDayCounted',
        'openingTimes.endDayCounted',
        'openingTimes.daysOfWeek',
        'openingTimes.disabled',
        'openingTimes.unavailableHolidays',
        'openingTimes.createdAt'
      ])
      .whereRef('bookings.startTimeId', '=', 'openingTimes.id')
  ).as('startTime')
}

function withEndTime(eb: ExpressionBuilder<Database, 'bookings'>) {
  return jsonObjectFrom(
    eb
      .selectFrom('openingTimes')
      .select([
        'openingTimes.id',
        'openingTimes.name',
        'openingTimes.startTime',
        'openingTimes.endTime',
        'openingTimes.startDayCounted',
        'openingTimes.endDayCounted',
        'openingTimes.daysOfWeek',
        'openingTimes.disabled',
        'openingTimes.unavailableHolidays',
        'openingTimes.createdAt'
      ])
      .whereRef('bookings.endTimeId', '=', 'openingTimes.id')
  ).as('endTime')
}

function withStatuses(eb: ExpressionBuilder<Database, 'bookings'>) {
  return jsonArrayFrom(
    eb
      .selectFrom('bookingStatus')
      .select([
        'bookingStatus.id',
        'bookingStatus.status',
        'bookingStatus.startDate',
        'bookingStatus.endDate',
        'bookingStatus.startTimeId',
        'bookingStatus.endTimeId',
        'bookingStatus.comments',
        'bookingStatus.modifiedAt',
        'bookingStatus.petIds',
        'bookingStatus.status',
        'bookingStatus.createdAt',
        'bookingStatus.bookingId'
      ])
      .select(({ eb: eb1 }) => [
        jsonObjectFrom(
          eb1
            .selectFrom('openingTimes')
            .select([
              'openingTimes.id',
              'openingTimes.name',
              'openingTimes.startTime',
              'openingTimes.endTime'
            ])
            .whereRef('bookingStatus.startTimeId', '=', 'openingTimes.id')
        ).as('startTime'),
        jsonObjectFrom(
          eb1
            .selectFrom('openingTimes')
            .select([
              'openingTimes.id',
              'openingTimes.name',
              'openingTimes.startTime',
              'openingTimes.endTime'
            ])
            .whereRef('bookingStatus.endTimeId', '=', 'openingTimes.id')
        ).as('endTime'),
        sql<number>`booking_status.end_date - 
          booking_status.start_date - 1
          + (select "opening_times"."start_day_counted" from "opening_times" where "booking_status"."start_time_id" = "opening_times"."id")
          + (select "opening_times"."end_day_counted" from "opening_times" where "booking_status"."end_time_id" = "opening_times"."id")
          `.as('days')
      ])
      .whereRef('bookings.id', '=', 'bookingStatus.bookingId')
  ).as('statuses')
}

function withStatus(eb: ExpressionBuilder<Database, 'bookings'>) {
  return jsonObjectFrom(
    eb
      .selectFrom('bookingStatus')
      .whereRef('bookingStatus.bookingId', '=', 'bookings.id')
      .whereRef(
        'bookingStatus.modifiedAt',
        '=',
        sql`(select max(modified_at) from booking_status where booking_status.booking_id = bookings.id)`
      )
      .select([
        'bookingStatus.id',
        'bookingStatus.status',
        'bookingStatus.startDate',
        'bookingStatus.endDate',
        'bookingStatus.startTimeId',
        'bookingStatus.endTimeId',
        'bookingStatus.comments',
        'bookingStatus.modifiedAt',
        'bookingStatus.petIds',
        'bookingStatus.status',
        'bookingStatus.createdAt',
        'bookingStatus.bookingId'
      ])
  ).as('status')
}

function withServices(eb: ExpressionBuilder<Database, 'bookings'>) {
  return jsonArrayFrom(
    eb
      .selectFrom('bookingService')
      .innerJoin('services', 'bookingService.serviceId', 'services.id')
      .select(({ eb: seb, fn }) => [
        'bookingService.id',
        'bookingService.bookingId',
        'bookingService.price',
        'bookingService.serviceId',
        'bookingService.comments',
        fn
          .coalesce('bookingService.price', 'services.listPrice')
          .as('listPrice'),
        jsonObjectFrom(
          seb
            .selectFrom('services')
            .select([
              'services.id',
              'services.name',
              'services.type',
              'services.listPrice',
              'services.description',
              'services.disabled',
              'services.hidden',
              'services.createdAt'
            ])
            .whereRef('services.id', '=', 'bookingService.serviceId')
        ).as('service')
      ])
      .whereRef('bookings.id', '=', 'bookingService.bookingId')
  ).as('services')
}

function withIsDoubleBooked(eb: ExpressionBuilder<Database, 'bookings'>) {
  return eb
    .exists(
      eb
        .selectFrom('daycareDates')
        .select([
          'daycareDates.date',
          'daycareDates.status',
          'daycareDates.customerId'
        ])
        .where('daycareDates.status', '=', 'approved')
        .whereRef('daycareDates.customerId', '=', 'bookings.customerId')
        .whereRef('daycareDates.date', '>=', 'bookings.startDate')
        .whereRef('daycareDates.date', '<=', 'bookings.endDate')
    )
    .or(
      eb.exists(
        eb
          .selectFrom('bookings as b')
          .select(['b.id', 'b.startDate', 'b.endDate', 'b.customerId'])
          .leftJoin('bookingStatus', 'b.id', 'bookingStatus.bookingId')
          .whereRef(
            'bookingStatus.modifiedAt',
            '=',
            sql`(select max(modified_at) from booking_status where booking_status.booking_id = b.id)`
          )
          .where('bookingStatus.status', '=', 'approved')
          .whereRef('bookings.id', '!=', 'b.id')
          .whereRef('bookings.customerId', '=', 'b.customerId')
          .whereRef('bookings.startDate', '<=', 'b.endDate')
          .whereRef('bookings.endDate', '>=', 'b.startDate')
      )
    )
    .as('isDoubleBooked')
}

function withOrder(eb: ExpressionBuilder<Database, 'bookings'>) {
  return jsonObjectFrom(
    eb
      .selectFrom('cart.orders')
      .whereRef('bookings.orderId', '=', 'cart.orders.id')
      .selectAll()
      .select(computedOrderSelect)
  ).as('order')
}

function find({
  criteria,
  select,
  relations
}: {
  criteria: Partial<Booking> & {
    status?: BOOKING_STATUS
    ids?: number[]
    from?: string
    until?: string
  }
  select?: (keyof Booking)[]
  relations?: {
    order?: boolean
  }
}) {
  if (select) select = [...defaultSelect, ...select]
  else select = [...defaultSelect]

  let query = db.selectFrom('bookings')

  if (criteria.ids && !criteria.ids.length) {
    throw new Error('ids array cannot be empty')
  }

  if (criteria.status) {
    query = query.where(({ eb, selectFrom }) =>
      eb(
        'bookings.id',
        '=',
        selectFrom('bookingStatus')
          .whereRef('bookingStatus.bookingId', '=', 'bookings.id')
          .where(
            'bookingStatus.modifiedAt',
            '=',
            sql`(select max(modified_at) from booking_status where booking_status.booking_id = bookings.id)`
          )
          .where('bookingStatus.status', '=', criteria.status!)
          .select('bookingStatus.bookingId')
      )
    )
  }

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  } else if (criteria.ids) {
    query = query.where('id', 'in', criteria.ids)
  }

  if (criteria.from) {
    query = query.where('endDate', '>=', criteria.from)
  }

  if (criteria.until) {
    query = query.where('startDate', '<=', criteria.until)
  }

  if (criteria.customerId) {
    query = query.where('customerId', '=', criteria.customerId)
  }

  if (relations) {
    if (relations.order) {
      query = query.select([withOrder])
    }
  }

  return query.select(select).select(({ selectFrom }) => [
    selectFrom('openingTimes')
      .select('openingTimes.startDayCounted')
      .whereRef('bookings.startTimeId', '=', 'openingTimes.id')
      .as('startDayCounted'),
    selectFrom('openingTimes')
      .select('openingTimes.endDayCounted')
      .whereRef('bookings.endTimeId', '=', 'openingTimes.id')
      .as('endDayCounted'),
    withCustomer,
    withPets,
    withStartTime,
    withEndTime,
    withServices,
    withStatuses,
    withStatus,
    withIsDoubleBooked,
    sql<number>`bookings.end_date - 
      bookings.start_date - 1
      + (select "opening_times"."start_day_counted" from "opening_times" where "bookings"."start_time_id" = "opening_times"."id")
      + (select "opening_times"."end_day_counted" from "opening_times" where "bookings"."end_time_id" = "opening_times"."id")
      `.as('days')
  ])
}

export async function findBooking({
  criteria,
  select,
  relations
}: {
  criteria: Partial<Booking> & {
    status?: BOOKING_STATUS
    ids?: number[]
    from?: string
    until?: string
  }
  select?: (keyof Booking)[]
  relations?: {
    order?: boolean
  }
}): Promise<ParsedBooking | undefined> {
  const query = find({ criteria, select, relations })

  const result = await query.executeTakeFirst()

  if (result) {
    const days = calculateBookingDays(result)

    result.pets = result.pets.map((pet) => {
      return {
        ...pet,
        hasMandatoryVaccinations: checkVaccinations({
          species: pet.species,
          validVaccinations: pet.validVaccinations
        })
      }
    })

    const categories = await db.selectFrom('categories').selectAll().execute()
    return {
      ...result,
      costs: await calculateBookingCosts({
        booking: { ...result, days },
        categories,
        withServices: true
      })
    }
  } else {
    return result
  }
}

export async function findBookings({
  criteria,
  select,
  limit,
  relations
}: {
  criteria: Partial<Booking> & {
    status?: BOOKING_STATUS
    ids?: number[]
    from?: string
    until?: string
  }
  select?: (keyof Booking)[]
  limit?: number
  relations?: {
    order?: boolean
  }
}): Promise<ParsedBooking[]> {
  let query = find({
    criteria,
    select,
    relations
  })

  if (limit) {
    query = query.limit(limit)
  }

  const results = await query.orderBy('id desc').execute()

  const categories = await db.selectFrom('categories').selectAll().execute()

  if (results) {
    results.forEach((booking) => {
      booking.pets = booking.pets.map((pet) => {
        return {
          ...pet,
          hasMandatoryVaccinations: checkVaccinations({
            species: pet.species,
            validVaccinations: pet.validVaccinations
          })
        }
      })
    })
  }
  const parsedResults = await Promise.all(
    results.map(async (result) => {
      const days = calculateBookingDays(result)

      const costs = await calculateBookingCosts({
        booking: { ...result, days },
        categories,
        withServices: true
      })

      return {
        ...result,
        costs
      }
    })
  )
  return parsedResults
}

export async function findBookingService({
  criteria
}: {
  criteria: Partial<BookingService>
}) {
  let query = db.selectFrom('bookingService')

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  }

  return query.selectAll().executeTakeFirstOrThrow()
}

export async function createBookingStatus({
  booking,
  petIds,
  status
}: {
  booking: Booking
  petIds: number[]
  status: BOOKING_STATUS
}) {
  await db
    .insertInto('bookingStatus')
    .values({
      bookingId: booking.id,
      startDate: booking.startDate,
      endDate: booking.endDate,
      startTimeId: booking.startTimeId,
      endTimeId: booking.endTimeId,
      comments: booking.comments,
      petIds: JSON.stringify(petIds),
      modifiedAt: new Date().toISOString(),
      status
    })
    .executeTakeFirstOrThrow()
}

export async function createBooking({
  booking,
  petIds,
  serviceIds,
  status
}: {
  booking: NewBooking
  petIds: number[]
  serviceIds: number[]
  status?: BOOKING_STATUS
}) {
  const newBooking = await db
    .insertInto('bookings')
    .values(booking)
    .returningAll()
    .executeTakeFirstOrThrow()

  await db
    .insertInto('bookingPetKennel')
    .values(
      petIds.map((petId) => ({
        petId,
        bookingId: newBooking.id
      }))
    )
    .executeTakeFirstOrThrow()

  if (serviceIds.length) {
    await db
      .insertInto('bookingService')
      .values(
        serviceIds.map((serviceId) => ({
          bookingId: newBooking.id,
          serviceId
        }))
      )
      .executeTakeFirstOrThrow()
  }

  await createBookingStatus({
    booking: newBooking,
    petIds,
    status: status || BOOKING_STATUS.PENDING
  })

  return newBooking
}

export async function updateBooking(
  criteria: Partial<Booking>,
  updateWith: {
    booking: BookingUpdate
    petIds: number[]
    serviceIds: number[]
    status?: BOOKING_STATUS
  },
  options?: {
    skipStatusUpdate?: boolean
  }
) {
  let query = db.updateTable('bookings')

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  }

  if (criteria.customerId) {
    query = query.where('customerId', '=', criteria.customerId)
  }
  const updatedBooking = await query
    .set(updateWith.booking)
    .returningAll()
    .executeTakeFirstOrThrow()

  if (Array.isArray(updateWith.petIds)) {
    await db
      .deleteFrom('bookingPetKennel')
      .where('bookingId', '=', updatedBooking.id)
      .executeTakeFirstOrThrow()

    await db
      .insertInto('bookingPetKennel')
      .values(
        updateWith.petIds.map((petId) => ({
          petId,
          bookingId: updatedBooking.id
        }))
      )
      .executeTakeFirstOrThrow()
  }

  if (Array.isArray(updateWith.serviceIds)) {
    const currentServiceIds = (
      await db
        .selectFrom('bookingService')
        .select('id')
        .where('bookingService.bookingId', '=', updatedBooking.id)
        .execute()
    ).map(({ id }) => id)

    const { createdIds: newServiceIds, deletedIds: deletedServiceIds } =
      findIds({
        currentIds: currentServiceIds,
        newIds: updateWith.serviceIds
      })

    if (deletedServiceIds.length)
      await db
        .deleteFrom('bookingService')
        .where('id', 'in', deletedServiceIds)
        .execute()

    if (newServiceIds.length)
      await db
        .insertInto('bookingService')
        .values(
          newServiceIds.map((id) => ({
            serviceId: id,
            bookingId: updatedBooking.id
          }))
        )
        .execute()
  }

  if (!options?.skipStatusUpdate) {
    await createBookingStatus({
      booking: updatedBooking,
      petIds: updateWith.petIds,
      status: updateWith.status || BOOKING_STATUS.PENDING
    })
  }

  return updatedBooking
}

export async function cancelBooking(
  criteria: Partial<Booking>,
  reason: string,
  ignoreCancellationPeriod?: boolean
) {
  const booking = await findBooking({ criteria })
  if (
    booking?.startDate &&
    booking.startDate <= new Date().toISOString().slice(0, 10) &&
    !ignoreCancellationPeriod
  ) {
    throw new Error('You cannot cancel dates in the past')
  }

  if (booking) {
    let bookingCancellationHandler
    let status = BOOKING_STATUS.CANCELLED
    const days = booking.days
    try {
      ;({ bookingCancellationHandler } = await import('../api.config.js'))
      if (days) {
        ;({ status } = bookingCancellationHandler({
          period: {
            startDate: booking.startDate,
            endDate: booking.endDate,
            days
          },
          dateFns: {
            isBefore,
            isWithinInterval,
            parse,
            parseISO,
            subMonths
          }
        }))
      }
    } catch (e) {
      console.error('Unable to load API config')
      const maxCancellationDate = subMonths(
        parseISO(booking.startDate),
        env.read('CANCELLATION_PERIOD_MONTHS') ||
          env.read('VITE_CANCELLATION_PERIOD_MONTHS') ||
          0
      )

      status = isBefore(new Date(), maxCancellationDate)
        ? BOOKING_STATUS.CANCELLED
        : BOOKING_STATUS.CANCELLED_OUTSIDE_PERIOD
    }

    const petIds = booking.pets.map((pet) => pet.id)

    await createBookingStatus({
      booking: {
        ...booking,
        comments: reason
      },
      petIds,
      status: ignoreCancellationPeriod ? BOOKING_STATUS.CANCELLED : status
    })
    return true
  }
}

export async function updateBookingService(
  criteria: Partial<Booking>,
  updateWith: Partial<BookingService>
) {
  let query = db.updateTable('bookingService')

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  }

  return query.set(updateWith).returningAll().executeTakeFirstOrThrow()
}

export async function getBookingsCount(status: BOOKING_STATUS) {
  const count = (
    await db
      .selectFrom('bookings')
      .where(({ eb, selectFrom }) =>
        eb(
          'bookings.id',
          '=',
          selectFrom('bookingStatus')
            .whereRef('bookingStatus.bookingId', '=', 'bookings.id')
            .where(
              'bookingStatus.modifiedAt',
              '=',
              sql`(select max(modified_at) from booking_status where booking_status.booking_id = bookings.id)`
            )
            .where('bookingStatus.status', '=', status!)
            .select('bookingStatus.bookingId')
        )
      )
      .select(({ fn }) => [fn.count<number>('bookings.id').as('count')])
      .executeTakeFirst()
  )?.count

  return count
}

export async function createOrUpdateBookingOrder({
  booking,
  fastify
}: {
  booking: ParsedBooking
  fastify: FastifyInstance
}) {
  if (booking.orderId) await updateBookingOrder({ booking, fastify })
  else await createBookingOrder({ booking, fastify })
}

async function createBookingOrder({
  booking,
  fastify
}: {
  booking: ParsedBooking
  fastify: FastifyInstance
}) {
  const accountId = booking.customer?.accountId
  const bookingId = booking.id
  if (accountId && fastify.cart?.order) {
    if (!booking.costs) {
      throw new Error('No costs available for booking')
    }
    const result = await fastify.cart.order.createOrder({
      accountId,
      currency: 'EUR',
      ...booking.costs
    })
    if (result.success) {
      const orderId = result.order.id
      await db
        .updateTable('bookings')
        .where('bookings.id', '=', bookingId)
        .set('orderId', orderId)
        .execute()

      return orderId
    }
  }
}

async function updateBookingOrder({
  booking,
  fastify
}: {
  booking: ParsedBooking
  fastify: FastifyInstance
}) {
  const accountId = booking.customer?.accountId
  const orderId = booking.orderId
  if (orderId && accountId && fastify.cart?.order) {
    if (!booking.costs) {
      throw new Error('No costs available for booking')
    }
    const orderLines = await fastify.cart.order.getOrderLines({ orderId })
    for (const orderLine of orderLines) {
      fastify.cart.order.removeOrderLine({ id: orderLine.id! })
    }

    for (const orderLine of booking.costs.orderLines) {
      fastify.cart.order.addOrderLine({ ...orderLine, orderId })
    }
  }
}

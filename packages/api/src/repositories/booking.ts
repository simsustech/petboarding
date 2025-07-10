import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres'
import { Database, db } from '../kysely/index.js'
import env from '@vitrify/tools/env'
import {
  getOverlappingDaysInIntervals,
  parse,
  isBefore,
  isAfter,
  isWithinInterval,
  parseISO,
  subMonths,
  subDays,
  differenceInDays
} from 'date-fns'
import Holidays from 'date-holidays'
import { findCategories } from './category.js'

import {
  BOOKING_STATUS,
  DAYCARE_DATE_STATUS,
  PERIOD_TYPE
} from '../zod/index.js'
import type { OpeningTime } from './openingTime.js'
import {
  withValidVaccinations,
  checkVaccinations,
  type ParsedPet
} from './pet.js'
import type { ParsedCategory } from './category.js'
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
import {
  type RawInvoiceLine,
  type RawInvoiceDiscount,
  type RawInvoiceSurcharge,
  computeInvoiceCosts,
  type Invoice
} from '@modular-api/fastify-checkout'
import { InvoiceStatus } from '@modular-api/fastify-checkout/types'
import type { BookingCostsHandler } from '../petboarding.d.ts'
import { FastifyInstance } from 'fastify'
import { bookingEmailTemplates } from '../templates/email/bookings/index.js'
import { compileEmail } from '../trpc/admin/bookings.js'
import { findCustomer } from './customer.js'
import { bookingTemplates } from '../templates/booking/index.js'
import { eachDayOfInterval } from '../tools.js'

export type Booking = Selectable<Bookings>
type NewBooking = Insertable<Bookings>
type BookingUpdate = Updateable<Bookings>

type BookingOpeningTime = Pick<
  OpeningTime,
  'id' | 'name' | 'startTime' | 'startDayCounted' | 'endDayCounted' | 'endTime'
> | null

type BookingStatus = Selectable<BookingStatusDb> & {
  startTime: BookingOpeningTime | null
  endTime: BookingOpeningTime | null
}

export interface BookingCostItem {
  name: string
  price: number | null
  quantity?: number
  discount?: number
}

// export interface BookingCosts {
//   lines: RawInvoiceLine[]
//   discounts: RawInvoiceDiscount[]
//   surcharges: RawInvoiceSurcharge[]
// }
export interface BookingCosts {
  lines: ReturnType<typeof computeInvoiceCosts>['computedLines']
  discounts: ReturnType<typeof computeInvoiceCosts>['computedDiscounts']
  surcharges: ReturnType<typeof computeInvoiceCosts>['computedSurcharges']
  taxSummary: ReturnType<typeof computeInvoiceCosts>['taxSummary']
  totalIncludingTax: ReturnType<typeof computeInvoiceCosts>['totalIncludingTax']
  totalExcludingTax: ReturnType<typeof computeInvoiceCosts>['totalExcludingTax']
  requiredDownPaymentAmount?: number
}

export interface BookingService {
  id: number
  bookingId: number
  serviceId: number
  comments: string | null
  price: number | null
  listPrice: number | null
  service: Service
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
  costs: BookingCosts | null
  startTime: BookingOpeningTime | null
  endTime: BookingOpeningTime | null
  customer: BookingCustomer | null
  pets: BookingPets
  services: BookingService[]
  status: BookingStatus | null
  statuses: BookingStatus[]
  invoice?: Invoice | null
}

const defaultSelect = [
  'id',
  'startDate',
  'startTimeId',
  'endDate',
  'endTimeId',
  'comments',
  'customerId',
  'invoiceUuid'
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

export function calculateBookingDays(
  booking: Pick<
    ParsedBooking,
    | 'startTime'
    | 'startTimeId'
    | 'endTime'
    | 'endTimeId'
    | 'startDate'
    | 'endDate'
  >
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

export async function calculateBookingCosts({
  booking,
  categories,
  withServices
}: {
  booking: Omit<ParsedBooking, 'costs' | 'status' | 'statuses' | 'invoiceUuid'>
  categories: ParsedCategory[]
  withServices?: boolean
}): Promise<BookingCosts | null> {
  let lines: RawInvoiceLine[] = []
  let discounts: RawInvoiceDiscount[] = []
  let surcharges: RawInvoiceSurcharge[] = []
  let requiredDownPaymentAmount: number = 0
  if (
    booking.startDate &&
    booking.endDate &&
    booking.startTime &&
    booking.endTime &&
    booking.pets
  ) {
    if (!categories) {
      categories = await findCategories({
        criteria: {
          date: booking.startDate
        }
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
        ;({
          lines,
          discounts,
          surcharges,
          requiredDownPaymentAmount = 0
        } = bookingCostsHandler({
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
          dateHolidays: Holidays,
          computeInvoiceCosts
        }))
      } catch (e) {
        console.error('Unable to load API config')

        const findActualPrice = ({
          prices,
          date
        }: {
          prices?: { date: string; listPrice: number }[]
          date: string
        }) => {
          const sortedAndFiltered = prices
            ?.filter((price) => price.date <= date)
            .sort((a, b) => {
              return a.date < b.date ? 1 : a.date > b.date ? -1 : 0
            })

          return sortedAndFiltered?.at(0)?.listPrice || 0
        }

        lines = booking.pets.map((pet) => ({
          description: pet.name,
          listPrice: findActualPrice({
            prices: categories?.find(
              (category) => category.id === pet.categoryId
            )?.prices,
            date: booking.startDate
          }),
          listPriceIncludesTax: true,
          quantity: days * 1000,
          quantityPerMille: true,
          discount: 0,
          taxRate: 21
        }))
        if (withServices) {
          for (const service of booking.services) {
            if (service.service && service.listPrice) {
              lines.push({
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

  const {
    computedLines,
    computedDiscounts,
    computedSurcharges,
    taxSummary,
    totalExcludingTax,
    totalIncludingTax
  } = computeInvoiceCosts({
    lines,
    discounts,
    surcharges
  })
  return {
    lines: computedLines,
    discounts: computedDiscounts,
    surcharges: computedSurcharges,
    taxSummary,
    totalExcludingTax,
    totalIncludingTax,
    requiredDownPaymentAmount
  }
}

async function getBookingInvoice({
  booking,
  fastify
}: {
  booking: Booking
  fastify?: FastifyInstance
}) {
  try {
    if (!booking.invoiceUuid || !fastify?.slimfact)
      throw new Error('Invoice UUID or fastify not defined')

    const invoice = await fastify.slimfact.admin.getInvoice.query({
      uuid: booking.invoiceUuid
    })
    return invoice
  } catch (e) {
    fastify?.log.debug(e)
    return null
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
        'pets.medicines',
        'pets.food',
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
        'openingTimes.endDayCounted'
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
        'openingTimes.endDayCounted'
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
              'openingTimes.endTime',
              'openingTimes.startDayCounted',
              'openingTimes.endDayCounted'
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
              'openingTimes.endTime',
              'openingTimes.startDayCounted',
              'openingTimes.endDayCounted'
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
      .orderBy('bookingStatus.modifiedAt', 'desc')
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
      .select(({ eb: eb1 }) => [
        jsonObjectFrom(
          eb1
            .selectFrom('openingTimes')
            .select([
              'openingTimes.id',
              'openingTimes.name',
              'openingTimes.startTime',
              'openingTimes.endTime',
              'openingTimes.startDayCounted',
              'openingTimes.endDayCounted'
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
              'openingTimes.endTime',
              'openingTimes.startDayCounted',
              'openingTimes.endDayCounted'
            ])
            .whereRef('bookingStatus.endTimeId', '=', 'openingTimes.id')
        ).as('endTime'),
        sql<number>`booking_status.end_date - 
          booking_status.start_date - 1
          + (select "opening_times"."start_day_counted" from "opening_times" where "booking_status"."start_time_id" = "opening_times"."id")
          + (select "opening_times"."end_day_counted" from "opening_times" where "booking_status"."end_time_id" = "opening_times"."id")
          `.as('days')
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
        .where('daycareDates.status', '=', DAYCARE_DATE_STATUS.APPROVED)
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
            sql<string>`(select max(modified_at) from booking_status where booking_status.booking_id = b.id)`
          )
          .where('bookingStatus.status', '=', BOOKING_STATUS.APPROVED)
          .whereRef('bookings.id', '!=', 'b.id')
          .whereRef('bookings.customerId', '=', 'b.customerId')
          .whereRef('bookings.startDate', '<=', 'b.endDate')
          .whereRef('bookings.endDate', '>=', 'b.startDate')
      )
    )
    .as('isDoubleBooked')
}

function withOverlapsWithUnavailablePeriod(
  eb: ExpressionBuilder<Database, 'bookings'>
) {
  return eb
    .and([
      eb.exists(
        eb
          .selectFrom('periods')
          .where((web) =>
            web.or([
              web('periods.type', '=', PERIOD_TYPE.UNAVAILABLE_FOR_ALL),
              web('periods.type', '=', PERIOD_TYPE.UNAVAILABLE_FOR_BOOKINGS)
            ])
          )
          .whereRef('periods.startDate', '<=', 'bookings.endDate')
          .whereRef('periods.endDate', '>=', 'bookings.startDate')
      ),
      eb.exists(
        eb
          .selectFrom('bookingStatus')
          .whereRef('bookingStatus.bookingId', '=', 'bookings.id')
          .whereRef(
            'bookingStatus.modifiedAt',
            '=',
            sql<string>`(select max(modified_at) from booking_status where booking_status.booking_id = bookings.id)`
          )
          .where('bookingStatus.status', '!=', BOOKING_STATUS.APPROVED)
      )
    ])
    .as('overlapsWithUnavailablePeriod')
}

function find({
  criteria,
  select
}: {
  criteria: Partial<Booking> & {
    status?: BOOKING_STATUS
    statuses?: BOOKING_STATUS[]
    ids?: number[]
    from?: string
    until?: string
  }
  select?: (keyof Booking)[]
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
            sql<string>`(select max(modified_at) from booking_status where booking_status.booking_id = bookings.id)`
          )
          .where('bookingStatus.status', '=', criteria.status!)
          .select('bookingStatus.bookingId')
      )
    )
  } else if (criteria.statuses) {
    query = query.where(({ eb, selectFrom }) =>
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
            web.or(
              criteria.statuses!.map((status) =>
                web('bookingStatus.status', '=', status)
              )
            )
          )
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

  if (criteria.startDate) {
    query = query.where('startDate', '>=', criteria.startDate)
  }

  if (criteria.endDate) {
    query = query.where('endDate', '<=', criteria.endDate)
  }

  if (criteria.customerId) {
    query = query.where('customerId', '=', criteria.customerId)
  }

  if (criteria.invoiceUuid) {
    query = query.where('invoiceUuid', '=', criteria.invoiceUuid)
  }

  return query
    .select(select)
    .select(({ selectFrom }) => [
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
      withOverlapsWithUnavailablePeriod,
      sql<number>`bookings.end_date - 
      bookings.start_date - 1
      + (select "opening_times"."start_day_counted" from "opening_times" where "bookings"."start_time_id" = "opening_times"."id")
      + (select "opening_times"."end_day_counted" from "opening_times" where "bookings"."end_time_id" = "opening_times"."id")
      `.as('days')
    ])
    .orderBy('startDate', 'asc')
}

export async function findBooking({
  criteria,
  select,
  fastify
}: {
  criteria: Partial<Booking> & {
    status?: BOOKING_STATUS
    statuses?: BOOKING_STATUS[]
    ids?: number[]
    from?: string
    until?: string
  }
  select?: (keyof Booking)[]
  fastify?: FastifyInstance
}): Promise<ParsedBooking | undefined> {
  const query = find({ criteria, select })

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

    const categories = await findCategories({
      criteria: {}
    })
    return {
      ...result,
      costs: await calculateBookingCosts({
        booking: { ...result, days },
        categories,
        withServices: true
      }),
      invoice: await getBookingInvoice({ booking: result, fastify })
    }
  } else {
    return result
  }
}

export async function findBookings({
  criteria,
  select,
  limit,
  fastify
}: {
  criteria: Partial<Booking> & {
    status?: BOOKING_STATUS
    statuses?: BOOKING_STATUS[]
    ids?: number[]
    from?: string
    until?: string
  }
  select?: (keyof Booking)[]
  limit?: number
  fastify?: FastifyInstance
}): Promise<ParsedBooking[]> {
  let query = find({
    criteria,
    select
  })

  if (limit) {
    query = query.limit(limit)
  }

  const results = await query.orderBy('id', 'desc').execute()

  const categories = await findCategories({
    criteria: {}
  })

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

      const invoice = await getBookingInvoice({ booking: result, fastify })

      return {
        ...result,
        costs,
        invoice
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

    if (criteria.customerId) {
      query = query.where('customerId', '=', criteria.customerId)
    }
    const updatedBooking = await query
      .set({
        startDate: updateWith.booking.startDate,
        startTimeId: updateWith.booking.startTimeId,
        endDate: updateWith.booking.endDate,
        endTimeId: updateWith.booking.endTimeId,
        comments: updateWith.booking.comments,
        invoiceUuid: updateWith.booking.invoiceUuid,
        customerId: updateWith.booking.customerId
      })
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
      const lastApprovedStatus = await db
        .selectFrom('bookingStatus')
        .selectAll()
        .where('bookingId', '=', criteria.id)
        .where('status', '=', BOOKING_STATUS.APPROVED)
        .orderBy('modifiedAt', 'desc')
        .limit(1)
        .executeTakeFirst()

      if (
        lastApprovedStatus &&
        updatedBooking.startDate === lastApprovedStatus.startDate &&
        updatedBooking.endDate === lastApprovedStatus.endDate &&
        updatedBooking.startTimeId === lastApprovedStatus.startTimeId &&
        updatedBooking.endTimeId === lastApprovedStatus.endTimeId
      ) {
        await createBookingStatus({
          booking: updatedBooking,
          petIds: updateWith.petIds,
          status: updateWith.status || BOOKING_STATUS.APPROVED
        })
      } else {
        await createBookingStatus({
          booking: updatedBooking,
          petIds: updateWith.petIds,
          status: updateWith.status || BOOKING_STATUS.PENDING
        })
      }
    }

    return updatedBooking
  }
}

export async function cancelBooking(
  criteria: Partial<Booking>,
  reason: string,
  ignoreCancelationPeriod?: boolean
) {
  const booking = await findBooking({ criteria })
  if (
    booking?.startDate &&
    booking.startDate <= new Date().toISOString().slice(0, 10) &&
    !ignoreCancelationPeriod
  ) {
    throw new Error('You cannot cancel dates in the past.')
  }

  if (booking?.status?.status === BOOKING_STATUS.REJECTED) {
    throw new Error('You cannot cancel rejected bookings.')
  }

  if (booking) {
    let bookingCancelationHandler
    let status = BOOKING_STATUS.CANCELED
    let cancelationCosts
    const days = booking.days

    const lastApprovedBooking = getLastApprovedForBooking(booking)
    try {
      ;({ bookingCancelationHandler } = await import('../api.config.js'))
      if (days) {
        ;({ status, cancelationCosts } = bookingCancelationHandler({
          period: {
            startDate: booking.startDate,
            endDate: booking.endDate,
            days
          },
          dateFns: {
            isBefore,
            isAfter,
            isWithinInterval,
            parse,
            parseISO,
            subMonths,
            subDays,
            differenceInDays
          },
          booking: lastApprovedBooking,
          BOOKING_STATUS
        }))
      }
    } catch (e) {
      console.error('Unable to load API config')
      const maxCancelationDate = subMonths(
        parseISO(booking.startDate),
        env.read('CANCELATION_PERIOD_MONTHS') ||
          env.read('VITE_CANCELATION_PERIOD_MONTHS') ||
          0
      )

      status =
        isAfter(new Date(), maxCancelationDate) &&
        booking.status?.status === BOOKING_STATUS.APPROVED
          ? BOOKING_STATUS.CANCELED_OUTSIDE_PERIOD
          : BOOKING_STATUS.CANCELED
    }

    const petIds = booking.pets.map((pet) => pet.id)

    await createBookingStatus({
      booking: {
        ...booking,
        comments: reason
      },
      petIds,
      status: ignoreCancelationPeriod ? BOOKING_STATUS.CANCELED : status
    })
    return { status, cancelationCosts }
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
  let count = (
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
              sql<string>`(select max(modified_at) from booking_status where booking_status.booking_id = bookings.id)`
            )
            .where('bookingStatus.status', '=', status!)
            .select('bookingStatus.bookingId')
        )
      )
      .select(({ fn }) => [fn.count<number>('bookings.id').as('count')])
      .executeTakeFirst()
  )?.count

  if (typeof count === 'string') count = Number(count)
  return count
}

export const downPaymentPaymentTermDays =
  env.read('VITE_DOWN_PAYMENT_PAYMENT_TERM_DAYS') ||
  env.read('DOWN_PAYMENT_PAYMENT_TERM_DAYS') ||
  5
export async function checkDownPayments({
  fastify
}: {
  fastify: FastifyInstance
}) {
  const bookings = await db
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
            sql<string>`(select max(modified_at) from booking_status where booking_status.booking_id = bookings.id)`
          )
          .where(
            'bookingStatus.status',
            '=',
            BOOKING_STATUS.AWAITING_DOWNPAYMENT
          )
          .select('bookingStatus.bookingId')
      )
    )
    .select([withPets, withStatus])
    .selectAll()
    .execute()

  const localeCode = env.read('VITE_LANG')

  let reason: string
  try {
    ;({ reason } =
      await bookingTemplates[`./downPaymentNotReceived/${localeCode}.ts`]())
  } catch (e) {
    ;({ reason } =
      await bookingTemplates[`./downPaymentNotReceived/en-US.ts`]())
  }
  for (const booking of bookings) {
    const invoice = await getBookingInvoice({ booking, fastify })
    if (
      (typeof invoice?.amountPaid === 'number' &&
        typeof invoice?.requiredDownPaymentAmount === 'number' &&
        invoice.amountPaid >= invoice.requiredDownPaymentAmount) ||
      booking.startDate <= new Date().toISOString()
    ) {
      createBookingStatus({
        booking,
        petIds: booking.pets.map((pet) => pet.id),
        status: BOOKING_STATUS.APPROVED
      })
    } else if (
      booking.status?.status &&
      new Date(booking.status?.modifiedAt) <
        subDays(new Date(), downPaymentPaymentTermDays)
    ) {
      await cancelBooking({ id: booking.id }, reason, true)
      if (fastify?.mailer) {
        const localeCode = env.read('VITE_LANG')
        let template: { subject: string; body: string }
        try {
          template = await bookingEmailTemplates[`./cancel/${localeCode}.ts`]()
        } catch (e) {
          template = await bookingEmailTemplates[`./cancel/en-US.ts`]()
        }
        const parsedBooking = await findBooking({
          criteria: {
            id: booking.id
          }
        })
        const customer = await findCustomer({
          criteria: {
            id: booking.customerId
          }
        })
        if (template && parsedBooking && customer) {
          const { subject: subjectTemplate, body: bodyTemplate } = template

          if (subjectTemplate !== null && bodyTemplate !== null) {
            const { subject, body } = await compileEmail({
              booking: parsedBooking,
              subjectTemplate,
              bodyTemplate,
              localeCode,
              variables: {
                reason
              }
            })

            await fastify.mailer.sendMail({
              from: `Petboarding <noreply@petboarding.app>`,
              replyTo:
                env.read('MAIL_REPLY_TO') || env.read('VITE_MAIL_REPLY_TO'),
              to: customer.account?.email,
              bcc: env.read('MAIL_BCC') || env.read('VITE_MAIL_BCC'),
              subject,
              html: body
            })
          }
        }
      }
    }
  }
}

export async function getLastApprovedForBooking(booking: ParsedBooking) {
  const lastApprovedStatus = booking.statuses
    .filter((status) => status.status === BOOKING_STATUS.APPROVED)
    .sort((a, b) => {
      if (a.modifiedAt < b.modifiedAt) return -1
      if (a.modifiedAt > b.modifiedAt) return 1
      return 0
    })
    .at(-1)

  if (lastApprovedStatus) {
    const lastApprovedBookingDays = calculateBookingDays({
      startDate: lastApprovedStatus.startDate,
      endDate: lastApprovedStatus.endDate,
      startTime: lastApprovedStatus.startTime,
      endTime: lastApprovedStatus.endTime,
      startTimeId: lastApprovedStatus.startTimeId,
      endTimeId: lastApprovedStatus.endTimeId
    })
    const categories = await findCategories({
      criteria: {
        date: lastApprovedStatus.startDate
      }
    })
    const lastApprovedBookingCosts = await calculateBookingCosts({
      booking: {
        ...lastApprovedStatus,
        days: lastApprovedBookingDays,
        customer: booking.customer,
        customerId: booking.customerId,
        pets: booking.pets,
        services: booking.services
      },
      categories
    })
    return {
      ...lastApprovedStatus,
      days: lastApprovedBookingDays,
      customer: booking.customer,
      customerId: booking.customerId,
      pets: booking.pets,
      services: booking.services,
      costs: lastApprovedBookingCosts
    }
  }
  return booking
}

export const createReceiptsForBookings = async ({
  fastify
}: {
  fastify: FastifyInstance
}) => {
  const threeMonthsInThePast = subMonths(new Date(), 3)
  const oneWeekInThePast = subDays(new Date(), 7)
  const pastBookings = await findBookings({
    criteria: {
      from: threeMonthsInThePast.toISOString().slice(0, 10),
      endDate: oneWeekInThePast.toISOString().slice(0, 10)
    },
    fastify
  })

  const pastBookingsWithBills = pastBookings.filter(
    (booking) => booking.invoice?.status === InvoiceStatus.BILL
  )

  for (const booking of pastBookingsWithBills) {
    const invoiceId = booking.invoice?.id
    if (invoiceId) {
      await fastify.slimfact?.admin.setInvoiceStatus.mutate({
        id: invoiceId,
        status: InvoiceStatus.RECEIPT
      })
      console.log(`Created receipt for booking: ${booking.id}`)
    }
  }
}

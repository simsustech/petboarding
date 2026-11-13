import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres'
import { Database, db } from '../kysely/index.js'
import { withValidVaccinations, checkVaccinations } from './pet.js'
import type { DB, DaycareDates } from '../kysely/types.ts'

import type {
  ExpressionBuilder,
  Insertable,
  Selectable,
  Transaction,
  Updateable
} from 'kysely'
import {
  CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS,
  DAYCARE_DATE_STATUS
} from '../zod/index.js'
import { DAYCARE_SUBSCRIPTION_SLACK_MONTHS } from '@petboarding/tools/constants'
import {
  findCustomerDaycareSubscriptions,
  type ParsedCustomerDaycareSubscription
} from './customerDaycareSubscription.js'
import { subMonths, addMonths, parseISO, formatDate } from 'date-fns'
type DaycareDate = Selectable<DaycareDates>
type NewDaycareDate = Insertable<DaycareDates>
type DaycareDateUpdate = Updateable<DaycareDates>

const defaultSelect = [
  'id',
  'date',
  'status',
  'comments',
  'customerId',
  'customerDaycareSubscriptionId'
] as (keyof DaycareDate)[]

function withPets(eb: ExpressionBuilder<Database, 'daycareDates'>) {
  return jsonArrayFrom(
    eb
      .selectFrom('pets')
      .innerJoin(
        'daycareDatePetKennel',
        'pets.id',
        'daycareDatePetKennel.petId'
      )
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
      .whereRef('daycareDates.id', '=', 'daycareDatePetKennel.daycareDateId')
  ).as('pets')
}

function withCustomer(eb: ExpressionBuilder<Database, 'daycareDates'>) {
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
      .whereRef('daycareDates.customerId', '=', 'customers.id')
  ).as('customer')
}

function withCustomerDaycareSubscription(
  eb: ExpressionBuilder<Database, 'daycareDates'>
) {
  return jsonObjectFrom(
    eb
      .selectFrom('customerDaycareSubscriptions')
      .select([
        'customerDaycareSubscriptions.id',
        'customerDaycareSubscriptions.effectiveDate',
        'customerDaycareSubscriptions.expirationDate',
        'customerDaycareSubscriptions.status',
        'customerDaycareSubscriptions.invoiceUuid'
      ])
      .whereRef(
        'daycareDates.customerDaycareSubscriptionId',
        '=',
        'customerDaycareSubscriptions.id'
      )
  ).as('customerDaycareSubscription')
}

function find({
  criteria,
  select
}: {
  criteria: Partial<DaycareDate> & {
    from?: string
    until?: string
    dates?: string[]
    ids?: number[]
  }
  select?: (keyof DaycareDate)[]
}) {
  if (select) select = [...defaultSelect, ...select]
  else select = [...defaultSelect]

  let query = db.selectFrom('daycareDates')

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  } else if (criteria.ids) {
    query = query.where('id', 'in', criteria.ids.length ? criteria.ids : [null])
  }

  if (criteria.customerId) {
    query = query.where('customerId', '=', criteria.customerId)
  }

  if (criteria.from) {
    query = query.where('date', '>=', criteria.from)
  }

  if (criteria.until) {
    query = query.where('date', '<=', criteria.until)
  }

  if (criteria.status) {
    query = query.where('status', '=', criteria.status)
  }
  if (criteria.dates && criteria.dates.length) {
    query = query.where('date', 'in', criteria.dates)
  }
  return query
    .select(select)
    .select([withCustomer, withPets, withCustomerDaycareSubscription])
}

export async function findDaycareDate({
  criteria,
  select
}: {
  criteria: Partial<DaycareDate> & { from?: string; until?: string }
  select?: (keyof DaycareDate)[]
}) {
  const query = find({ criteria, select })

  const result = await query.executeTakeFirst()

  if (result?.pets) {
    result.pets = result.pets.map((pet) => {
      return {
        ...pet,
        hasMandatoryVaccinations: checkVaccinations({
          species: pet.species,
          validVaccinations: pet.validVaccinations
        })
      }
    })
  }
  return result
}

export async function findDaycareDatesByIds(ids: number[]) {
  const query = db.selectFrom('daycareDates').selectAll().where('id', 'in', ids)

  return query.execute()
}

export async function findDaycareDates({
  criteria,
  select
}: {
  criteria: Partial<DaycareDate> & {
    from?: string
    until?: string
    dates?: string[]
    ids?: number[]
  }
  select?: (keyof DaycareDate)[]
}) {
  const query = find({
    criteria,
    select
  })
  const results = await query.execute()

  if (results) {
    results.forEach((daycareDate) => {
      if (daycareDate.pets) {
        daycareDate.pets = daycareDate.pets.map((pet) => {
          return {
            ...pet,
            hasMandatoryVaccinations: checkVaccinations({
              species: pet.species,
              validVaccinations: pet.validVaccinations
            })
          }
        })
      }
    })
  }
  return results
}

const bySoonestExpiry = (
  a: ParsedCustomerDaycareSubscription,
  b: ParsedCustomerDaycareSubscription
) => a.expirationDate.localeCompare(b.expirationDate) || a.id - b.id

/**
 * Turn the slack into the two criteria `find` understands: `effectiveDate` is an
 * upper bound on the pack's start, `expirationDate` a lower bound on its end.
 */
const subscriptionSlack = (date: string) => ({
  effectiveDate: formatDate(
    addMonths(parseISO(date), DAYCARE_SUBSCRIPTION_SLACK_MONTHS),
    'yyyy-MM-dd'
  ),
  expirationDate: formatDate(
    subMonths(parseISO(date), DAYCARE_SUBSCRIPTION_SLACK_MONTHS),
    'yyyy-MM-dd'
  )
})

/**
 * Take the customer's paid packs for update, so two bookings cannot both spend
 * the last remaining day. `order by id` keeps concurrent bookings taking the
 * locks in the same order.
 */
async function lockCustomerDaycareSubscriptions(
  trx: Transaction<DB>,
  customerId: number
) {
  await trx
    .selectFrom('customerDaycareSubscriptions')
    .where('customerId', '=', customerId)
    .where('status', '=', CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS.PAID)
    .orderBy('customerDaycareSubscriptions.id')
    .forUpdate()
    .select('id')
    .execute()
}

async function insertDaycareDate(
  trx: Transaction<DB>,
  { daycareDate, petIds }: { daycareDate: NewDaycareDate; petIds: number[] }
) {
  const newDaycareDate = await trx
    .insertInto('daycareDates')
    .values(daycareDate)
    .returningAll()
    .executeTakeFirstOrThrow()

  await trx
    .insertInto('daycareDatePetKennel')
    .values(
      petIds.map((petId) => ({
        petId,
        daycareDateId: newDaycareDate.id
      }))
    )
    .executeTakeFirstOrThrow()
  return true
}

/**
 * Pick the pack for one date inside the caller's transaction, splitting the date
 * across packs when the first-expiring one has fewer days left than pets.
 */
async function createDaycareDateWithSubscription(
  trx: Transaction<DB>,
  {
    daycareDate,
    petIds,
    options
  }: {
    daycareDate: NewDaycareDate
    petIds: number[]
    options?: {
      useCustomerDaycareSubscription?: boolean
      ignoreCustomerDaycareSubscriptionErrors?: boolean
    }
  }
): Promise<boolean> {
  // The picker owns this field: a split re-enters with the same object, and a
  // leftover id from the previous pack would attach the row to a full pack.
  daycareDate.customerDaycareSubscriptionId = undefined

  const customerDaycareSubscriptions = await findCustomerDaycareSubscriptions({
    criteria: {
      customerId: daycareDate.customerId,
      // Slack on both sides of the pack's window (user decision, 2026-11-13),
      // so a booking just after a pack expired or just before it starts is
      // still paid for instead of rejected.
      ...subscriptionSlack(daycareDate.date),
      status: CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS.PAID
    },
    trx
  })
  // Days come off the pack that expires soonest; the query orders by
  // effectiveDate for the display lists, so order the candidates here.
  const customerDaycareSubscription = customerDaycareSubscriptions
    .sort(bySoonestExpiry)
    .find(
      (customerDaycareSubscription) =>
        (customerDaycareSubscription.numberOfDaysRemaining || 0) > 0
    )

  if (
    customerDaycareSubscription &&
    customerDaycareSubscription.numberOfDaysRemaining &&
    customerDaycareSubscription.numberOfDaysRemaining >= petIds.length
  ) {
    daycareDate.customerDaycareSubscriptionId = customerDaycareSubscription.id
  } else if (
    customerDaycareSubscription &&
    customerDaycareSubscription.numberOfDaysRemaining &&
    customerDaycareSubscription.numberOfDaysRemaining < petIds.length
  ) {
    await createDaycareDateWithSubscription(trx, {
      daycareDate,
      petIds: petIds.slice(0, 1),
      options
    })
    await createDaycareDateWithSubscription(trx, {
      daycareDate,
      petIds: petIds.slice(1),
      options
    })
    return true
  } else if (!options?.ignoreCustomerDaycareSubscriptionErrors) {
    throw new Error(
      `No valid customer daycare subscription available for date ${daycareDate.date}`
    )
  }

  return insertDaycareDate(trx, { daycareDate, petIds })
}

export async function createDaycareDate({
  daycareDate,
  petIds,
  options
}: {
  daycareDate: NewDaycareDate
  petIds: number[]
  options?: {
    useCustomerDaycareSubscription?: boolean
    ignoreCustomerDaycareSubscriptionErrors?: boolean
  }
}): Promise<boolean> {
  if (!options?.useCustomerDaycareSubscription) {
    return db
      .transaction()
      .execute((trx) => insertDaycareDate(trx, { daycareDate, petIds }))
  }

  // The selection reads the days left and then writes: without a lock two
  // bookings of the same customer both spend the last day.
  return db.transaction().execute(async (trx) => {
    await lockCustomerDaycareSubscriptions(trx, daycareDate.customerId)
    return createDaycareDateWithSubscription(trx, {
      daycareDate,
      petIds,
      options
    })
  })
}

export async function updateDaycareDate(
  criteria: Partial<DaycareDate> & {
    startDate?: string
    endDate?: string
    ids?: number[]
  },
  updateWith: {
    daycareDate: DaycareDateUpdate
    petIds?: number[]
  },
  options?: {
    useCustomerDaycareSubscription?: boolean
    ignoreCustomerDaycareSubscriptionErrors?: boolean
  }
) {
  if (!options?.useCustomerDaycareSubscription || !criteria.customerId) {
    return db
      .transaction()
      .execute((trx) =>
        updateDaycareDateInTransaction(trx, criteria, updateWith, options)
      )
  }

  // Same read-then-write as a booking, so it takes the same lock: an approval
  // must not spend a day another approval just spent.
  return db.transaction().execute(async (trx) => {
    await lockCustomerDaycareSubscriptions(trx, criteria.customerId!)
    return updateDaycareDateInTransaction(trx, criteria, updateWith, options)
  })
}

async function updateDaycareDateInTransaction(
  trx: Transaction<DB>,
  criteria: Partial<DaycareDate> & {
    startDate?: string
    endDate?: string
    ids?: number[]
  },
  updateWith: {
    daycareDate: DaycareDateUpdate
    petIds?: number[]
  },
  options?: {
    useCustomerDaycareSubscription?: boolean
    ignoreCustomerDaycareSubscriptionErrors?: boolean
  }
) {
  if (
    options?.useCustomerDaycareSubscription &&
    updateWith.petIds &&
    !updateWith.daycareDate.customerDaycareSubscriptionId
  ) {
    const date = criteria.date ?? updateWith.daycareDate.date
    // Without the customer and the day there is nothing to decide against: the
    // old code queried with neither filter and could link a stranger's pack.
    if (!criteria.customerId || !date) {
      if (!options?.ignoreCustomerDaycareSubscriptionErrors) {
        throw new Error(
          'Cannot select a customer daycare subscription without a customer and a date'
        )
      }
    } else {
      const customerDaycareSubscriptions =
        await findCustomerDaycareSubscriptions({
          criteria: {
            customerId: criteria.customerId,
            ...subscriptionSlack(date),
            status: CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS.PAID
          },
          trx
        })
      const customerDaycareSubscription = customerDaycareSubscriptions
        .sort(bySoonestExpiry)
        .find(
          (customerDaycareSubscription) =>
            (customerDaycareSubscription.numberOfDaysRemaining || 0) >=
            (updateWith.petIds?.length || 1)
        )
      if (customerDaycareSubscription) {
        updateWith.daycareDate.customerDaycareSubscriptionId =
          customerDaycareSubscription.id
      } else if (!options?.ignoreCustomerDaycareSubscriptionErrors) {
        throw new Error(
          `No valid customer daycare subscription available for date ${date}`
        )
      }
    }
  }

  let query = trx.updateTable('daycareDates')

  if (criteria.ids && !criteria.ids.length) {
    throw new Error('ids array cannot be empty')
  }

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
  } else if (criteria.ids) {
    query = query.where('id', 'in', criteria.ids)
  }

  if (criteria.date) {
    query = query.where('date', '=', criteria.date)
  }
  if (criteria.customerId) {
    query = query.where('customerId', '=', criteria.customerId)
  }
  const updatedDaycareDate = await query
    .set(updateWith.daycareDate)
    .returningAll()
    .executeTakeFirstOrThrow()

  if (Array.isArray(updateWith.petIds)) {
    await trx
      .deleteFrom('daycareDatePetKennel')
      .where('daycareDateId', '=', updatedDaycareDate.id)
      .executeTakeFirstOrThrow()

    await trx
      .insertInto('daycareDatePetKennel')
      .values(
        updateWith.petIds.map((petId) => ({
          petId,
          daycareDateId: updatedDaycareDate.id
        }))
      )
      .executeTakeFirstOrThrow()
  }
}

export async function getDaycareDateCount({
  status,
  maxDate
}: {
  status: DAYCARE_DATE_STATUS
  maxDate?: string
}) {
  let query = db.selectFrom('daycareDates').where('status', '=', status)

  if (maxDate) query = query.where('date', '<=', maxDate)
  let count = (
    await query
      .select(({ fn }) => [fn.count<number>('daycareDates.id').as('count')])
      .executeTakeFirst()
  )?.count

  if (typeof count === 'string') count = Number(count)

  return count
}

export async function createOrUpdateDaycareDates(
  daycareDates: (Omit<NewDaycareDate, 'status'> & { petIds: number[] })[],
  options?: {
    useCustomerDaycareSubscription?: boolean
    ignoreCustomerDaycareSubscriptionErrors?: boolean
    updateRejectedDaycareDates?: boolean
  }
) {
  const customerId = daycareDates[0].customerId
  if (customerId) {
    const currentDaycareDates = await findDaycareDates({
      criteria: {
        customerId,
        dates: daycareDates.map((daycareDate) => daycareDate.date)
      }
    })

    const newDaycareDates = daycareDates.filter(
      (daycareDate) =>
        !currentDaycareDates.some(
          (currentDaycareDate) => daycareDate.date === currentDaycareDate.date
        )
    )

    const updatedDaycareDates = currentDaycareDates
      .filter((daycareDate) =>
        [
          DAYCARE_DATE_STATUS.CANCELED,
          DAYCARE_DATE_STATUS.APPROVED,
          DAYCARE_DATE_STATUS.PENDING,
          options?.updateRejectedDaycareDates
            ? DAYCARE_DATE_STATUS.REJECTED
            : undefined
        ].includes(daycareDate.status)
      )
      .map((daycareDate) => {
        return {
          ...daycareDate,
          petIds:
            daycareDates.find((d) => d.date === daycareDate.date)?.petIds ||
            daycareDate.pets.map((pet) => pet.id)
        }
      })

    for (const newDaycareDate of newDaycareDates) {
      await createDaycareDate({
        daycareDate: {
          date: newDaycareDate.date,
          comments: newDaycareDate.comments,
          customerId,
          status: DAYCARE_DATE_STATUS.PENDING
        },
        petIds: newDaycareDate.petIds,
        options
      })
    }
    for (const updatedDaycareDate of updatedDaycareDates) {
      // Target the row we read, by id. Updating by `(date, customerId)` matched
      // *every* row for that date, and a day can legitimately have more than one
      // row: `createDaycareDate` splits a date across subscriptions when one
      // subscription has fewer days left than the number of pets. Two rows for
      // the same date write the same `date, customer_id,
      // customer_daycare_subscription_id` triple and trip
      // `daycare_dates_unique` (present on the production database), which the
      // employee page reported as a bare BAD_REQUEST.
      await updateDaycareDate(
        {
          id: updatedDaycareDate.id,
          date: updatedDaycareDate.date,
          customerId
        },
        {
          daycareDate: {
            date: updatedDaycareDate.date,
            comments: updatedDaycareDate.comments,
            customerId,
            status: DAYCARE_DATE_STATUS.PENDING,
            customerDaycareSubscriptionId:
              updatedDaycareDate.customerDaycareSubscriptionId
          },
          petIds: updatedDaycareDate.petIds
        }
      )
    }
    return true
  }
}

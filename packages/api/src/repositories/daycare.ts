import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres'
import { Database, db } from '../kysely/index.js'
import { withValidVaccinations, checkVaccinations } from './pet.js'
import type { DaycareDates } from '../kysely/types.d.ts'

import type {
  ExpressionBuilder,
  Insertable,
  Selectable,
  Updateable
} from 'kysely'
import {
  CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS,
  DAYCARE_DATE_STATUS
} from '../zod/index.js'
import { findCustomerDaycareSubscription } from './customerDaycareSubscription.js'
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
  }
  select?: (keyof DaycareDate)[]
}) {
  if (select) select = [...defaultSelect, ...select]
  else select = [...defaultSelect]

  let query = db.selectFrom('daycareDates')

  if (criteria.id) {
    query = query.where('id', '=', criteria.id)
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
}) {
  if (options?.useCustomerDaycareSubscription) {
    const customerDaycareSubscription = await findCustomerDaycareSubscription({
      criteria: {
        customerId: daycareDate.customerId,
        date: daycareDate.date,
        status: CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS.PAID
      }
    })
    if (
      customerDaycareSubscription &&
      customerDaycareSubscription.numberOfDaysRemaining &&
      customerDaycareSubscription.numberOfDaysRemaining >= petIds.length
    ) {
      daycareDate.customerDaycareSubscriptionId = customerDaycareSubscription.id
    } else if (!options?.ignoreCustomerDaycareSubscriptionErrors) {
      throw new Error(
        `No valid customer daycare subscription available for date ${daycareDate.date}`
      )
    }
  }

  const newDaycareDate = await db
    .insertInto('daycareDates')
    .values(daycareDate)
    .returningAll()
    .executeTakeFirstOrThrow()

  await db
    .insertInto('daycareDatePetKennel')
    .values(
      petIds.map((petId) => ({
        petId,
        daycareDateId: newDaycareDate.id
      }))
    )
    .executeTakeFirstOrThrow()
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
  if (
    options?.useCustomerDaycareSubscription &&
    updateWith.petIds &&
    !updateWith.daycareDate.customerDaycareSubscriptionId
  ) {
    const customerDaycareSubscription = await findCustomerDaycareSubscription({
      criteria: {
        customerId: criteria.customerId,
        date: criteria.date,
        status: CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS.PAID
      }
    })
    if (
      customerDaycareSubscription &&
      customerDaycareSubscription.numberOfDaysRemaining !== null &&
      customerDaycareSubscription.numberOfDaysRemaining >=
        updateWith.petIds.length
    ) {
      updateWith.daycareDate.customerDaycareSubscriptionId =
        customerDaycareSubscription.id
    } else if (!options?.ignoreCustomerDaycareSubscriptionErrors) {
      throw new Error(
        `No valid customer daycare subscription available for date ${criteria.date}`
      )
    }
  }

  let query = db.updateTable('daycareDates')

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
    await db
      .deleteFrom('daycareDatePetKennel')
      .where('daycareDateId', '=', updatedDaycareDate.id)
      .executeTakeFirstOrThrow()

    await db
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
  const count = (
    await query
      .select(({ fn }) => [fn.count<number>('daycareDates.id').as('count')])
      .executeTakeFirst()
  )?.count

  return count
}

export async function createOrUpdateDaycareDates(
  daycareDates: (Omit<NewDaycareDate, 'status'> & { petIds: number[] })[],
  options?: {
    useCustomerDaycareSubscription?: boolean
    ignoreCustomerDaycareSubscriptionErrors?: boolean
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
          DAYCARE_DATE_STATUS.PENDING
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

    await Promise.all([
      ...newDaycareDates.map((daycareDate) =>
        createDaycareDate({
          daycareDate: {
            date: daycareDate.date,
            comments: daycareDate.comments,
            customerId,
            status: DAYCARE_DATE_STATUS.PENDING
          },
          petIds: daycareDate.petIds,
          options
        })
      ),
      ...updatedDaycareDates.map((daycareDate) =>
        updateDaycareDate(
          {
            date: daycareDate.date,
            customerId
          },
          {
            daycareDate: {
              date: daycareDate.date,
              comments: daycareDate.comments,
              customerId,
              status: DAYCARE_DATE_STATUS.PENDING,
              customerDaycareSubscriptionId:
                daycareDate.customerDaycareSubscriptionId
            },
            petIds: daycareDate.petIds
          }
        )
      )
    ])
  }
}

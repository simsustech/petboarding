import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { addDays, format } from 'date-fns'
import { db } from '../kysely/index.js'
import { createOrUpdateDaycareDates } from './daycare.js'
import { CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS } from '../zod/index.js'

/**
 * Regression for the reported failure when an employee re-adds a daycare date
 * that already exists for a customer.
 *
 * A single calendar day can have more than one row: `createDaycareDate` splits a
 * date across subscriptions when one subscription has fewer days left than the
 * number of pets, so two rows for the same date are legitimate. The update path
 * then wrote both rows with `WHERE date = $1 AND customer_id = $2`, which
 * collapsed them onto the first row's `customer_daycare_subscription_id`. On a
 * database carrying `daycare_dates_unique (date, customer_id,
 * customer_daycare_subscription_id)` — as production does — that update is a
 * duplicate key violation, which the employee page showed as a bare
 * BAD_REQUEST.
 *
 * The assertion is on the state, not on the error: without the unique
 * constraint the old code silently corrupted the second row instead of failing,
 * so this test has to check that each row keeps its own subscription.
 */

const customerPrefix = 'daycare-test'

let customerId: number
let petIds: number[]
let subscriptionIds: number[]
let date: string

const cleanup = async () => {
  if (!customerId) return
  // daycare_dates and pets cascade from customers; subscriptions do not.
  await db.deleteFrom('customers').where('id', '=', customerId).execute()
  await db
    .deleteFrom('customerDaycareSubscriptions')
    .where('id', 'in', subscriptionIds ?? [])
    .execute()
}

beforeAll(async () => {
  date = format(addDays(new Date(), 30), 'yyyy-MM-dd')

  const [customer] = await db
    .insertInto('customers')
    .values({
      gender: 'other',
      firstName: customerPrefix,
      lastName: 'fixture',
      address: '1 Test Street',
      city: 'Testville',
      postalCode: '1234 AB',
      telephoneNumber: '+31 20 000 0000',
      veterinarian: 'Dr. Example'
    })
    .returning('id')
    .execute()
  customerId = customer.id

  petIds = await Promise.all(
    ['one', 'two'].map(async (name) => {
      const [pet] = await db
        .insertInto('pets')
        .values({
          name,
          species: 'dog',
          breed: 'mixed',
          gender: 'male',
          sterilized: true,
          birthDate: '2020-01-01',
          customerId
        })
        .returning('id')
        .execute()
      return pet.id
    })
  )

  // The paid subscription is the row attribute the bug overwrote, so the
  // subscription plan itself does not matter — reuse the seeded one.
  const plan = await db
    .selectFrom('daycareSubscriptions')
    .select('id')
    .executeTakeFirstOrThrow()

  subscriptionIds = await Promise.all(
    [0, 1].map(async () => {
      const [subscription] = await db
        .insertInto('customerDaycareSubscriptions')
        .values({
          customerId,
          daycareSubscriptionId: plan.id,
          status: CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS.PAID,
          effectiveDate: '2020-01-01',
          expirationDate: '2035-12-31'
        })
        .returning('id')
        .execute()
      return subscription.id
    })
  )

  // The split state: one row per subscription on the same date, one pet each.
  for (const [index, subscriptionId] of subscriptionIds.entries()) {
    const [daycareDate] = await db
      .insertInto('daycareDates')
      .values({
        date,
        customerId,
        status: 'canceled',
        customerDaycareSubscriptionId: subscriptionId
      })
      .returning('id')
      .execute()
    await db
      .insertInto('daycareDatePetKennel')
      .values({ daycareDateId: daycareDate.id, petId: petIds[index] })
      .execute()
  }
})

afterAll(cleanup)

describe('createOrUpdateDaycareDates for a date with several rows', () => {
  it('updates each row in place instead of collapsing them onto one subscription', async () => {
    await createOrUpdateDaycareDates([{ date, petIds, customerId }], {
      useCustomerDaycareSubscription: false
    })

    const rows = await db
      .selectFrom('daycareDates')
      .select(['id', 'date', 'status', 'customerDaycareSubscriptionId'])
      .where('customerId', '=', customerId)
      .orderBy('id')
      .execute()

    expect(rows).toHaveLength(2)
    expect(rows.map((row) => row.customerDaycareSubscriptionId)).toEqual(
      subscriptionIds
    )
    expect(rows.map((row) => row.status)).toEqual(['pending', 'pending'])
  })

  it('does not duplicate the pet links of the other row', async () => {
    const rows = await db
      .selectFrom('daycareDates')
      .select('id')
      .where('customerId', '=', customerId)
      .orderBy('id')
      .execute()

    const links = await db
      .selectFrom('daycareDatePetKennel')
      .select(['daycareDateId', 'petId'])
      .where(
        'daycareDateId',
        'in',
        rows.map((row) => row.id)
      )
      .orderBy('daycareDateId')
      .orderBy('petId')
      .execute()

    // Each row keeps exactly the pets the request asked for, and no row is left
    // with a stale link from before the update.
    for (const row of rows) {
      expect(
        links
          .filter((link) => link.daycareDateId === row.id)
          .map((l) => l.petId)
      ).toEqual(petIds)
    }
  })
})

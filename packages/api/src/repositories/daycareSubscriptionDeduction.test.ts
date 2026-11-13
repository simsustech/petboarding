import { afterEach, describe, expect, it } from 'vitest'
import { db } from '../kysely/index.js'
import {
  createOrUpdateDaycareDates,
  findDaycareDates,
  updateDaycareDate
} from './daycare.js'
import {
  findCustomerDaycareSubscriptions,
  setCustomerDaycareSubscriptionStatus
} from './customerDaycareSubscription.js'
import { CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS } from '../zod/index.js'

/**
 * Which prepaid pack pays for a booked daycare day.
 *
 * The rule (user decisions, 2026-11-13): candidates are paid packs within one month
 * of the booked day in either direction — a pack that expired up to a month ago, or
 * starts up to a month ahead, still pays, so a late or early booking is not rejected —
 * and among the candidates the pack that expires first is charged first. Inside that
 * slack an expired pack with unused days therefore wins over a currently valid one:
 * the customer's leftover days are used before they lapse.
 *
 * Before the fix the candidate query ordered by `effectiveDate` (purchase order), so
 * a day could land on a pack that expires later and the customer's visible remaining
 * days never moved.
 *
 * The last case covers the other half of the same write: when a pack turns PAID it
 * backfills unlinked dates, and a date costs one day per pet.
 */

const createdCustomerIds: number[] = []
const createdPlanIds: number[] = []
const createdSubscriptionIds: number[] = []

const makePlan = async (numberOfDays: number) => {
  const plan = await db
    .insertInto('daycareSubscriptions')
    .values({
      description: `deduction-test ${numberOfDays} days`,
      numberOfDays,
      validityPeriod: { years: 0, months: 1, days: 0 } as never,
      listPrice: 5000
    })
    .returning('id')
    .executeTakeFirstOrThrow()
  createdPlanIds.push(plan.id)
  return plan.id
}

const makeCustomer = async (petCount = 1) => {
  const customer = await db
    .insertInto('customers')
    .values({
      gender: 'other',
      firstName: 'deduction-test',
      lastName: 'fixture',
      address: '1 Test Street',
      city: 'Testville',
      postalCode: '1234 AB',
      telephoneNumber: '+31 20 000 0000',
      veterinarian: 'Dr. Example'
    })
    .returning('id')
    .executeTakeFirstOrThrow()
  createdCustomerIds.push(customer.id)

  const petIds: number[] = []
  for (let i = 0; i < petCount; i++) {
    const pet = await db
      .insertInto('pets')
      .values({
        name: `deduction-test-${i}`,
        species: 'dog',
        breed: 'mixed',
        gender: 'male',
        sterilized: true,
        birthDate: '2020-01-01',
        customerId: customer.id
      })
      .returning('id')
      .executeTakeFirstOrThrow()
    petIds.push(pet.id)
  }
  return { customerId: customer.id, petIds }
}

const makeSubscription = async ({
  customerId,
  planId,
  effectiveDate,
  expirationDate,
  status = CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS.PAID
}: {
  customerId: number
  planId: number
  effectiveDate: string
  expirationDate: string
  status?: CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS
}) => {
  const subscription = await db
    .insertInto('customerDaycareSubscriptions')
    .values({
      customerId,
      daycareSubscriptionId: planId,
      effectiveDate,
      expirationDate,
      status
    })
    .returning('id')
    .executeTakeFirstOrThrow()
  createdSubscriptionIds.push(subscription.id)
  return subscription.id
}

/** Insert an existing daycare day attached to `subscriptionId` (or unlinked). */
const makeDaycareDate = async ({
  customerId,
  date,
  petIds,
  subscriptionId,
  status = 'approved'
}: {
  customerId: number
  date: string
  petIds: number[]
  subscriptionId?: number | null
  status?: string
}) => {
  const row = await db
    .insertInto('daycareDates')
    .values({
      date,
      customerId,
      status,
      customerDaycareSubscriptionId: subscriptionId ?? null
    })
    .returning('id')
    .executeTakeFirstOrThrow()
  for (const petId of petIds) {
    await db
      .insertInto('daycareDatePetKennel')
      .values({ daycareDateId: row.id, petId })
      .execute()
  }
  return row.id
}

const subscriptionIdsForDate = async (customerId: number, date: string) =>
  (await findDaycareDates({ criteria: { customerId, dates: [date] } }))
    .flatMap((daycareDate) => daycareDate.customerDaycareSubscriptionId)
    .sort()

const remaining = async (subscriptionId: number) =>
  (
    await findCustomerDaycareSubscriptions({
      criteria: { id: subscriptionId }
    })
  ).at(0)?.numberOfDaysRemaining

afterEach(async () => {
  if (createdCustomerIds.length) {
    await db
      .deleteFrom('customers')
      .where('id', 'in', createdCustomerIds)
      .execute()
    createdCustomerIds.length = 0
  }
  if (createdSubscriptionIds.length) {
    await db
      .deleteFrom('customerDaycareSubscriptions')
      .where('id', 'in', createdSubscriptionIds)
      .execute()
    createdSubscriptionIds.length = 0
  }
  if (createdPlanIds.length) {
    await db
      .deleteFrom('daycareSubscriptions')
      .where('id', 'in', createdPlanIds)
      .execute()
    createdPlanIds.length = 0
  }
})

describe('daycare day deduction chooses the pack that expires first', () => {
  it('charges the later-purchased pack because it expires sooner', async () => {
    const { customerId, petIds } = await makeCustomer(1)
    const planId = await makePlan(10)
    // Bought first, valid a year: `effectiveDate` earlier, expiry later.
    const yearPack = await makeSubscription({
      customerId,
      planId,
      effectiveDate: '2026-11-01',
      expirationDate: '2027-11-01'
    })
    // Bought four days later, expires weeks before the year pack.
    const monthPack = await makeSubscription({
      customerId,
      planId,
      effectiveDate: '2026-11-05',
      expirationDate: '2026-12-05'
    })

    const date = '2026-11-25'
    await createOrUpdateDaycareDates([{ date, customerId, petIds }], {
      useCustomerDaycareSubscription: true
    })

    expect(await subscriptionIdsForDate(customerId, date)).toEqual([monthPack])
    expect(await remaining(monthPack)).toBe(9)
    expect(await remaining(yearPack)).toBe(10)
  })

  it('spends the unused days of a pack that expired within the slack month', async () => {
    const { customerId, petIds } = await makeCustomer(1)
    const planId = await makePlan(5)
    // Expired 19 days before the booked day, two of five days unused.
    const expiredPack = await makeSubscription({
      customerId,
      planId,
      effectiveDate: '2026-09-20',
      expirationDate: '2026-11-01'
    })
    await makeDaycareDate({
      customerId,
      date: '2026-10-05',
      petIds,
      subscriptionId: expiredPack
    })
    await makeDaycareDate({
      customerId,
      date: '2026-10-06',
      petIds,
      subscriptionId: expiredPack
    })
    await makeDaycareDate({
      customerId,
      date: '2026-10-07',
      petIds,
      subscriptionId: expiredPack
    })
    const freshPack = await makeSubscription({
      customerId,
      planId,
      effectiveDate: '2026-11-01',
      expirationDate: '2026-12-01'
    })

    const date = '2026-11-20'
    await createOrUpdateDaycareDates([{ date, customerId, petIds }], {
      useCustomerDaycareSubscription: true
    })

    // The expired pack is the first to expire, so it is charged; the customer's
    // remaining days on the visible fresh pack do not move.
    expect(await subscriptionIdsForDate(customerId, date)).toEqual([
      expiredPack
    ])
    expect(await remaining(expiredPack)).toBe(1)
    expect(await remaining(freshPack)).toBe(5)
  })

  it('leaves a pack that expired more than a month ago alone', async () => {
    const { customerId, petIds } = await makeCustomer(1)
    const planId = await makePlan(5)
    const stalePack = await makeSubscription({
      customerId,
      planId,
      effectiveDate: '2026-08-01',
      expirationDate: '2026-09-15'
    })
    const freshPack = await makeSubscription({
      customerId,
      planId,
      effectiveDate: '2026-11-01',
      expirationDate: '2026-12-01'
    })

    const date = '2026-11-20'
    await createOrUpdateDaycareDates([{ date, customerId, petIds }], {
      useCustomerDaycareSubscription: true
    })

    expect(await subscriptionIdsForDate(customerId, date)).toEqual([freshPack])
    expect(await remaining(freshPack)).toBe(4)
    expect(await remaining(stalePack)).toBe(5)
  })

  it('charges a pack that starts within the slack month', async () => {
    const { customerId, petIds } = await makeCustomer(1)
    const planId = await makePlan(5)
    const futurePack = await makeSubscription({
      customerId,
      planId,
      effectiveDate: '2026-12-10',
      expirationDate: '2027-01-10'
    })

    const date = '2026-11-20'
    await createOrUpdateDaycareDates([{ date, customerId, petIds }], {
      useCustomerDaycareSubscription: true
    })

    expect(await subscriptionIdsForDate(customerId, date)).toEqual([futurePack])
    expect(await remaining(futurePack)).toBe(4)
  })

  it('rejects a date more than a month before any pack starts', async () => {
    const { customerId, petIds } = await makeCustomer(1)
    const planId = await makePlan(5)
    const futurePack = await makeSubscription({
      customerId,
      planId,
      effectiveDate: '2027-02-01',
      expirationDate: '2027-03-01'
    })

    const date = '2026-11-20'
    await expect(
      createOrUpdateDaycareDates([{ date, customerId, petIds }], {
        useCustomerDaycareSubscription: true
      })
    ).rejects.toThrow(/No valid customer daycare subscription available/)

    expect(
      await db
        .selectFrom('daycareDates')
        .select('id')
        .where('customerId', '=', customerId)
        .execute()
    ).toHaveLength(0)
    expect(await remaining(futurePack)).toBe(5)
  })

  it('names the uncovered date in the rejection', async () => {
    const { customerId, petIds } = await makeCustomer(1)
    await makePlan(5)

    await expect(
      createOrUpdateDaycareDates([{ date: '2027-05-04', customerId, petIds }], {
        useCustomerDaycareSubscription: true
      })
    ).rejects.toThrow('2027-05-04')
  })

  it('leaves the date unlinked when the caller ignores the error', async () => {
    const { customerId, petIds } = await makeCustomer(1)
    const planId = await makePlan(5)
    // Outside the slack month in both directions, so nothing qualifies.
    await makeSubscription({
      customerId,
      planId,
      effectiveDate: '2027-06-01',
      expirationDate: '2027-07-01'
    })

    const date = '2026-11-20'
    await createOrUpdateDaycareDates([{ date, customerId, petIds }], {
      useCustomerDaycareSubscription: true,
      ignoreCustomerDaycareSubscriptionErrors: true
    })

    expect(await subscriptionIdsForDate(customerId, date)).toEqual([null])
  })

  it('splits a two-pet date across packs, spending the first-expiring one first', async () => {
    const { customerId, petIds } = await makeCustomer(2)
    const planId = await makePlan(5)
    const shortPack = await makeSubscription({
      customerId,
      planId,
      effectiveDate: '2026-11-01',
      expirationDate: '2026-12-01'
    })
    // Four of the five days used, so one day is left for two pets.
    for (const date of [
      '2026-11-02',
      '2026-11-03',
      '2026-11-04',
      '2026-11-05'
    ]) {
      await makeDaycareDate({
        customerId,
        date,
        petIds: [petIds[0]],
        subscriptionId: shortPack
      })
    }
    const longPack = await makeSubscription({
      customerId,
      planId,
      effectiveDate: '2026-11-01',
      expirationDate: '2027-11-01'
    })

    const date = '2026-11-20'
    await createOrUpdateDaycareDates([{ date, customerId, petIds }], {
      useCustomerDaycareSubscription: true
    })

    const rows = await findDaycareDates({
      criteria: { customerId, dates: [date] }
    })
    expect(
      rows
        .map((row) => ({
          subscription: row.customerDaycareSubscriptionId,
          pets: row.pets.map((pet) => pet.id)
        }))
        .sort((a, b) => (a.subscription ?? 0) - (b.subscription ?? 0))
    ).toEqual([
      { subscription: shortPack, pets: [petIds[0]] },
      { subscription: longPack, pets: [petIds[1]] }
    ])
    expect(await remaining(shortPack)).toBe(0)
    expect(await remaining(longPack)).toBe(4)
  })

  it('applies the same rule when a date is attached on update (admin approve)', async () => {
    const { customerId, petIds } = await makeCustomer(1)
    const planId = await makePlan(5)
    const yearPack = await makeSubscription({
      customerId,
      planId,
      effectiveDate: '2026-11-01',
      expirationDate: '2027-11-01'
    })
    const monthPack = await makeSubscription({
      customerId,
      planId,
      effectiveDate: '2026-11-05',
      expirationDate: '2026-12-05'
    })
    const date = '2026-11-25'
    const rowId = await makeDaycareDate({
      customerId,
      date,
      petIds,
      subscriptionId: null,
      status: 'pending'
    })

    // Mirrors trpc/admin/daycare.ts approveDaycareDateIds.
    await updateDaycareDate(
      { id: rowId, customerId },
      {
        daycareDate: {
          date,
          customerId,
          status: 'approved',
          customerDaycareSubscriptionId: null
        },
        petIds
      },
      {
        useCustomerDaycareSubscription: true,
        ignoreCustomerDaycareSubscriptionErrors: true
      }
    )

    expect(await subscriptionIdsForDate(customerId, date)).toEqual([monthPack])
    expect(await remaining(monthPack)).toBe(4)
    expect(await remaining(yearPack)).toBe(5)
  })
})

describe('a pack turning PAID backfills unlinked dates by the day', () => {
  it('spends one day per pet, so a two-pet date costs two', async () => {
    const { customerId, petIds } = await makeCustomer(2)
    const planId = await makePlan(5)
    // Three unlinked two-pet dates inside the pack's window: six days of demand
    // against a five-day pack. The old row limit would have attached all three
    // (three rows <= five) and charged the pack six days.
    for (const date of ['2026-11-02', '2026-11-03', '2026-11-04']) {
      await makeDaycareDate({
        customerId,
        date,
        petIds,
        subscriptionId: null,
        status: 'pending'
      })
    }
    const pack = await makeSubscription({
      customerId,
      planId,
      effectiveDate: '2026-11-01',
      expirationDate: '2026-12-01',
      status: CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS.OPEN
    })

    await setCustomerDaycareSubscriptionStatus({
      id: pack,
      status: CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS.PAID
    })

    const linked = await db
      .selectFrom('daycareDates')
      .select(['date', 'customerDaycareSubscriptionId'])
      .where('customerId', '=', customerId)
      .orderBy('date')
      .execute()

    expect(linked.map((row) => row.customerDaycareSubscriptionId)).toEqual([
      pack,
      pack,
      null
    ])
    expect(await remaining(pack)).toBe(1)
  })
})

describe('the pick takes a lock, so the last day cannot be spent twice', () => {
  const oneDayLeftFixture = async () => {
    const { customerId, petIds } = await makeCustomer(1)
    const planId = await makePlan(5)
    const pack = await makeSubscription({
      customerId,
      planId,
      effectiveDate: '2026-11-01',
      expirationDate: '2027-11-01'
    })
    // Four of five days used, so exactly one day is left.
    for (const date of [
      '2026-11-02',
      '2026-11-03',
      '2026-11-04',
      '2026-11-05'
    ]) {
      await makeDaycareDate({ customerId, date, petIds, subscriptionId: pack })
    }
    return { customerId, petIds, pack }
  }

  it('blocks a booking while another transaction holds the pack row', async () => {
    const { customerId, petIds, pack } = await oneDayLeftFixture()

    // `FOR NO KEY UPDATE` is the interesting mode: the foreign key check of a
    // plain insert takes KEY SHARE, which does not conflict with it, so only an
    // explicit `FOR UPDATE` in the pick blocks here.
    const blocker = await db.startTransaction().execute()
    await blocker
      .selectFrom('customerDaycareSubscriptions')
      .where('id', '=', pack)
      .forNoKeyUpdate()
      .select('id')
      .execute()

    let settled = false
    const booking = createOrUpdateDaycareDates(
      [{ date: '2026-11-10', customerId, petIds }],
      {
        useCustomerDaycareSubscription: true,
        ignoreCustomerDaycareSubscriptionErrors: true
      }
    ).then(() => {
      settled = true
    })

    // Without the lock in `createDaycareDate` this resolves while the row is held.
    await new Promise((resolve) => setTimeout(resolve, 400))
    expect(settled).toBe(false)

    await blocker.commit().execute()
    await booking
    expect(await remaining(pack)).toBe(0)
  })

  it('leaves the second date unlinked when only one day is left', async () => {
    const { customerId, petIds, pack } = await oneDayLeftFixture()

    for (const date of ['2026-11-10', '2026-11-11']) {
      await createOrUpdateDaycareDates([{ date, customerId, petIds }], {
        useCustomerDaycareSubscription: true,
        ignoreCustomerDaycareSubscriptionErrors: true
      })
    }

    expect(await remaining(pack)).toBe(0)
    const rows = await db
      .selectFrom('daycareDates')
      .select(['date', 'customerDaycareSubscriptionId'])
      .where('customerId', '=', customerId)
      .where('date', 'in', ['2026-11-10', '2026-11-11'])
      .orderBy('date')
      .execute()
    expect(rows.map((row) => row.customerDaycareSubscriptionId)).toEqual([
      pack,
      null
    ])
  })
})

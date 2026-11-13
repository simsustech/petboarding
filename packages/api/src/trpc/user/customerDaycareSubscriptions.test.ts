import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { initTRPC } from '@trpc/server'
import type { FastifyInstance } from 'fastify'
import { userCustomerDaycareSubscriptionRoutes } from './customerDaycareSubscriptions.js'
import { db } from '../../kysely/index.js'
import { CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS } from '@petboarding/tools/constants'

/**
 * The account page must show every pack a booked day can come off, including one
 * that expired inside the slack window while it still has days left. The query
 * used to filter `expirationDate >= today`, so a deduction into such a pack was
 * invisible — which is what the customer reported.
 */

vi.mock('../../repositories/customer.js', () => ({
  findCustomer: vi.fn()
}))

const { findCustomer } = await import('../../repositories/customer.js')

const t = initTRPC.context<{ account?: { id: string | number } }>().create()

const router = t.router({
  ...userCustomerDaycareSubscriptionRoutes({
    fastify: undefined as unknown as FastifyInstance,
    procedure: t.procedure
  })
})

const caller = router.createCaller({
  account: { id: 9001 },
  fastify: undefined as unknown as FastifyInstance
})

let customerId: number
let planId: number
const subscriptionIds: number[] = []

beforeEach(async () => {
  const customer = await db
    .insertInto('customers')
    .values({
      gender: 'other',
      firstName: 'visibility-test',
      lastName: 'fixture',
      address: '1 Test Street',
      city: 'Testville',
      postalCode: '1234 AB',
      telephoneNumber: '+31 20 000 0000',
      veterinarian: 'Dr. Example'
    })
    .returning('id')
    .executeTakeFirstOrThrow()
  customerId = customer.id

  const plan = await db
    .insertInto('daycareSubscriptions')
    .values({
      description: 'visibility-test 5 days',
      numberOfDays: 5,
      validityPeriod: { years: 1, months: 0, days: 0 } as never,
      listPrice: 5000
    })
    .returning('id')
    .executeTakeFirstOrThrow()
  planId = plan.id

  vi.mocked(findCustomer).mockResolvedValue({ id: customerId } as never)
})

afterEach(async () => {
  await db.deleteFrom('customers').where('id', '=', customerId).execute()
  await db
    .deleteFrom('customerDaycareSubscriptions')
    .where('id', 'in', subscriptionIds)
    .execute()
  await db.deleteFrom('daycareSubscriptions').where('id', '=', planId).execute()
  subscriptionIds.length = 0
})

const subscribe = async ({
  effectiveDate,
  expirationDate
}: {
  effectiveDate: string
  expirationDate: string
}) => {
  const subscription = await db
    .insertInto('customerDaycareSubscriptions')
    .values({
      customerId,
      daycareSubscriptionId: planId,
      effectiveDate,
      expirationDate,
      status: CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS.PAID
    })
    .returning('id')
    .executeTakeFirstOrThrow()
  subscriptionIds.push(subscription.id)
  return subscription.id
}

const today = new Date().toISOString().slice(0, 10)
const plusDays = (days: number, from = new Date()) =>
  new Date(from.getTime() + days * 86400000).toISOString().slice(0, 10)

describe('user.getCustomerDaycareSubscriptions', () => {
  it('returns a pack that expired inside the slack month while it has days left', async () => {
    const expiredWithDays = await subscribe({
      effectiveDate: plusDays(-60),
      expirationDate: plusDays(-10)
    })
    const active = await subscribe({
      effectiveDate: plusDays(-5),
      expirationDate: plusDays(30)
    })

    const result = await caller.getCustomerDaycareSubscriptions({})

    expect(result.map((subscription) => subscription.id).sort()).toEqual(
      [active, expiredWithDays].sort()
    )
  })

  it('hides a pack that expired and has no days left', async () => {
    const expiredEmpty = await subscribe({
      effectiveDate: plusDays(-60),
      expirationDate: plusDays(-10)
    })
    const active = await subscribe({
      effectiveDate: plusDays(-5),
      expirationDate: plusDays(30)
    })
    // All five days of the expired pack are used.
    for (const date of [
      '2026-01-05',
      '2026-01-06',
      '2026-01-07',
      '2026-01-08',
      '2026-01-09'
    ]) {
      const row = await db
        .insertInto('daycareDates')
        .values({
          date,
          customerId,
          status: 'approved',
          customerDaycareSubscriptionId: expiredEmpty
        })
        .returning('id')
        .executeTakeFirstOrThrow()
      const [pet] = await db
        .insertInto('pets')
        .values({
          name: `visibility-${date}`,
          species: 'dog',
          breed: 'mixed',
          gender: 'male',
          sterilized: true,
          birthDate: '2020-01-01',
          customerId
        })
        .returning('id')
        .execute()
      await db
        .insertInto('daycareDatePetKennel')
        .values({ daycareDateId: row.id, petId: pet.id })
        .execute()
    }

    const result = await caller.getCustomerDaycareSubscriptions({})

    expect(result.map((subscription) => subscription.id)).toEqual([active])
    expect(today).toBeTruthy()
  })
})

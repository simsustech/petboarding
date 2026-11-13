import { beforeEach, describe, expect, it, vi } from 'vitest'
import { initTRPC } from '@trpc/server'
import type { FastifyInstance } from 'fastify'
import { userDaycareRoutes } from './daycare.js'

/**
 * The portal shows `error.message` in a notification, so the rejection reason has
 * to survive the route. The message used to arrive as "Error: <reason>" because a
 * TRPCError stringifies whatever it is handed; these assertions pin the contract.
 */

vi.mock('../../repositories/customer.js', () => ({
  findCustomer: vi.fn()
}))

vi.mock('../../repositories/daycare.js', () => ({
  findDaycareDates: vi.fn(),
  findDaycareDatesByIds: vi.fn(),
  createOrUpdateDaycareDates: vi.fn(),
  updateDaycareDate: vi.fn()
}))

vi.mock('../../repositories/daycareSubscription.js', () => ({
  findDaycareSubscriptions: vi.fn()
}))

const { findCustomer } = await import('../../repositories/customer.js')
const { createOrUpdateDaycareDates } =
  await import('../../repositories/daycare.js')
const { findDaycareSubscriptions } =
  await import('../../repositories/daycareSubscription.js')

const t = initTRPC.context<{ account?: { id: string | number } }>().create()

const router = t.router({
  ...userDaycareRoutes({ procedure: t.procedure })
})

const callerFor = (account?: { id: string | number }) =>
  router.createCaller({
    account,
    fastify: undefined as unknown as FastifyInstance
  })

const account = { id: 42 }

beforeEach(() => {
  vi.mocked(findCustomer).mockReset()
  vi.mocked(findCustomer).mockResolvedValue({ id: 7 } as never)
  vi.mocked(findDaycareSubscriptions).mockReset()
  vi.mocked(findDaycareSubscriptions).mockResolvedValue([{ id: 1 }] as never)
  vi.mocked(createOrUpdateDaycareDates).mockReset()
})

describe('user.createDaycareDates', () => {
  it('passes the subscription selection through with the customer attached', async () => {
    vi.mocked(createOrUpdateDaycareDates).mockResolvedValue(true)

    await callerFor(account).createDaycareDates([
      { date: '2026-11-20', petIds: [3] }
    ])

    expect(createOrUpdateDaycareDates).toHaveBeenCalledWith(
      [{ date: '2026-11-20', petIds: [3], customerId: 7 }],
      { useCustomerDaycareSubscription: true }
    )
  })

  it('reports the reason when no pack covers the date', async () => {
    const reason =
      'No valid customer daycare subscription available for date 2026-11-20'
    vi.mocked(createOrUpdateDaycareDates).mockRejectedValue(new Error(reason))

    await expect(
      callerFor(account).createDaycareDates([
        { date: '2026-11-20', petIds: [3] }
      ])
    ).rejects.toThrow(reason)
  })

  it('does not require a subscription while no plan is configured', async () => {
    vi.mocked(findDaycareSubscriptions).mockResolvedValue([])
    vi.mocked(createOrUpdateDaycareDates).mockResolvedValue(true)

    await callerFor(account).createDaycareDates([
      { date: '2026-11-20', petIds: [3] }
    ])

    expect(createOrUpdateDaycareDates).toHaveBeenCalledWith(
      [{ date: '2026-11-20', petIds: [3], customerId: 7 }],
      { useCustomerDaycareSubscription: false }
    )
  })
})

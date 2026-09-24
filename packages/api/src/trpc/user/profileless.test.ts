import { describe, expect, it, vi, beforeEach } from 'vitest'
import { initTRPC, TRPCError } from '@trpc/server'
import type { FastifyInstance } from 'fastify'
import { userPetRoutes } from './pets.js'
import { userBookingRoutes } from './bookings.js'
import { userDaycareRoutes } from './daycare.js'
import { userCustomerDaycareSubscriptionRoutes } from './customerDaycareSubscriptions.js'

/**
 * An authenticated account without a customer profile (staff accounts: the seeded
 * admin, for instance) used to make every `user.*` query throw BAD_REQUEST — the
 * audit captured the resulting red toasts on `/account/pets`, `/account/bookings`,
 * `/account/daycare` and the `user.getDaycareDates` 400 in the request log.
 *
 * A profileless account is a valid state, so the queries return empty results;
 * BAD_REQUEST stays reserved for unauthenticated callers. Exercised through each
 * router's public procedure — the repositories are the only thing mocked.
 */

vi.mock('../../repositories/customer.js', () => ({
  findCustomer: vi.fn()
}))
vi.mock('../../repositories/pet.js', () => ({
  findPets: vi.fn(),
  createPet: vi.fn(),
  updatePet: vi.fn()
}))
vi.mock('../../repositories/booking.js', () => ({
  findBookings: vi.fn(),
  createBooking: vi.fn(),
  updateBooking: vi.fn(),
  cancelBooking: vi.fn()
}))
vi.mock('../../repositories/daycare.js', () => ({
  findDaycareDates: vi.fn(),
  createDaycareDates: vi.fn(),
  cancelDaycareDates: vi.fn()
}))
vi.mock('../../repositories/customerDaycareSubscription.js', () => ({
  findCustomerDaycareSubscriptions: vi.fn(),
  createCustomerDaycareSubscription: vi.fn()
}))

const { findCustomer } = await import('../../repositories/customer.js')

const t = initTRPC.context<{ account?: { id: string | number } }>().create()

const router = t.router({
  ...userPetRoutes({ procedure: t.procedure }),
  ...userBookingRoutes({ procedure: t.procedure }),
  ...userDaycareRoutes({ procedure: t.procedure }),
  ...userCustomerDaycareSubscriptionRoutes({ procedure: t.procedure })
})

const callerFor = (account?: { id: string | number }) =>
  router.createCaller({
    account,
    fastify: undefined as unknown as FastifyInstance
  })

describe('user queries for an account without a customer profile', () => {
  beforeEach(() => {
    vi.mocked(findCustomer).mockReset()
    vi.mocked(findCustomer).mockResolvedValue(undefined as never)
  })

  it('getPets returns an empty list instead of BAD_REQUEST', async () => {
    await expect(callerFor({ id: 6 }).getPets()).resolves.toEqual([])
  })

  it('getBookings returns an empty list instead of BAD_REQUEST', async () => {
    await expect(callerFor({ id: 6 }).getBookings()).resolves.toEqual([])
  })

  it('getDaycareDates returns an empty list instead of BAD_REQUEST', async () => {
    await expect(
      callerFor({ id: 6 }).getDaycareDates({ from: '', until: '' })
    ).resolves.toEqual([])
  })

  it('getCustomerDaycareSubscriptions returns an empty list instead of BAD_REQUEST', async () => {
    await expect(
      callerFor({ id: 6 }).getCustomerDaycareSubscriptions()
    ).resolves.toEqual([])
  })

  it('still refuses unauthenticated callers with BAD_REQUEST', async () => {
    const unauthenticated = callerFor(undefined)
    await expect(unauthenticated.getPets()).rejects.toThrow(TRPCError)
    await expect(unauthenticated.getBookings()).rejects.toThrow(TRPCError)
    await expect(
      unauthenticated.getDaycareDates({ from: '', until: '' })
    ).rejects.toThrow(TRPCError)
    await expect(
      unauthenticated.getCustomerDaycareSubscriptions()
    ).rejects.toThrow(TRPCError)
  })
})

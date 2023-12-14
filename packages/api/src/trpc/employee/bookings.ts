import { TRPCError } from '@trpc/server'
import { t } from '../index.js'
import * as z from 'zod'
import { booking, BOOKING_STATUS } from '../../zod/booking.js'
import type { FastifyInstance } from 'fastify'
import {
  cancelBooking,
  findBooking,
  findBookings,
  findBookingService,
  updateBooking
} from 'src/repositories/booking'

export const employeeBookingValidation = booking.omit({
  customerId: true,
  customer: true,
  orderId: true,
  pets: true,
  status: true,
  statuses: true,
  startTime: true,
  endTime: true,
  services: true,
  days: true
})

export const employeeBookingRoutes = ({
  // fastify,
  procedure
}: {
  fastify?: FastifyInstance
  procedure: typeof t.procedure
}) => ({
  getBooking: procedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const { id } = input
      if (id) {
        const booking = findBooking({
          criteria: {
            id
          }
        })

        return booking
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  getBookingsByIds: procedure
    .input(z.object({ ids: z.number().array() }))
    .query(async ({ input }) => {
      const { ids } = input
      if (ids) {
        const bookings = findBookings({
          criteria: {
            ids
          }
        })

        return bookings
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  getBookings: procedure
    .input(
      z.object({
        from: z.string(),
        until: z.string(),
        status: z.nativeEnum(BOOKING_STATUS)
      })
    )
    .query(async ({ input }) => {
      const { from, until, status } = input
      if (from && until) {
        const bookings = findBookings({
          criteria: {
            from,
            until,
            status
          }
        })
        return bookings
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  getBookingService: procedure
    .input(
      z.object({
        id: z.number()
      })
    )
    .query(async ({ input }) => {
      const { id } = input
      if (id) {
        const bookingService = findBookingService({
          criteria: {
            id
          }
        })
        return bookingService
      }

      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  updateBooking: procedure
    .input(employeeBookingValidation.required({ id: true }))
    .mutation(async ({ input }) => {
      if (input.id) {
        const booking = await updateBooking(
          {
            id: input.id
          },
          {
            booking: {
              startDate: input.startDate,
              endDate: input.endDate,
              startTimeId: input.startTimeId,
              endTimeId: input.endTimeId,
              comments: input.comments
            },
            petIds: input.petIds,
            serviceIds: input.serviceIds!
          }
        )
        return booking
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  cancelBooking: procedure
    .input(
      z.object({
        id: z.number(),
        reason: z.string()
      })
    )
    .mutation(async ({ input }) => {
      if (input.id) {
        const { id, reason } = input

        if (id) {
          await cancelBooking({ id }, reason)
          return true
        }
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }
    })
})

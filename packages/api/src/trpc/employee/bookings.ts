import { TRPCError } from '@trpc/server'
import { t } from '../index.js'
import * as z from 'zod'
import { booking, BOOKING_STATUS } from '../../zod/booking.js'
import type { FastifyInstance } from 'fastify'
import {
  cancelBooking,
  createBooking,
  findBooking,
  findBookings,
  findBookingService,
  updateBooking
} from '../../repositories/booking.js'
import { findCustomer } from 'src/repositories/customer.js'
import { createOrUpdateSlimfactInvoice } from '../admin/bookings.js'

export const employeeBookingValidation = booking
  .omit({
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
  .required({
    customerId: true
  })

export const employeeUpdateBookingValidation = employeeBookingValidation.omit({
  customerId: true
})

export const employeeBookingRoutes = ({
  fastify,
  procedure
}: {
  fastify: FastifyInstance
  procedure: typeof t.procedure
}) => ({
  createBooking: procedure
    .input(employeeBookingValidation)
    .mutation(async ({ input }) => {
      const booking = await createBooking({
        booking: {
          startDate: input.startDate,
          endDate: input.endDate,
          startTimeId: input.startTimeId,
          endTimeId: input.endTimeId,
          comments: input.comments,
          customerId: input.customerId
        },
        serviceIds: input.serviceIds || [],
        status: BOOKING_STATUS.PENDING,
        petIds: input.petIds
      })
      return booking
    }),
  getBooking: procedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const { id } = input
      if (id) {
        const booking = findBooking({
          criteria: {
            id
          },
          fastify
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
          },
          fastify
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
        status: z.nativeEnum(BOOKING_STATUS).optional(),
        customerId: z.number().optional()
      })
    )
    .query(async ({ input }) => {
      const { from, until, status, customerId } = input
      if (from && until) {
        const bookings = findBookings({
          criteria: {
            from,
            until,
            status,
            customerId
          },
          fastify
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
    .input(employeeUpdateBookingValidation.required({ id: true }))
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
          // {
          //   skipStatusUpdate: true
          // }
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
          await cancelBooking({ id }, reason, true)
          return true
        }
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }
    }),
  updateBookingInvoice: procedure
    .input(
      z.object({
        id: z.number()
      })
    )
    .mutation(async ({ input }) => {
      if (fastify.slimfact) {
        const { id } = input
        const booking = await findBooking({
          criteria: {
            id
          }
        })

        const customer = await findCustomer({
          criteria: {
            id: booking?.customerId
          }
        })

        if (booking?.costs && customer) {
          const result = await createOrUpdateSlimfactInvoice({
            fastify,
            booking,
            customer
          })
          if (!result.success) {
            fastify.log.debug(result.errorMessage)
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: result.errorMessage
            })
          }
        }
      }
    })
})

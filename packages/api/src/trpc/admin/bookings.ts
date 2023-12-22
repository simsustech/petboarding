import { TRPCError } from '@trpc/server'
import { t } from '../index.js'
import * as z from 'zod'
import { BOOKING_STATUS, bookingService } from '../../zod/booking.js'
import handlebars from 'handlebars'
import {
  format,
  parseISO,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth
} from 'date-fns'

import type { FastifyInstance } from 'fastify'
import {
  createBookingStatus,
  findBooking,
  findBookings,
  getBookingsCount,
  updateBookingService,
  cancelBooking
} from '../../repositories/booking.js'
import type { ParsedBooking } from '../../repositories/booking.js'
import { findEmailTemplate } from 'src/repositories/emailTemplate.js'
import { findCustomer } from 'src/repositories/customer.js'

export const compileEmail = async ({
  booking,
  subjectTemplate,
  bodyTemplate,
  localeCode,
  variables
}: {
  booking: ParsedBooking
  subjectTemplate: string
  bodyTemplate: string
  localeCode?: string
  variables?: Record<string, string>
}) => {
  let locale
  try {
    locale = (await import(`date-fns/locale/${localeCode}/index.js`)).default
  } catch {
    locale = (
      await import(
        `date-fns/locale/${process.env.VITE_LANG || 'en-US'}/index.js`
      )
    ).default
  }

  const context = {
    customer: {
      firstName: booking.customer?.firstName,
      lastName: booking.customer?.lastName
    },
    pets: booking.pets.map((pet) => pet.name).join(', '),
    startDate: format(parseISO(booking.startDate), 'EEEE dd MMM yyyy', {
      locale
    }),
    endDate: format(parseISO(booking.endDate), 'EEEE dd MMM yyyy', {
      locale
    }),
    startTime: booking.startTime?.name,
    endTime: booking.endTime?.name,
    ...variables
  }
  const subject = handlebars.compile(subjectTemplate)(context)
  const body = handlebars.compile(bodyTemplate)(context)

  return {
    subject,
    body
  }
}

export const adminBookingRoutes = ({
  fastify,
  procedure
}: {
  fastify: FastifyInstance
  procedure: typeof t.procedure
}) => ({
  getBookings: procedure
    .input(
      z.object({
        from: z.string().optional(),
        until: z.string().optional(),
        status: z.nativeEnum(BOOKING_STATUS)
      })
    )
    .query(async ({ input }) => {
      const { from, until, status } = input
      const bookings = await findBookings({
        criteria: {
          from,
          until,
          status
        },
        limit: 25
      })
      return bookings
    }),
  getBookingEmail: procedure
    .input(
      z.object({
        id: z.number(),
        type: z.enum(['approve', 'reject', 'reply', 'standby']),
        localeCode: z.string().optional()
      })
    )
    .query(async ({ input }) => {
      const { id, type, localeCode } = input
      const booking = await findBooking({
        criteria: {
          id
        }
      })
      if (booking) {
        const template = await findEmailTemplate({
          criteria: {
            name: type + 'Booking'
          }
        })

        if (template) {
          const { subject: subjectTemplate, body: bodyTemplate } = template

          if (subjectTemplate !== null && bodyTemplate !== null) {
            const { subject, body } = await compileEmail({
              booking,
              subjectTemplate,
              bodyTemplate,
              localeCode
            })

            return {
              subject,
              body
            }
          }
        }
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  approveBooking: procedure
    .input(
      z.object({
        id: z.number(),
        emailText: z.string(),
        emailSubject: z.string()
      })
    )
    .mutation(async ({ input }) => {
      const { id, emailText, emailSubject } = input
      const booking = await findBooking({
        criteria: {
          id
        }
      })
      if (booking) {
        await createBookingStatus({
          booking,
          status: BOOKING_STATUS.APPROVED,
          petIds: booking.pets.map((pet) => pet.id)
        })
        if (booking?.customerId) {
          const customer = await findCustomer({
            criteria: {
              id: booking.customerId
            }
          })
          if (customer?.account?.email) {
            if (fastify?.mailer) {
              await fastify.mailer.sendMail({
                to: customer.account.email,
                subject: emailSubject,
                html: emailText
              })
            }
            return true
          }
        }
        return true
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  rejectBooking: procedure
    .input(
      z.object({
        id: z.number(),
        emailText: z.string(),
        emailSubject: z.string()
      })
    )
    .mutation(async ({ input }) => {
      const { id, emailText, emailSubject } = input
      const booking = await findBooking({
        criteria: {
          id
        }
      })
      if (booking) {
        await createBookingStatus({
          booking,
          status: BOOKING_STATUS.REJECTED,
          petIds: booking.pets.map((pet) => pet.id)
        })
        if (booking?.customerId) {
          const customer = await findCustomer({
            criteria: {
              id: booking.customerId
            }
          })
          if (customer?.account?.email) {
            if (fastify?.mailer) {
              await fastify.mailer.sendMail({
                to: customer.account.email,
                subject: emailSubject,
                html: emailText
              })
            }
            return true
          }
        }

        return true
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  standbyBooking: procedure
    .input(
      z.object({
        id: z.number(),
        emailText: z.string(),
        emailSubject: z.string()
      })
    )
    .mutation(async ({ input }) => {
      const { id, emailText, emailSubject } = input
      const booking = await findBooking({
        criteria: {
          id
        }
      })
      if (booking) {
        await createBookingStatus({
          booking,
          status: BOOKING_STATUS.STANDBY,
          petIds: booking.pets.map((pet) => pet.id)
        })
        if (booking?.customerId) {
          const customer = await findCustomer({
            criteria: {
              id: booking.customerId
            }
          })
          if (customer?.account?.email) {
            if (fastify?.mailer) {
              await fastify.mailer.sendMail({
                to: customer.account.email,
                subject: emailSubject,
                html: emailText
              })
            }
            return true
          }
        }

        return true
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  replyBooking: procedure
    .input(
      z.object({
        id: z.number(),
        emailText: z.string(),
        emailSubject: z.string()
      })
    )
    .mutation(async ({ input }) => {
      const { id, emailText, emailSubject } = input
      const booking = await findBooking({
        criteria: {
          id
        }
      })
      if (booking) {
        if (booking?.customerId) {
          const customer = await findCustomer({
            criteria: {
              id: booking.customerId
            }
          })
          if (customer?.account?.email) {
            if (fastify?.mailer) {
              await fastify.mailer.sendMail({
                to: customer.account.email,
                subject: emailSubject,
                html: emailText
              })
            }
            return true
          }
        }
      }

      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  getOccupancy: procedure
    .input(
      z.object({
        date: z.string(),
        status: z.nativeEnum(BOOKING_STATUS)
      })
    )
    .query(async ({ input }) => {
      const { date, status } = input
      const parsedDate = parseISO(date)
      const from = startOfMonth(parsedDate).toISOString().slice(0, 10)
      const until = endOfMonth(parsedDate).toISOString().slice(0, 10)

      const bookings = await findBookings({
        criteria: {
          from,
          until,
          status
        }
      })

      const occupancy: Record<string, number> =
        bookings?.reduce(
          (acc, cur) => {
            const dates = eachDayOfInterval({
              start: parseISO(cur.startDate),
              end: parseISO(cur.endDate)
            })
            for (const date of dates) {
              const dateString = date.toISOString().slice(0, 10)
              acc[dateString] = acc[dateString] ? acc[dateString] + 1 : 1
            }
            return acc
          },
          {} as Record<string, number>
        ) || {}
      return occupancy
    }),
  updateBookingService: procedure
    .input(bookingService)
    .mutation(async ({ input }) => {
      const { id } = input
      if (id) {
        const updatedBookingService = await updateBookingService(
          {
            id
          },
          {
            comments: input.comments || null,
            price: input.price || null
          }
        )
        if (updatedBookingService) return bookingService
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  getBookingsCount: procedure
    .input(
      z.object({
        status: z.nativeEnum(BOOKING_STATUS)
      })
    )
    .query(async ({ input }) => {
      const { status } = input
      if (status) {
        const count = await getBookingsCount(status)
        return count
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  settleBookingCancellation: procedure
    .input(
      z.object({
        id: z.number()
      })
    )
    .mutation(async ({ input }) => {
      const { id } = input
      const success = await cancelBooking({ id }, '', true)
      if (success) return true
      throw new TRPCError({ code: 'BAD_REQUEST' })
    })
})

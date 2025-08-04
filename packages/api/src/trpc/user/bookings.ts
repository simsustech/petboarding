import { TRPCError } from '@trpc/server'
import { t } from '../index.js'
import { booking, BOOKING_STATUS } from '../../zod/booking.js'
import * as z from 'zod'
import type { FastifyInstance } from 'fastify'
import {
  cancelBooking,
  createBooking,
  findBooking,
  findBookings,
  updateBooking
} from '../../repositories/booking.js'
import { findCustomer } from '../../repositories/customer'
import env from '@vitrify/tools/env'
import { compileEmail } from '../admin/bookings'
import { createOrUpdateSlimfactInvoice } from '../admin/bookings'
import { bookingEmailTemplates } from 'src/templates/email/bookings/index.js'

const MAIL_BCC = env.read('MAIL_BCC') || env.read('VITE_MAIL_BCC')

export const findIds = ({
  currentIds,
  newIds
}: {
  currentIds: number[]
  newIds: number[]
}) => {
  const createdIds = newIds.filter(
    (serviceId) => !currentIds.includes(serviceId)
  )
  const deletedIds = currentIds.filter(
    (serviceId) => !newIds.includes(serviceId)
  )
  return {
    createdIds,
    deletedIds
  }
}

export const userBookingValidation = booking.omit({
  customerId: true,
  orderId: true,
  pets: true,
  status: true,
  statuses: true,
  startTime: true,
  endTime: true,
  services: true,
  days: true
})

export const userBookingRoutes = ({
  fastify,
  procedure
}: {
  fastify?: FastifyInstance
  procedure: typeof t.procedure
}) => ({
  getBookings: procedure.query(async ({ ctx }) => {
    if (ctx.account?.id) {
      const customer = await findCustomer({
        criteria: {
          accountId: Number(ctx.account.id)
        }
      })
      if (customer?.id) {
        const bookings = await findBookings({
          criteria: {
            customerId: customer.id
          },
          fastify
        })
        return bookings
      }
    }
    throw new TRPCError({ code: 'BAD_REQUEST' })
  }),
  createBooking: procedure
    .input(userBookingValidation)
    .mutation(async ({ input, ctx }) => {
      if (ctx.account?.id) {
        const customer = await findCustomer({
          criteria: {
            accountId: Number(ctx.account.id)
          }
        })
        if (customer?.id) {
          const booking = await createBooking({
            booking: {
              startDate: input.startDate,
              endDate: input.endDate,
              startTimeId: input.startTimeId,
              endTimeId: input.endTimeId,
              comments: input.comments,
              customerId: customer.id
            },
            serviceIds: input.serviceIds || [],
            status: BOOKING_STATUS.PENDING,
            petIds: input.petIds
          })
          return booking
        }
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  updateBooking: procedure
    .input(userBookingValidation.required({ id: true }))
    .mutation(async ({ input, ctx }) => {
      if (input.id && ctx.account?.id) {
        const customer = await findCustomer({
          criteria: {
            accountId: Number(ctx.account.id)
          }
        })

        if (customer) {
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
                comments: input.comments,
                customerId: customer.id
              },
              petIds: input.petIds,
              // status: BOOKING_STATUS.PENDING,
              serviceIds: input.serviceIds || []
            }
          )
          return booking
        }
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  cancelBooking: procedure
    .input(
      z.object({
        id: z.number(),
        reason: z.string(),
        localeCode: z.string().optional()
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (input.id && ctx.account?.id) {
        const { id, reason, localeCode = env.read('VITE_LANG') } = input
        const customer = await findCustomer({
          criteria: {
            accountId: Number(ctx.account.id)
          }
        })

        if (customer?.id) {
          await cancelBooking(
            {
              id,
              customerId: customer.id
            },
            reason
          )
          const booking = await findBooking({
            criteria: {
              id
            }
          })
          if (booking) {
            if (
              fastify?.slimfact &&
              booking?.statuses
                .map((status) => status.status)
                .includes(BOOKING_STATUS.APPROVED)
            ) {
              const result = await createOrUpdateSlimfactInvoice({
                fastify,
                booking,
                customer
              })
              if (!result.success) fastify.log.debug(result.errorMessage)
            }
            if (fastify?.mailer) {
              let template: { subject: string; body: string }
              try {
                template =
                  await bookingEmailTemplates[`./cancel/${localeCode}.ts`]()
              } catch (e) {
                template = await bookingEmailTemplates[`./cancel/en-US.ts`]()
              }

              if (template) {
                const { subject: subjectTemplate, body: bodyTemplate } =
                  template

                if (subjectTemplate !== null && bodyTemplate !== null) {
                  const { subject, body } = await compileEmail({
                    booking,
                    subjectTemplate,
                    bodyTemplate,
                    localeCode,
                    variables: {
                      reason
                    }
                  })

                  await fastify.mailer.sendMail({
                    from: `Petboarding <noreply@petboarding.app>`,
                    replyTo:
                      env.read('MAIL_REPLY_TO') ||
                      env.read('VITE_MAIL_REPLY_TO'),
                    to: customer.account?.email,
                    bcc: MAIL_BCC,
                    subject,
                    html: body
                  })
                }
              }
            }
          }
          return true
        }
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }
    })
})

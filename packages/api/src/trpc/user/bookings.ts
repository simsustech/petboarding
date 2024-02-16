import { TRPCError } from '@trpc/server'
import { t } from '../index.js'
import { booking, BOOKING_STATUS } from '../../zod/booking.js'
import * as z from 'zod'
import type { FastifyInstance } from 'fastify'
import { findOpeningTimes } from '../../repositories/openingTime'
import {
  cancelBooking,
  checkIfBookingCostsMatchOrder,
  createBooking,
  createOrUpdateBookingOrder,
  findBooking,
  findBookings,
  updateBooking
} from '../../repositories/booking.js'
import { findCustomer } from '../../repositories/customer'
import env from '@vitrify/tools/env'
import { findEmailTemplate } from 'src/repositories/emailTemplate'
import { compileEmail } from '../admin/bookings'

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

// const getAmountDue = ({
//   order,
//   payments
// }: {
//   order: Order
//   payments: PaymentPayload[]
// }) => {
//   const paidAmount = payments.reduce((acc, cur) => {
//     acc += Number(cur.amount)
//     return acc
//   }, 0)
//   if (order.totalIncludingTax) return order.totalIncludingTax - paidAmount * 100
//   return 0
// }

export const userBookingRoutes = ({
  fastify,
  procedure
}: {
  fastify: FastifyInstance
  procedure: typeof t.procedure
}) => ({
  getOpeningTimes: procedure
    .input(
      z.object({
        date: z.string()
      })
    )
    .query(async ({ input }) => {
      const date = input.date
      if (date) {
        const openingTimes = await findOpeningTimes({
          criteria: {},
          availableOnDate: date
        })
        return openingTimes
      }
      return []
    }),
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
          relations: {
            order: true
          }
        })

        for (const booking of bookings) {
          if (!checkIfBookingCostsMatchOrder(booking)) {
            fastify.log.info(`Updating order for booking ${booking.id}`)
            createOrUpdateBookingOrder({ booking, fastify })
          }
        }
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
              status: BOOKING_STATUS.PENDING,
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
        const { id, reason, localeCode } = input
        const customer = await findCustomer({
          criteria: {
            accountId: Number(ctx.account.id)
          }
        })

        if (customer?.id) {
          const booking = await findBooking({
            criteria: {
              id
            }
          })
          await cancelBooking(
            {
              id,
              customerId: customer.id
            },
            reason
          )
          if (fastify?.mailer && booking) {
            const template = await findEmailTemplate({
              criteria: {
                name: 'cancelBooking'
              }
            })

            if (template) {
              const { subject: subjectTemplate, body: bodyTemplate } = template

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
                  to: customer.account?.email,
                  bcc: MAIL_BCC,
                  subject,
                  html: body
                })
              }
            }
          }
          return true
        }
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }
    }),
  createOrderForBooking: procedure
    .input(
      z.object({
        bookingId: z.number()
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (fastify?.cart && input.bookingId && ctx.account?.id) {
        const { bookingId } = input
        const customer = await findCustomer({
          criteria: {
            accountId: Number(ctx.account.id)
          }
        })

        const booking = await findBooking({
          criteria: {
            id: bookingId
          }
        })

        if (booking && customer && booking?.customerId === customer?.id) {
          try {
            await createOrUpdateBookingOrder({
              booking,
              fastify
            })
          } catch (e) {
            console.error(e)
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'No costs available for booking'
            })
          }
          return true
        }
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  payAmountDueOnline: procedure
    .input(
      z.object({
        bookingId: z.number()
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { bookingId } = input
      const hostname = env.read('API_HOSTNAME') || env.read('VITE_API_HOSTNAME')
      const redirectUrl = `https://${hostname}/checkout/success`

      const accountId = Number(ctx.account?.id)
      if (accountId) {
        const customer = await findCustomer({
          criteria: {
            accountId
          }
        })

        const booking = await findBooking({
          criteria: {
            id: bookingId
          },
          relations: {
            order: true
          }
        })
        if (customer?.id !== booking?.customerId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Booking does not belong to customer.'
          })
        }

        if (
          booking &&
          booking.orderId &&
          fastify?.cart?.order &&
          fastify?.paymentHandlers?.mollie
        ) {
          const amountDue = booking.amountDue

          const orders = await fastify.cart.order.getOrders({
            accountId,
            ids: [booking.orderId]
          })
          const order = orders[0]

          if (amountDue > 0 && booking.orderId) {
            const payment = await fastify.paymentHandlers.mollie.createPayment({
              orderId: booking.orderId,
              amount: {
                value: amountDue,
                currency: 'EUR'
              },
              description: `#${order.uuid}`,
              redirectUrl,
              metadata: {
                vendor: 'petboarding',
                tenant: 'petboarding'
              }
            })
            if (payment.success) {
              return payment.checkoutUrl
            } else {
              throw new TRPCError({
                code: 'UNPROCESSABLE_CONTENT',
                message: payment.errorMessage
              })
            }
          }
        }
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  payCash: procedure
    .input(
      z.object({
        bookingId: z.number(),
        amount: z.number()
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { bookingId, amount } = input
      const hostname = env.read('API_HOSTNAME') || env.read('VITE_API_HOSTNAME')
      const redirectUrl = `https://${hostname}/checkout/success`

      const accountId = Number(ctx.account?.id)
      if (accountId) {
        const customer = await findCustomer({
          criteria: {
            accountId
          }
        })

        const booking = await findBooking({
          criteria: {
            id: bookingId
          },
          relations: {
            order: true
          }
        })
        if (customer?.id !== booking?.customerId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Booking does not belong to customer.'
          })
        }

        if (
          booking &&
          booking.orderId &&
          fastify?.cart?.order &&
          fastify?.paymentHandlers?.mollie
        ) {
          const orders = await fastify.cart.order.getOrders({
            accountId,
            ids: [booking.orderId]
          })
          const order = orders[0]

          if (amount > 0 && booking.orderId && fastify.paymentHandlers.cash) {
            const payment = await fastify.paymentHandlers.cash.createPayment({
              orderId: booking.orderId,
              amount: {
                value: amount,
                currency: 'EUR'
              },
              description: `#${order.uuid}`,
              redirectUrl,
              metadata: {
                vendor: 'petboarding',
                tenant: 'petboarding'
              }
            })
            if (payment.success) {
              return payment.checkoutUrl
            } else {
              throw new TRPCError({
                code: 'UNPROCESSABLE_CONTENT',
                message: payment.errorMessage
              })
            }
          }
        }
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    })
})

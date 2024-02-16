import { TRPCError } from '@trpc/server'
import { t } from '../index.js'
import * as z from 'zod'
import type { FastifyInstance } from 'fastify'
import { findBooking } from '../../repositories/booking.js'
import { findCustomer } from '../../repositories/customer'
import env from '@vitrify/tools/env'

export const pointOfSaleBookingRoutes = ({
  fastify,
  procedure
}: {
  fastify?: FastifyInstance
  procedure: typeof t.procedure
}) => ({
  payBookingCash: procedure
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

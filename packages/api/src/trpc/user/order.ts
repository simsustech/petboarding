import { t } from '../index.js'
import * as z from 'zod'
import type { FastifyInstance } from 'fastify'
import { TRPCError } from '@trpc/server'

export const userOrderRoutes = ({
  fastify,
  procedure
}: {
  fastify: FastifyInstance
  procedure: typeof t.procedure
}) => ({
  getOrder: procedure
    .input(
      z.object({
        orderId: z.number()
      })
    )
    .query(async ({ input, ctx }) => {
      if (fastify.cart?.order) {
        const accountId = Number(ctx.account?.id)

        const orders = await fastify.cart.order.getOrders({
          accountId,
          ids: [input.orderId]
        })
        if (orders.length) return orders[0]
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }
    })
})

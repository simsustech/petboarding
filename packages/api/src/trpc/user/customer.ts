import { TRPCError } from '@trpc/server'
import { t } from '../index.js'
import { customer } from '../../zod/customer.js'

import {
  createCustomer,
  findCustomer,
  updateCustomer
} from '../../repositories/customer.js'
import type { FastifyInstance } from 'fastify'

export const userCustomerValidation = customer.omit({
  comments: true,
  accountId: true,
  account: true,
  rating: true,
  bookings: true,
  pets: true
})

export const userCustomerRoutes = ({
  // fastify,
  procedure
}: {
  fastify?: FastifyInstance
  procedure: typeof t.procedure
}) => ({
  getCustomer: procedure.query(async ({ ctx }) => {
    if (ctx.account?.id) {
      const customer = await findCustomer({
        criteria: {
          accountId: Number(ctx.account.id)
        }
      })
      return customer
    }
    throw new TRPCError({ code: 'BAD_REQUEST' })
  }),
  createCustomer: procedure
    .input(userCustomerValidation)
    .mutation(async ({ input, ctx }) => {
      if (ctx.account?.id) {
        const customer = await createCustomer({
          ...input,
          accountId: Number(ctx.account.id)
        })
        return customer
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  updateCustomer: procedure
    .input(userCustomerValidation.required({ id: true }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.account?.id) {
        const customer = await updateCustomer(
          {
            accountId: Number(ctx.account.id)
          },
          input
        )

        return customer
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    })
})

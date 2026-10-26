import { TRPCError } from '@trpc/server'
import { t } from '../index.js'
import * as z from 'zod'
import type { FastifyInstance } from 'fastify'
import {
  createDaycareSubscription,
  deleteDaycareSubscription,
  findDaycareSubscriptions,
  updateDaycareSubscription
} from '../../repositories/daycareSubscription.js'
import { daycareSubscription as daycareSubscriptionValidation } from '../../zod/daycareSubscription.js'

export const configurationDaycareSubscriptionRoutes = ({
  // fastify,
  procedure
}: {
  fastify: FastifyInstance
  procedure: typeof t.procedure
}) => ({
  getDaycareSubscriptions: procedure
    .input(
      z.object({
        pagination: z
          .object({
            limit: z.number(),
            offset: z.number(),
            sortBy: z
              .union([
                z.literal('description'),
                z.literal('numberOfDays'),
                z.literal('listPrice')
              ])
              .nullable(),
            descending: z.boolean()
          })
          .optional()
      })
    )
    .query(async ({ input }) => {
      const daycareSubscriptions = await findDaycareSubscriptions({
        criteria: {},
        pagination: input.pagination
      })
      return daycareSubscriptions
    }),
  createDaycareSubscription: procedure
    .input(daycareSubscriptionValidation)
    .mutation(async ({ input }) => {
      await createDaycareSubscription({
        ...input,
        validityPeriod: JSON.stringify(input.validityPeriod)
      })
      return true
    }),
  updateDaycareSubscription: procedure
    .input(daycareSubscriptionValidation)
    .mutation(async ({ input }) => {
      await updateDaycareSubscription(
        {
          id: input.id
        },
        {
          ...input,
          validityPeriod: JSON.stringify(input.validityPeriod)
        }
      )
    }),
  deleteDaycareSubscription: procedure
    .input(
      z.object({
        id: z.number()
      })
    )
    .mutation(async ({ input }) => {
      if (input.id) {
        await deleteDaycareSubscription(input.id)
        return true
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    })
})

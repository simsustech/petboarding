import { TRPCError } from '@trpc/server'
import { t } from '../index.js'
import * as z from 'zod'
import type { FastifyInstance } from 'fastify'
import {
  createOrUpdateDaycareDates,
  findDaycareDates
} from '../../repositories/daycare.js'
import {
  CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS,
  DAYCARE_DATE_STATUS,
  daycareDate
} from '../../zod/index.js'
import { findDaycareSubscriptions } from 'src/repositories/daycareSubscription.js'
import { findCustomerDaycareSubscriptions } from 'src/repositories/customerDaycareSubscription.js'

export const employeeDaycareValidation = daycareDate
  .omit({
    pets: true,
    status: true
  })
  .required({
    customerId: true
  })

export const employeeDaycareRoutes = ({
  // fastify,
  procedure
}: {
  fastify?: FastifyInstance
  procedure: typeof t.procedure
}) => ({
  getDaycareDates: procedure
    .input(
      z.object({
        customerId: z.number().optional(),
        from: z.string(),
        until: z.string(),
        status: z.nativeEnum(DAYCARE_DATE_STATUS)
      })
    )
    .query(async ({ input }) => {
      const { customerId, from, until, status } = input
      if (from && until) {
        const daycareDates = await findDaycareDates({
          criteria: {
            customerId,
            from,
            until,
            status
          }
        })

        return daycareDates
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  createDaycareDates: procedure
    .input(employeeDaycareValidation.array())
    .mutation(async ({ input }) => {
      try {
        const daycareSubscriptions = await findDaycareSubscriptions({
          criteria: {}
        })
        await createOrUpdateDaycareDates(input, {
          useCustomerDaycareSubscription: !!daycareSubscriptions.length,
          ignoreCustomerDaycareSubscriptionErrors: true
        })
      } catch (e) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }
    }),
  getCustomerDaycareSubscriptions: procedure
    .input(
      z.object({
        from: z.string(),
        until: z.string(),
        status: z.nativeEnum(CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS).optional(),
        customerId: z.number().optional()
      })
    )
    .query(async ({ input }) => {
      const { customerId, status, from, until } = input
      if (from && until) {
        const customerDaycareSubscriptions =
          await findCustomerDaycareSubscriptions({
            criteria: {
              customerId,
              status,
              effectiveDate: until,
              expirationDate: from
            }
          })
        return customerDaycareSubscriptions
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    })
})

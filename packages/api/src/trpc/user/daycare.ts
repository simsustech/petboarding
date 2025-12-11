import { TRPCError } from '@trpc/server'
import { t } from '../index.js'
import { daycareDate, DAYCARE_DATE_STATUS } from '../../zod/daycare.js'
import * as z from 'zod'
import type { FastifyInstance } from 'fastify'
import {
  createOrUpdateDaycareDates,
  findDaycareDates,
  findDaycareDatesByIds,
  updateDaycareDate
} from '../../repositories/daycare.js'
import { findCustomer } from '../../repositories/customer.js'
import { addDays } from 'date-fns'
import { findDaycareSubscriptions } from 'src/repositories/daycareSubscription.js'

export const userDaycareValidation = daycareDate.omit({
  customerId: true,
  pets: true,
  status: true
})

export const userDaycareRoutes = ({
  // fastify,
  procedure
}: {
  fastify?: FastifyInstance
  procedure: typeof t.procedure
}) => ({
  getDaycareDates: procedure
    .input(
      z.object({
        from: z.string(),
        until: z.string()
      })
    )
    .query(async ({ input, ctx }) => {
      const { from, until } = input
      if (ctx.account?.id) {
        const customer = await findCustomer({
          criteria: {
            accountId: Number(ctx.account.id)
          }
        })
        if (customer?.id) {
          const daycareDates = findDaycareDates({
            criteria: {
              customerId: customer.id,
              from,
              until
            }
          })
          return daycareDates
        }
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  createDaycareDates: procedure
    .input(userDaycareValidation.array())
    .mutation(async ({ input, ctx }) => {
      try {
        if (ctx.account?.id) {
          const customer = await findCustomer({
            criteria: {
              accountId: Number(ctx.account.id)
            }
          })
          if (customer?.id) {
            const daycareSubscriptions = await findDaycareSubscriptions({
              criteria: {}
            })
            const daycareDates = input.map((daycareDate) => ({
              ...daycareDate,
              customerId: customer.id
            }))
            await createOrUpdateDaycareDates(daycareDates, {
              useCustomerDaycareSubscription: !!daycareSubscriptions.length
            })
          }
        }
      } catch (e) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: e as string })
      }
    }),

  cancelDaycareDates: procedure
    .input(z.number().array())
    .mutation(async ({ input, ctx }) => {
      console.log(ctx)
      if (input.length && ctx.account?.id) {
        const customer = await findCustomer({
          criteria: {
            accountId: Number(ctx.account.id)
          }
        })
        const daycareDates = await findDaycareDatesByIds(input)
        const daycareDateIds = daycareDates
          .filter(
            (daycareDate) =>
              daycareDate.date >
                addDays(new Date(), 1).toISOString().slice(0, 10) ||
              daycareDate.status === DAYCARE_DATE_STATUS.PENDING
          )
          .map((daycareDate) => daycareDate.id)

        if (customer?.id && daycareDateIds.length) {
          await updateDaycareDate(
            {
              ids: daycareDateIds,
              customerId: customer.id
            },
            {
              daycareDate: {
                status: DAYCARE_DATE_STATUS.CANCELED
              }
            }
          )
          return true
        }
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }
    })
})

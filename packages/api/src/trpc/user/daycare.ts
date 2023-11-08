import { TRPCError } from '@trpc/server'
import { t } from '../index.js'
import { daycareDate, DAYCARE_DATE_STATUS } from '../../zod/daycare.js'
import * as z from 'zod'
import type { FastifyInstance } from 'fastify'
import {
  createDaycareDate,
  findDaycareDates,
  updateDaycareDate
} from 'src/repositories/daycare'
import { findCustomer } from 'src/repositories/customer'

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
      if (ctx.account?.id) {
        const customer = await findCustomer({
          criteria: {
            accountId: Number(ctx.account.id)
          }
        })
        if (customer?.id) {
          const daycareDates = await Promise.all(
            input.map((daycareDate) =>
              createDaycareDate({
                daycareDate: {
                  date: daycareDate.date,
                  comments: daycareDate.comments,
                  customerId: customer.id,
                  status: DAYCARE_DATE_STATUS.PENDING
                },
                petIds: daycareDate.petIds
              })
            )
          )
          return daycareDates
        }
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),

  cancelDaycareDates: procedure
    .input(z.number().array())
    .mutation(async ({ input, ctx }) => {
      if (input.length && ctx.account?.id) {
        const customer = await findCustomer({
          criteria: {
            accountId: Number(ctx.account.id)
          }
        })
        const daycareDateIds = input
        if (customer?.id) {
          await updateDaycareDate(
            {
              ids: daycareDateIds
            },
            {
              daycareDate: {
                status: DAYCARE_DATE_STATUS.CANCELLED
              }
            }
          )
          return true
        }
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }
    })
})

import { TRPCError } from '@trpc/server'
import { t } from '../index.js'
import { daycareDate, DAYCARE_DATE_STATUS } from '../../zod/daycare.js'
import * as z from 'zod'
import type { FastifyInstance } from 'fastify'
import {
  createDaycareDate,
  findDaycareDates,
  findDaycareDatesByIds,
  updateDaycareDate
} from 'src/repositories/daycare'
import { findCustomer } from 'src/repositories/customer'
import { addDays } from 'date-fns'

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
            const currentDaycareDates = await findDaycareDates({
              criteria: {
                customerId: customer.id,
                dates: input.map((daycareDate) => daycareDate.date)
              }
            })

            const newDaycareDates = input.filter(
              (daycareDate) =>
                !currentDaycareDates.some(
                  (currentDaycareDate) =>
                    daycareDate.date === currentDaycareDate.date
                )
            )

            const updatedDaycareDates = currentDaycareDates
              .filter(
                (daycareDate) =>
                  daycareDate.status === DAYCARE_DATE_STATUS.CANCELLED
              )
              .map((daycareDate) => {
                return {
                  ...daycareDate,
                  petIds:
                    input.find((d) => d.date === daycareDate.date)?.petIds ||
                    daycareDate.pets.map((pet) => pet.id)
                }
              })
            await Promise.all([
              ...newDaycareDates.map((daycareDate) =>
                createDaycareDate({
                  daycareDate: {
                    date: daycareDate.date,
                    comments: daycareDate.comments,
                    customerId: customer.id,
                    status: DAYCARE_DATE_STATUS.PENDING
                  },
                  petIds: daycareDate.petIds
                })
              ),
              ...updatedDaycareDates.map((daycareDate) =>
                updateDaycareDate(
                  {
                    date: daycareDate.date,
                    customerId: customer.id
                  },
                  {
                    daycareDate: {
                      date: daycareDate.date,
                      comments: daycareDate.comments,
                      customerId: customer.id,
                      status: DAYCARE_DATE_STATUS.PENDING
                    },
                    petIds: daycareDate.petIds
                  }
                )
              )
            ])
            return true
          }
        }
      } catch (e) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }
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
        const daycareDates = await findDaycareDatesByIds(input)
        const daycareDateIds = daycareDates
          .filter(
            (daycareDate) =>
              daycareDate.date >
              addDays(new Date(), 1).toISOString().slice(0, 10)
          )
          .map((daycareDate) => daycareDate.id)

        if (customer?.id && daycareDateIds.length) {
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

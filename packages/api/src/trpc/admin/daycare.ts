import { TRPCError } from '@trpc/server'
import { t } from '../index.js'
import type { FastifyInstance } from 'fastify'

import * as z from 'zod'
import { DAYCARE_DATE_STATUS } from '../../zod/index.js'
import {
  findDaycareDates,
  getDaycareDateCount
} from '../../repositories/daycare.js'
import { updateDaycareDate } from '../../repositories/daycare'
import { addMonths } from 'date-fns'

export const adminDaycareRoutes = ({
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
        until: z.string(),
        status: z.nativeEnum(DAYCARE_DATE_STATUS)
      })
    )
    .query(async ({ input }) => {
      const { from, until, status } = input

      const daycareDates = await findDaycareDates({
        criteria: {
          from,
          until,
          status
        }
      })

      if (daycareDates) {
        return daycareDates
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  approveDaycareDateIds: procedure
    .input(z.number().array())
    .mutation(async ({ input }) => {
      const ids = input

      if (ids?.length) {
        const daycareDates = await findDaycareDates({
          criteria: {
            ids
          }
        })
        for (const daycareDate of daycareDates) {
          updateDaycareDate(
            {
              id: daycareDate.id
            },
            {
              daycareDate: {
                date: daycareDate.date,
                comments: daycareDate.comments,
                customerDaycareSubscriptionId:
                  daycareDate.customerDaycareSubscriptionId,
                customerId: daycareDate.customerId,
                status: DAYCARE_DATE_STATUS.APPROVED
              },
              petIds: daycareDate.pets.map((pet) => pet.id)
            },
            {
              useCustomerDaycareSubscription: true,
              ignoreCustomerDaycareSubscriptionErrors: true
            }
          )
        }

        return true
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  rejectDaycareDateIds: procedure
    .input(z.number().array())
    .mutation(async ({ input }) => {
      const ids = input

      if (ids?.length) {
        await updateDaycareDate(
          {
            ids
          },
          {
            daycareDate: {
              status: DAYCARE_DATE_STATUS.REJECTED
            }
          }
        )

        return true
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  standbyDaycareDateIds: procedure
    .input(z.number().array())
    .mutation(async ({ input }) => {
      const ids = input

      if (ids?.length) {
        await updateDaycareDate(
          {
            ids
          },
          {
            daycareDate: {
              status: DAYCARE_DATE_STATUS.STANDBY
            }
          }
        )

        return true
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  getDaycareCount: procedure
    .input(
      z.object({
        status: z.nativeEnum(DAYCARE_DATE_STATUS)
      })
    )
    .query(async ({ input }) => {
      const { status } = input

      const count = await getDaycareDateCount({
        status,
        maxDate: addMonths(new Date(), 1).toISOString().slice(0, 10)
      })

      return count
    })
})

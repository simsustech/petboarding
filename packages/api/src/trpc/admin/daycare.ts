import { TRPCError } from '@trpc/server'
import { t } from '../index.js'
import type { FastifyInstance } from 'fastify'

import * as z from 'zod'
import { DAYCARE_DATE_STATUS } from 'src/zod'
import { findDaycareDates, getDaycareDateCount } from 'src/repositories/daycare'
import { updateDaycareDate } from 'src/repositories/daycare'
import { addMonths, format } from 'date-fns'

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
        await updateDaycareDate(
          {
            ids
          },
          {
            daycareDate: {
              status: DAYCARE_DATE_STATUS.APPROVED
            }
          }
        )

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
        maxDate: format(addMonths(new Date(), 1), 'yyyy-MM-dd')
      })

      return count
    })
})

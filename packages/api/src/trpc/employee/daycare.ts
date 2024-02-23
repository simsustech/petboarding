import { TRPCError } from '@trpc/server'
import { t } from '../index.js'
import * as z from 'zod'
import type { FastifyInstance } from 'fastify'
import { findDaycareDates } from '../../repositories/daycare.js'
import { DAYCARE_DATE_STATUS } from '../../zod/index.js'

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
    })
})

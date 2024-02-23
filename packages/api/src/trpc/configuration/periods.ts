import { TRPCError } from '@trpc/server'
import { t } from '../index.js'
import { z } from 'zod'
import { period } from '../../zod/period.js'
import type { FastifyInstance } from 'fastify'
import {
  createPeriod,
  findPeriods,
  updatePeriod,
  deletePeriod
} from '../../repositories/period.js'

export const configurationPeriodRoutes = ({
  // fastify,
  procedure
}: {
  fastify?: FastifyInstance
  procedure: typeof t.procedure
}) => ({
  getPeriods: procedure.query(async () => {
    const periods = await findPeriods({
      criteria: {
        from: new Date().toISOString().slice(0, 10)
      }
    })
    if (periods) return periods
    throw new TRPCError({ code: 'BAD_REQUEST' })
  }),
  createPeriod: procedure.input(period).mutation(async ({ input }) => {
    const period = await createPeriod(input)

    if (period) return true

    throw new TRPCError({ code: 'BAD_REQUEST' })
  }),
  updatePeriod: procedure.input(period).mutation(async ({ input }) => {
    if (input.id) {
      const period = await updatePeriod(
        {
          id: input.id
        },
        input
      )

      if (period) return true

      throw new TRPCError({ code: 'BAD_REQUEST' })
    }
  }),
  deletePeriod: procedure.input(z.number()).mutation(async ({ input }) => {
    const result = await deletePeriod(input)
    if (result.numDeletedRows) return true
    throw new TRPCError({ code: 'BAD_REQUEST' })
  })
})

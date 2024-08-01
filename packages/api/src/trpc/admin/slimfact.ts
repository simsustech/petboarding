import { TRPCError } from '@trpc/server'
import { t } from '../index.js'
import type { FastifyInstance } from 'fastify'

export const adminSlimFactRoutes = ({
  fastify,
  procedure
}: {
  fastify: FastifyInstance
  procedure: typeof t.procedure
}) => ({
  slimfactHealthcheck: procedure.query(async () => {
    if (!fastify.slimfact) {
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }
    const result = await fastify?.slimfact.admin.healthcheck.query()
    if (!result) throw new TRPCError({ code: 'UNAUTHORIZED' })

    return result
  })
})

import { TRPCError } from '@trpc/server'
import { t } from '../index.js'
import { z } from 'zod'
import { service } from '../../zod/service.js'
import type { FastifyInstance } from 'fastify'
import {
  createService,
  findServices,
  updateService,
  deleteService
} from '../../repositories/service'

export const configurationServiceRoutes = ({
  // fastify,
  procedure
}: {
  fastify?: FastifyInstance
  procedure: typeof t.procedure
}) => ({
  getServices: procedure.query(async () => {
    const services = await findServices({ criteria: {} })
    if (services) return services
    throw new TRPCError({ code: 'BAD_REQUEST' })
  }),
  createService: procedure.input(service).mutation(async ({ input }) => {
    const service = await createService(input)

    if (service) return true

    throw new TRPCError({ code: 'BAD_REQUEST' })
  }),
  updateService: procedure.input(service).mutation(async ({ input }) => {
    if (input.id) {
      const service = await updateService(
        {
          id: input.id
        },
        input
      )

      if (service) return true

      throw new TRPCError({ code: 'BAD_REQUEST' })
    }
  }),
  deleteService: procedure.input(z.number()).mutation(async ({ input }) => {
    const result = await deleteService(input)
    if (result.numDeletedRows) return true
    throw new TRPCError({ code: 'BAD_REQUEST' })
  })
})

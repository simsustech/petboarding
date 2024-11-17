import { TRPCError } from '@trpc/server'
import { t } from '../index.js'
import { z } from 'zod'
import { kennel } from '../../zod/kennel.js'
import {
  findKennels,
  createKennel,
  updateKennel,
  deleteKennel
} from '../../repositories/kennel.js'
import type { FastifyInstance } from 'fastify'

export const configurationKennelRoutes = ({
  // fastify,
  procedure
}: {
  fastify?: FastifyInstance
  procedure: typeof t.procedure
}) => ({
  getKennels: procedure.query(async () => {
    const kennels = await findKennels({
      criteria: {}
    })
    if (kennels) return kennels
    throw new TRPCError({ code: 'BAD_REQUEST' })
  }),
  createKennel: procedure.input(kennel).mutation(async ({ input }) => {
    const kennel = await createKennel(input)

    if (kennel) return true

    throw new TRPCError({ code: 'BAD_REQUEST' })
  }),
  updateKennel: procedure.input(kennel).mutation(async ({ input }) => {
    if (input.id) {
      const kennel = await updateKennel(
        {
          id: input.id
        },
        input
      )

      if (kennel) return true

      throw new TRPCError({ code: 'BAD_REQUEST' })
    }
  }),
  deleteKennel: procedure.input(z.number()).mutation(async ({ input }) => {
    const result = await deleteKennel(input)
    if (result.numDeletedRows) return true
    throw new TRPCError({ code: 'BAD_REQUEST' })
  })
})

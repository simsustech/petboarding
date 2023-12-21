import type { FastifyInstance } from 'fastify'
import { t } from '../index.js'
import * as z from 'zod'
import { deletePet } from '../../repositories/pet.js'
import { TRPCError } from '@trpc/server'

export const adminPetRoutes = ({
  // fastify,
  procedure
}: {
  fastify?: FastifyInstance
  procedure: typeof t.procedure
}) => ({
  deletePet: procedure
    .input(
      z.object({
        id: z.number()
      })
    )
    .mutation(async ({ input }) => {
      const { id } = input
      if (id) {
        await deletePet(id)
        return true
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    })
})

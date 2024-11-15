import { TRPCError } from '@trpc/server'
import { t } from '../index.js'
import { z } from 'zod'
import { building } from '../../zod/building.js'
import {
  findBuildings,
  createBuilding,
  updateBuilding,
  deleteBuilding
} from '../../repositories/building.js'
import type { FastifyInstance } from 'fastify'

export const configurationBuildingRoutes = ({
  // fastify,
  procedure
}: {
  fastify?: FastifyInstance
  procedure: typeof t.procedure
}) => ({
  getBuildings: procedure.query(async () => {
    const buildings = await findBuildings({
      criteria: {}
    })
    if (buildings) return buildings
    throw new TRPCError({ code: 'BAD_REQUEST' })
  }),
  createBuilding: procedure.input(building).mutation(async ({ input }) => {
    const building = await createBuilding(input)

    if (building) return true

    throw new TRPCError({ code: 'BAD_REQUEST' })
  }),
  updateBuilding: procedure.input(building).mutation(async ({ input }) => {
    if (input.id) {
      const building = await updateBuilding(
        {
          id: input.id
        },
        input
      )

      if (building) return true

      throw new TRPCError({ code: 'BAD_REQUEST' })
    }
  }),
  deleteBuilding: procedure.input(z.number()).mutation(async ({ input }) => {
    const result = await deleteBuilding(input)
    if (result.numDeletedRows) return true
    throw new TRPCError({ code: 'BAD_REQUEST' })
  })
})

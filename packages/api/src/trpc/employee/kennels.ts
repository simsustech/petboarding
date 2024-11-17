import { TRPCError } from '@trpc/server'
import { t } from '../index.js'
import * as z from 'zod'

import type { FastifyInstance } from 'fastify'
import {
  findKennels,
  getDaycareDatePetKennels,
  setBookingPetKennel
} from 'src/repositories/kennel.js'
import { getBookingPetKennels } from 'src/repositories/kennel.js'
import { findBuildings } from 'src/repositories/building.js'

export const employeeKennelRoutes = ({
  // fastify,
  procedure
}: {
  fastify?: FastifyInstance
  procedure: typeof t.procedure
}) => ({
  getBuildings: procedure.query(async () => {
    const buildings = await findBuildings({ criteria: {} })
    if (buildings) return buildings
    throw new TRPCError({
      code: 'BAD_REQUEST'
    })
  }),
  getKennels: procedure.query(async () => {
    const kennels = await findKennels({
      criteria: {}
    })
    if (kennels) return kennels
    throw new TRPCError({
      code: 'BAD_REQUEST'
    })
  }),
  getPetKennels: procedure.query(async () => {
    const bookingPetKennels = await getBookingPetKennels()
    const daycareDatePetKennels = await getDaycareDatePetKennels()
    return [...bookingPetKennels, ...daycareDatePetKennels]
  }),
  setBookingPetKennel: procedure
    .input(
      z.object({
        id: z.number(),
        kennelId: z.number(),
        bookingId: z.number()
      })
    )
    .mutation(async ({ input }) => {
      await setBookingPetKennel(input)
    })
})

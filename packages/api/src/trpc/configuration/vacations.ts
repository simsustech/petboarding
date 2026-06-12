import { TRPCError } from '@trpc/server'
import { t } from '../index.js'
import { z } from 'zod'
import { vacation } from '../../zod/vacation.js'
import type { FastifyInstance } from 'fastify'
import {
  createVacation,
  deleteVacation,
  findVacations,
  updateVacation
} from '../../repositories/vacation.js'

export const configurationVacationRoutes = ({
  procedure
}: {
  fastify?: FastifyInstance
  procedure: typeof t.procedure
}) => ({
  getVacations: procedure.query(async () => {
    const vacations = await findVacations()
    if (vacations) return vacations
    throw new TRPCError({ code: 'BAD_REQUEST' })
  }),
  createVacation: procedure.input(vacation).mutation(async ({ input }) => {
    const result = await createVacation(input)
    if (result) return true
    throw new TRPCError({ code: 'BAD_REQUEST' })
  }),
  updateVacation: procedure.input(vacation).mutation(async ({ input }) => {
    if (input.id) {
      const result = await updateVacation({ id: input.id }, input)
      if (result) return true
    }
    throw new TRPCError({ code: 'BAD_REQUEST' })
  }),
  deleteVacation: procedure.input(z.number()).mutation(async ({ input }) => {
    const result = await deleteVacation(input)
    if (result.numDeletedRows) return true
    throw new TRPCError({ code: 'BAD_REQUEST' })
  })
})

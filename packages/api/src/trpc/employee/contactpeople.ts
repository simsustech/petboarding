import { TRPCError } from '@trpc/server'
import { t } from '../index.js'
import * as z from 'zod'

import type { FastifyInstance } from 'fastify'
import { findContactPeople } from '../../repositories/contactPerson'

export const employeeContactPeopleRoutes = ({
  // fastify,
  procedure
}: {
  fastify?: FastifyInstance
  procedure: typeof t.procedure
}) => ({
  getContactPeopleByCustomerId: procedure
    .input(
      z.object({
        customerId: z.number()
      })
    )
    .query(async ({ input }) => {
      const { customerId } = input
      if (customerId) {
        const contactPeople = await findContactPeople({
          criteria: {
            customerId
          }
        })
        if (contactPeople) return contactPeople
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    })
})

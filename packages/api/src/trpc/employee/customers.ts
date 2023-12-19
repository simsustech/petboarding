import { TRPCError } from '@trpc/server'
import { t } from '../index.js'
import * as z from 'zod'
import { customer } from '../../zod/customer.js'
import {
  findCustomer,
  updateCustomer,
  searchCustomers
} from '../../repositories/customer.js'
import type { FastifyInstance } from 'fastify'

const customerInput = customer.omit({
  account: true
})

export const employeeCustomerRoutes = ({
  // fastify,
  procedure
}: {
  fastify?: FastifyInstance
  procedure: typeof t.procedure
}) => ({
  searchCustomers: procedure.input(z.string()).query(async ({ input }) => {
    const searchPhrase = input
    if (input) {
      const customers = await searchCustomers(searchPhrase)
      return customers
    }
    throw new TRPCError({ code: 'BAD_REQUEST' })
  }),
  getCustomer: procedure
    .input(
      z.object({
        id: z.number()
      })
    )
    .query(async ({ input }) => {
      const { id } = input

      if (id) {
        const customer = await findCustomer({
          criteria: {
            id
          },
          select: ['rating', 'comments'],
          relations: {
            pets: true,
            bookings: true
          }
        })
        return customer
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  updateCustomer: procedure.input(customerInput).mutation(async ({ input }) => {
    const { id } = input
    if (id) {
      const customer = await updateCustomer(
        {
          id
        },
        {
          rating: input.rating,
          firstName: input.firstName,
          lastName: input.lastName,
          gender: input.gender,
          address: input.address,
          postalCode: input.postalCode,
          city: input.city,
          telephoneNumber: input.telephoneNumber,
          veterinarian: input.veterinarian,
          comments: input.comments
        }
      )

      return customer
    }

    throw new TRPCError({ code: 'BAD_REQUEST' })
  })
})

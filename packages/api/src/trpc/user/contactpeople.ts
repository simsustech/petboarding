import { TRPCError } from '@trpc/server'
import { t } from '../index.js'
import { contactPerson } from '../../zod/contactperson.js'
import { findCustomer } from '../../repositories/customer.js'
import {
  createContactPerson,
  findContactPeople,
  updateContactPerson
} from '../../repositories/contactPerson.js'

import type { FastifyInstance } from 'fastify'

export const userContactPersonValidation = contactPerson.omit({
  customerId: true
})

export const userContactPeopleRoutes = ({
  // fastify,
  procedure
}: {
  fastify?: FastifyInstance
  procedure: typeof t.procedure
}) => ({
  getContactPeople: procedure.query(async ({ ctx }) => {
    if (ctx.account?.id) {
      const customer = await findCustomer({
        criteria: {
          accountId: Number(ctx.account.id)
        }
      })
      if (customer?.id) {
        const contactPeople = await findContactPeople({
          criteria: {
            customerId: customer.id
          }
        })
        return contactPeople
      }
    }
    throw new TRPCError({ code: 'BAD_REQUEST' })
  }),
  createContactPerson: procedure
    .input(userContactPersonValidation)
    .mutation(async ({ input, ctx }) => {
      if (ctx.account?.id) {
        const customer = await findCustomer({
          criteria: {
            accountId: Number(ctx.account.id)
          }
        })

        if (customer?.id) {
          const contactPerson = await createContactPerson({
            ...input,
            customerId: Number(customer.id)
          })
          return contactPerson
        }
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  updateContactPerson: procedure
    .input(userContactPersonValidation.required({ id: true }))
    .mutation(async ({ input, ctx }) => {
      if (input.id && ctx.account?.id) {
        const id = input.id
        const customer = await findCustomer({
          criteria: {
            accountId: Number(ctx.account.id)
          }
        })

        if (customer) {
          const contactPerson = await updateContactPerson(
            {
              id
            },
            {
              ...input,
              customerId: Number(customer.id)
            }
          )
          return contactPerson
        }
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    })
})

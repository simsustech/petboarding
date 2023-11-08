import { TRPCError } from '@trpc/server'
import { t } from '../index.js'
import * as z from 'zod'
import { PETBOARDING_ACCOUNT_ROLES } from '../../zod/account.js'
import {
  findAccount,
  findAccounts,
  updateAccount
} from '../../repositories/account.js'
import type { FastifyInstance } from 'fastify'

export const adminAccountRoutes = ({
  // fastify,
  procedure
}: {
  fastify?: FastifyInstance
  procedure: typeof t.procedure
}) => ({
  getAccount: procedure
    .input(
      z.object({
        id: z.number()
      })
    )
    .query(async ({ input }) => {
      const { id } = input
      if (id) {
        const account = await findAccount({
          criteria: {
            id
          }
        })
        return account
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  findAccounts: procedure
    .input(
      z.object({
        email: z.string()
      })
    )
    .query(async ({ input }) => {
      const { email } = input
      if (email) {
        const accounts = await findAccounts({
          criteria: {
            email
          }
        })
        return accounts
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  addRole: procedure
    .input(
      z.object({
        id: z.number(),
        role: z.nativeEnum(PETBOARDING_ACCOUNT_ROLES)
      })
    )
    .mutation(async ({ input }) => {
      const { id, role } = input
      const account = await findAccount({
        criteria: {
          id
        }
      })
      if (account) {
        const roles = account.roles || []
        roles.push(role)
        if (account) {
          await updateAccount(
            {
              id
            },
            {
              roles: JSON.stringify(roles)
            }
          )
          return true
        }
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  removeRole: procedure
    .input(
      z.object({
        id: z.number(),
        role: z.nativeEnum(PETBOARDING_ACCOUNT_ROLES)
      })
    )
    .mutation(async ({ input }) => {
      const { id, role } = input
      const account = await findAccount({
        criteria: {
          id
        }
      })
      if (account) {
        const roles = account.roles || []
        roles?.splice(roles?.indexOf(role))
        await updateAccount(
          {
            id
          },
          {
            roles: JSON.stringify(roles)
          }
        )
        return true
      }
      throw new TRPCError({ code: 'BAD_REQUEST' })
    })
})

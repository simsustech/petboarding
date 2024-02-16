import { initTRPC, TRPCError } from '@trpc/server'
import type { inferAsyncReturnType } from '@trpc/server'
import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify'
import type { FastifyInstance } from 'fastify'
import { userRoutes } from './user/index.js'
import { configurationRoutes } from './configuration/index.js'
import { publicRoutes } from './public/index.js'
import { PETBOARDING_ACCOUNT_ROLES } from '../zod/account.js'
import { adminRoutes } from './admin/index.js'
import { employeeRoutes } from './employee/index.js'
import { pointOfSaleRoutes } from './pointofsale/index.js'

export const t = initTRPC.context<Context>().create()

const isLoggedIn = t.middleware(({ next, ctx }) => {
  if (!ctx.account) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx
  })
})
const isAdministrator = t.middleware(({ next, ctx }) => {
  if (!ctx.account?.roles?.includes(PETBOARDING_ACCOUNT_ROLES.ADMINISTRATOR)) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx
  })
})
const isEmployee = t.middleware(({ next, ctx }) => {
  if (!ctx.account?.roles?.includes(PETBOARDING_ACCOUNT_ROLES.EMPLOYEE)) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx
  })
})
const isPointOfSale = t.middleware(({ next, ctx }) => {
  if (!ctx.account?.roles?.includes(PETBOARDING_ACCOUNT_ROLES.POINT_OF_SALE)) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx
  })
})
export const userProcedure = t.procedure.use(isLoggedIn)
export const adminProcedure = t.procedure.use(isAdministrator)
export const employeeProcedure = t.procedure.use(isEmployee)
export const pointOfSaleProcedure = t.procedure.use(isPointOfSale)

const userRouter = (fastify: FastifyInstance) =>
  t.router({
    ...userRoutes({ fastify, procedure: userProcedure })
  })

const configurationRouter = (fastify: FastifyInstance) =>
  t.router({
    ...configurationRoutes({ fastify, procedure: adminProcedure })
  })

const publicRouter = (fastify: FastifyInstance) =>
  t.router({
    ...publicRoutes({ fastify, procedure: t.procedure })
  })

const adminRouter = (fastify: FastifyInstance) =>
  t.router({
    ...adminRoutes({ fastify, procedure: adminProcedure })
  })

const employeeRouter = (fastify: FastifyInstance) =>
  t.router({
    ...employeeRoutes({ fastify, procedure: employeeProcedure })
  })

const pointOfSaleRouter = (fastify: FastifyInstance) =>
  t.router({
    ...pointOfSaleRoutes({ fastify, procedure: pointOfSaleProcedure })
  })

export const createRouter = (fastify: FastifyInstance) => {
  const t = initTRPC.create()

  const router = t.router({
    user: userRouter(fastify),
    configuration: configurationRouter(fastify),
    public: publicRouter(fastify),
    employee: employeeRouter(fastify),
    admin: adminRouter(fastify),
    pointofsale: pointOfSaleRouter(fastify)
  })

  return router
}
/* eslint-disable @typescript-eslint/no-unused-vars */
export const createContext = (fastify?: FastifyInstance) =>
  function ({ req, res }: CreateFastifyContextOptions) {
    return {}
  }
/* eslint-enable @typescript-eslint/no-unused-vars */
export type Context = inferAsyncReturnType<
  inferAsyncReturnType<typeof createContext>
> & { account: { id: string; roles?: string[] } | null }
export type AppRouter = ReturnType<typeof createRouter>

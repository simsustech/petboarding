import { initTRPC, TRPCError } from '@trpc/server'
import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify'
import type { FastifyInstance } from 'fastify'
import { userRoutes } from './user/index.js'
import { configurationRoutes } from './configuration/index.js'
import { publicRoutes } from './public/index.js'
import { PETBOARDING_ACCOUNT_ROLES } from '@petboarding/tools/constants'
import { adminRoutes } from './admin/index.js'
import { employeeRoutes } from './employee/index.js'
import { createAuditLog } from '../repositories/auditLog.js'
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

const auditAction = t.middleware(async ({ next, ctx, path, type }) => {
  const result = await next()

  if (ctx.account && type === 'mutation') {
    const resource = path.split('.')[0] || 'unknown'
    createAuditLog({
      accountId: parseInt(ctx.account.id, 10),
      action: path,
      resource,
      ipAddress: ctx.ip
    }).catch(() => {})
  }

  return result
})

export const userProcedure = t.procedure.use(isLoggedIn).use(auditAction)
export const adminProcedure = t.procedure.use(isAdministrator).use(auditAction)
export const employeeProcedure = t.procedure.use(isEmployee).use(auditAction)

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

export const createRouter = (fastify: FastifyInstance) => {
  const router = t.router({
    user: userRouter(fastify),
    configuration: configurationRouter(fastify),
    public: publicRouter(fastify),
    employee: employeeRouter(fastify),
    admin: adminRouter(fastify)
  })

  return router
}
/* eslint-disable @typescript-eslint/no-unused-vars */
export const createContext = (fastify?: FastifyInstance) =>
  function ({ req }: CreateFastifyContextOptions) {
    return { ip: req.ip }
  }
/* eslint-enable @typescript-eslint/no-unused-vars */

export type Context = Awaited<
  ReturnType<Awaited<ReturnType<typeof createContext>>>
> & { account: { id: string; roles?: string[] } | null }
export type AppRouter = ReturnType<typeof createRouter>

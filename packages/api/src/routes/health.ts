import type { FastifyInstance } from 'fastify'
import { db } from '../kysely/index.js'
import { sql } from 'kysely'

export const registerHealthRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/health', async (_request, reply) => {
    const checks: Record<string, { status: string; message?: string }> = {}

    try {
      await sql`SELECT 1`.execute(db)
      checks.database = { status: 'healthy' }
    } catch (e) {
      checks.database = {
        status: 'unhealthy',
        message: e instanceof Error ? e.message : 'Unknown error'
      }
    }

    try {
      const boss = (fastify as any)['pg-boss']
      if (boss) {
        const state = await boss.getQueue('checkDownPayments')
        checks['pg-boss'] = { status: state ? 'healthy' : 'unhealthy' }
      } else {
        checks['pg-boss'] = { status: 'not_configured' }
      }
    } catch (e) {
      checks['pg-boss'] = {
        status: 'unhealthy',
        message: e instanceof Error ? e.message : 'Unknown error'
      }
    }

    try {
      if ((fastify as any).slimfact?.admin?.healthcheck) {
        await (fastify as any).slimfact.admin.healthcheck.query()
        checks.slimfact = { status: 'healthy' }
      } else {
        checks.slimfact = { status: 'not_configured' }
      }
    } catch (e) {
      checks.slimfact = {
        status: 'unhealthy',
        message: e instanceof Error ? e.message : 'Unknown error'
      }
    }

    const healthy = Object.values(checks).every((c) => c.status !== 'unhealthy')
    return reply.status(healthy ? 200 : 503).send({
      status: healthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks
    })
  })
}

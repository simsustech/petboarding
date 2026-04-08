import { PgBoss } from 'pg-boss'
import { postgresConnectionString } from '../src/kysely/index.js'
import { FastifyInstance } from 'fastify'
import {
  checkDownPayments,
  createReceiptsForBookings
} from './repositories/booking.js'
import { createReceiptsForCustomerDaycareSubscriptions } from './repositories/customerDaycareSubscription.js'
import { sendNotification } from '@petboarding/tools/ntfy'
import env from '@vitrify/tools/env'

const NTFY_HOST = env.read('NTFY_HOST') || env.read('VITE_NTFY_HOST')
const NTFY_ACCESS_TOKEN =
  env.read('NTFY_ACCESS_TOKEN') || env.read('VITE_NTFY_ACCESS_TOKEN')
const HOST = env.read('VITE_API_HOST') || env.read('API_HOST')

let boss: PgBoss
const createDownPaymentWorker = ({ fastify }: { fastify: FastifyInstance }) =>
  async function downPaymentWorker() {
    await checkDownPayments({ fastify })
    return true
  }

const createReceiptsWorker = ({ fastify }: { fastify: FastifyInstance }) =>
  async function receiptsWorker() {
    await createReceiptsForBookings({ fastify })
    await createReceiptsForCustomerDaycareSubscriptions({ fastify })
    return true
  }

const createSlimfactHealthCheckWorker = ({
  fastify
}: {
  fastify: FastifyInstance
}) =>
  NTFY_HOST && NTFY_ACCESS_TOKEN
    ? async function slimfactHealthCheckWorker() {
        try {
          const result = await fastify?.slimfact.admin.healthcheck.query()
          return result
        } catch (e) {
          fastify.log.info('Slimfact not authorized.')
          const response = await sendNotification({
            topic: 'admin',
            title: 'SlimFact not authorized.',
            message: 'Click to open Petboarding',
            client: {
              host: HOST
            },
            options: {
              NTFY_HOST,
              NTFY_ACCESS_TOKEN
            }
          })
          if ('errorMessage' in response)
            fastify.log.debug(response.errorMessage)
        }
      }
    : async () => false

export const initialize = async ({ fastify }: { fastify: FastifyInstance }) => {
  boss = new PgBoss({
    connectionString: postgresConnectionString,
    schema: 'pgboss_v11'
  })

  await boss.start()

  const downPaymentWorker = createDownPaymentWorker({ fastify })
  const receiptsWorker = createReceiptsWorker({ fastify })
  const slimfactHealthCheckWorker = createSlimfactHealthCheckWorker({ fastify })
  const schedules = await boss.getSchedules()

  if (!schedules.some((schedule) => schedule.name === 'checkDownPayments')) {
    const queueName = `checkDownPayments`

    if (!(await boss.getQueue(queueName))) {
      await boss.createQueue(queueName)
    }
    await boss.schedule(queueName, '0 0 * * *', {}, {})
  }

  if (!schedules.some((schedule) => schedule.name === 'createReceipts')) {
    const queueName = `createReceipts`

    if (!(await boss.getQueue(queueName))) {
      await boss.createQueue(queueName)
    }
    await boss.schedule(queueName, '0 0 * * *', {}, {})
  }

  if (!schedules.some((schedule) => schedule.name === 'slimfactHealthcheck')) {
    const queueName = `slimfactHealthcheck`

    if (!(await boss.getQueue(queueName))) {
      await boss.createQueue(queueName)
    }
    await boss.schedule(queueName, '*/5 * * * *', {}, {})
  }

  await boss.work(
    'checkDownPayments',
    { batchSize: 1, includeMetadata: true },
    downPaymentWorker
  )
  await boss.work(
    'createReceipts',
    { batchSize: 1, includeMetadata: true },
    receiptsWorker
  )
  await boss.work(
    'slimfactHealthcheck',
    { batchSize: 1, includeMetadata: true },
    slimfactHealthCheckWorker
  )

  return boss
}

import PgBoss from 'pg-boss'
import { postgresConnectionString } from '../src/kysely/index.js'
import { FastifyInstance } from 'fastify'
import {
  checkDownPayments,
  createReceiptsForBookings
} from './repositories/booking.js'
import { createReceiptsForCustomerDaycareSubscriptions } from './repositories/customerDaycareSubscription.js'

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

export const initialize = async ({ fastify }: { fastify: FastifyInstance }) => {
  boss = new PgBoss(postgresConnectionString)

  await boss.start()

  const downPaymentWorker = createDownPaymentWorker({ fastify })
  const receiptsWorker = createReceiptsWorker({ fastify })

  const schedules = await boss.getSchedules()

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

  return boss
}

import PgBoss from 'pg-boss'
import { postgresConnectionString } from '../src/kysely/index.js'
import { FastifyInstance } from 'fastify'
import { checkDownPayments } from './repositories/booking.js'

let boss: PgBoss
const createDownPaymentWorker = ({ fastify }: { fastify: FastifyInstance }) =>
  async function downPaymentWorker() {
    await checkDownPayments({ fastify })
    return true
  }

export const initialize = async ({ fastify }: { fastify: FastifyInstance }) => {
  boss = new PgBoss(postgresConnectionString)

  await boss.start()

  const downPaymentWorker = createDownPaymentWorker({ fastify })

  const schedules = await boss.getSchedules()

  await boss.work(
    'checkDownPayments',
    { batchSize: 1, includeMetadata: true },
    downPaymentWorker
  )
  if (!schedules.some((schedule) => schedule.name === 'checkDownPayments')) {
    const queueName = `checkDownPayments`

    if (!(await boss.getQueue(queueName))) {
      await boss.createQueue(queueName)
    }
    await boss.schedule(queueName, '0 0 * * *', {}, {})
  }

  return boss
}

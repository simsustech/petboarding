import { t } from '../index.js'
import type { FastifyInstance } from 'fastify'
import { pointOfSaleBookingRoutes } from './bookings'
export const pointOfSaleRoutes = ({
  fastify,
  procedure
}: {
  fastify: FastifyInstance
  procedure: typeof t.procedure
}) => ({
  ...pointOfSaleBookingRoutes({ fastify, procedure })
})

import { adminAccountRoutes } from './accounts.js'
import { adminBookingRoutes } from './bookings.js'
import { adminDaycareRoutes } from './daycare.js'
import { adminOccupancyRoutes } from './occupancy.js'
import { t } from '../../trpc/index.js'
import type { FastifyInstance } from 'fastify'

export const adminRoutes = ({
  fastify,
  procedure
}: {
  fastify: FastifyInstance
  procedure: typeof t.procedure
}) => ({
  ...adminAccountRoutes({ fastify, procedure }),
  ...adminBookingRoutes({ fastify, procedure }),
  ...adminDaycareRoutes({ fastify, procedure }),
  ...adminOccupancyRoutes({ fastify, procedure })
})

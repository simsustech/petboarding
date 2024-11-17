import { employeePetRoutes } from './pets.js'
import { employeeCustomerRoutes } from './customers.js'
import { employeeContactPeopleRoutes } from './contactpeople.js'
import { employeeBookingRoutes } from './bookings.js'
import { employeeDaycareRoutes } from './daycare.js'
import { t } from '../index.js'
import type { FastifyInstance } from 'fastify'
import { employeeKennelRoutes } from './kennels.js'

export const employeeRoutes = ({
  fastify,
  procedure
}: {
  fastify: FastifyInstance
  procedure: typeof t.procedure
}) => ({
  ...employeePetRoutes({ fastify, procedure }),
  ...employeeCustomerRoutes({ fastify, procedure }),
  ...employeeContactPeopleRoutes({ fastify, procedure }),
  ...employeeBookingRoutes({ fastify, procedure }),
  ...employeeDaycareRoutes({ fastify, procedure }),
  ...employeeKennelRoutes({ fastify, procedure })
})

import { userCustomerRoutes } from './customer.js'
import { userContactPeopleRoutes } from './contactpeople.js'
import { userPetRoutes } from './pets.js'
import { userBookingRoutes } from './bookings.js'
import { userDaycareRoutes } from './daycare.js'
import { t } from '../index.js'
import type { FastifyInstance } from 'fastify'

export const userRoutes = ({
  fastify,
  procedure
}: {
  fastify: FastifyInstance
  procedure: typeof t.procedure
}) => ({
  ...userCustomerRoutes({ fastify, procedure }),
  ...userContactPeopleRoutes({ fastify, procedure }),
  ...userPetRoutes({ fastify, procedure }),
  ...userBookingRoutes({ fastify, procedure }),
  ...userDaycareRoutes({ fastify, procedure })
})

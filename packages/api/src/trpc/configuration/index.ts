import { t } from '../index.js'
import { configurationEmailRoutes } from './emails.js'
import { configurationOpeningTimeRoutes } from './openingTimes.js'
import { configurationPeriodRoutes } from './periods.js'
import { configurationAnnouncementRoutes } from './announcements'
import { configurationCategoryRoutes } from './categories.js'
import type { FastifyInstance } from 'fastify'
import { configurationServiceRoutes } from './services'
import { configurationDaycareSubscriptionRoutes } from './daycareSubscriptions.js'
import { configurationCategoryPriceRoutes } from './categoryPrices.js'
import { configurationBuildingRoutes } from './buildings.js'

export const configurationRoutes = ({
  fastify,
  procedure
}: {
  fastify: FastifyInstance
  procedure: typeof t.procedure
}) => ({
  ...configurationEmailRoutes({ procedure, fastify }),
  ...configurationOpeningTimeRoutes({ procedure, fastify }),
  ...configurationPeriodRoutes({ procedure, fastify }),
  ...configurationAnnouncementRoutes({ procedure, fastify }),
  ...configurationCategoryRoutes({ procedure, fastify }),
  ...configurationServiceRoutes({ procedure, fastify }),
  ...configurationDaycareSubscriptionRoutes({ procedure, fastify }),
  ...configurationCategoryPriceRoutes({ procedure, fastify }),
  ...configurationBuildingRoutes({ procedure, fastify })
})

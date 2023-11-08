import { TRPCError } from '@trpc/server'
import { t } from '../index.js'
import { format } from 'date-fns'
import { findServices } from '../../repositories/service.js'
import { findOpeningTimes } from '../../repositories/openingTime.js'
import { findPeriods } from '../../repositories/period.js'
import { findCategories } from '../../repositories/category.js'
import { findAnnouncements } from '../../repositories/announcement.js'
import type { Category } from '../../repositories/category.js'
import type { FastifyInstance } from 'fastify'

export const publicRoutes = ({
  // fastify,
  procedure
}: {
  fastify?: FastifyInstance
  procedure: typeof t.procedure
}) => ({
  getCategories: procedure.query(async () => {
    const categories = await findCategories({ criteria: {} })
    return categories.reduce((acc, cur) => {
      if (!acc[cur.species]) acc[cur.species] = {}
      acc[cur.species][cur.id] = cur
      return acc
    }, {} as Record<string, Record<string, Category>>)
  }),
  getOpeningTimes: procedure.query(async () => {
    const openingTimes = await findOpeningTimes({
      criteria: {}
    })
    return openingTimes
  }),
  getServices: procedure.query(async () => {
    const services = await findServices({
      criteria: {
        disabled: false
      }
    })
    if (services) return services
    throw new TRPCError({ code: 'BAD_REQUEST' })
  }),
  getAnnouncements: procedure.query(async () => {
    const announcements = await findAnnouncements({
      criteria: {
        expirationDate: format(new Date(), 'yyyy-MM-dd')
      }
    })
    if (announcements) return announcements
    return []
  }),
  getPeriods: procedure.query(async () => {
    const periods = await findPeriods({
      criteria: {
        endDate: format(new Date(), 'yyyy-MM-dd')
      }
    })
    if (periods) return periods
    return []
  })
})

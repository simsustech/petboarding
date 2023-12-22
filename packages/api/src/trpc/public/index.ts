import { TRPCError } from '@trpc/server'
import { t } from '../index.js'
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
    return categories.reduce(
      (acc, cur) => {
        if (!acc[cur.species]) acc[cur.species] = {}
        acc[cur.species][cur.id] = cur
        return acc
      },
      {} as Record<string, Record<string, Category>>
    )
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
        expirationDate: new Date().toISOString().slice(0, 10)
      }
    })
    if (announcements)
      return [
        ...announcements.filter(
          (announcement) => announcement.type === 'priority'
        ),
        ...announcements.filter(
          (announcement) => announcement.type === 'important'
        ),
        ...announcements.filter(
          (announcement) => announcement.type === 'general'
        )
      ]
    return []
  }),
  getPeriods: procedure.query(async () => {
    const periods = await findPeriods({
      criteria: {
        endDate: new Date().toISOString().slice(0, 10)
      }
    })
    if (periods) return periods
    return []
  })
})

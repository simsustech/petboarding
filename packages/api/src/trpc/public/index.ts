import { TRPCError } from '@trpc/server'
import { t } from '../index.js'
import { findServices } from '../../repositories/service.js'
import { findOpeningTimes } from '../../repositories/openingTime.js'
import { findPeriods } from '../../repositories/period.js'
import { findCategories } from '../../repositories/category.js'
import { findAnnouncements } from '../../repositories/announcement.js'
import type { Category } from '../../repositories/category.js'
import type { FastifyInstance } from 'fastify'
import { findDaycareSubscriptions } from '../../repositories/daycareSubscription.js'
import { ANNOUNCEMENT_TYPE } from '../../zod/announcement.js'
import Holidays from 'date-holidays'
import { PERIOD_TYPE } from '../../kysely/types.js'
import { eachDayOfInterval } from '../../tools.js'
import { findDocument } from 'src/repositories/document.js'

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
  getUrgentAnnouncements: procedure.query(async () => {
    const announcements = await findAnnouncements({
      criteria: {
        expirationDate: new Date().toISOString().slice(0, 10),
        type: ANNOUNCEMENT_TYPE.URGENT
      }
    })
    return announcements
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
  }),
  getDaycareSubscriptions: procedure.query(async () => {
    const daycareSubscriptions = await findDaycareSubscriptions({
      criteria: {}
    })

    return daycareSubscriptions
  }),
  getUnavailableDaycareDates: procedure.query(async () => {
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()

    const holidays = new Holidays()
    const periods = await findPeriods({
      criteria: {
        types: [
          PERIOD_TYPE.UNAVAILABLE_FOR_ALL,
          PERIOD_TYPE.UNAVAILABLE_FOR_DAYCARE
        ]
      }
    })

    const openingTimes = await findOpeningTimes({
      criteria: {
        disabled: false
      }
    })
    for (const openingTime of openingTimes) {
      if (openingTime.unavailableHolidays) {
        openingTime.unavailableHolidays.forEach((holiday) => {
          holidays.setHoliday(holiday, 'en')
        })
      }
    }
    return [
      ...holidays
        .getHolidays(currentYear)
        .map((holidayDate) => holidayDate.date.slice(0, 10)),
      ...holidays
        .getHolidays(currentYear + 1)
        .map((holidayDate) => holidayDate.date.slice(0, 10)),
      ...periods.reduce((acc, cur) => {
        acc = [
          ...acc,
          ...eachDayOfInterval({
            start: new Date(cur.startDate),
            end: new Date(cur.endDate)
          }).map((date) => date.toISOString().slice(0, 10))
        ]
        return acc
      }, [] as string[])
    ]
  }),
  getPrivacyPolicy: procedure.query(async () => {
    const privacyPolicy = await findDocument({
      criteria: {
        name: 'privacyPolicy'
      }
    })
    if (privacyPolicy) return privacyPolicy.content

    throw new TRPCError({ code: 'BAD_REQUEST' })
  }),
  getTermsAndConditions: procedure.query(async () => {
    const termsAndConditions = await findDocument({
      criteria: {
        name: 'termsAndConditions'
      }
    })
    if (termsAndConditions) return termsAndConditions.content

    throw new TRPCError({ code: 'BAD_REQUEST' })
  })
})

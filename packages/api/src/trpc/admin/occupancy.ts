import { t } from '../index.js'
import * as z from 'zod'
import { BOOKING_STATUS } from '../../zod/booking.js'
import { parseISO, startOfMonth, endOfMonth } from 'date-fns'

import { findBookings } from '../../repositories/booking.js'
import { findDaycareDates } from '../../repositories/daycare.js'
import type { FastifyInstance } from 'fastify'
import { DAYCARE_DATE_STATUS } from '../../kysely/types.js'
import { eachDayOfInterval } from '../../tools.js'

export const adminOccupancyRoutes = ({
  // fastify,
  procedure
}: {
  fastify?: FastifyInstance
  procedure: typeof t.procedure
}) => ({
  getBookingOccupancy: procedure
    .input(
      z.object({
        date: z.string(),
        status: z.nativeEnum(BOOKING_STATUS)
      })
    )
    .query(async ({ input }) => {
      const { date, status } = input
      const parsedDate = parseISO(date)
      const from = startOfMonth(parsedDate).toISOString().slice(0, 10)
      const until = endOfMonth(parsedDate).toISOString().slice(0, 10)

      const bookings = await findBookings({
        criteria: {
          from,
          until,
          status
        }
      })

      const occupancy: Record<string, number> =
        bookings?.reduce(
          (acc, cur) => {
            const dates = eachDayOfInterval({
              start: new Date(cur.startDate),
              end: new Date(cur.endDate)
            })
            for (const date of dates) {
              const dateString = date.toISOString().slice(0, 10)
              acc[dateString] = acc[dateString]
                ? acc[dateString] + cur.pets.length
                : cur.pets.length
            }
            return acc
          },
          {} as Record<string, number>
        ) || {}
      return occupancy
    }),
  getDaycareOccupancy: procedure
    .input(
      z.object({
        date: z.string(),
        status: z.nativeEnum(DAYCARE_DATE_STATUS)
      })
    )
    .query(async ({ input }) => {
      const { date, status } = input
      const parsedDate = parseISO(date)
      const from = startOfMonth(parsedDate).toISOString().slice(0, 10)
      const until = endOfMonth(parsedDate).toISOString().slice(0, 10)

      const daycareDates = await findDaycareDates({
        criteria: {
          from,
          until,
          status
        }
      })

      const occupancy: Record<string, number> =
        daycareDates?.reduce(
          (acc, cur) => {
            acc[cur.date] = acc[cur.date]
              ? acc[cur.date] + cur.pets.length
              : cur.pets.length
            return acc
          },
          {} as Record<string, number>
        ) || {}
      return occupancy
    })
})

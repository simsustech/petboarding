import { t } from '../index.js'
import * as z from 'zod'
import { BOOKING_STATUS } from '../../zod/booking.js'
import {
  format,
  parseISO,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth
} from 'date-fns'

import { findBookings } from 'src/repositories/booking'
import { findDaycareDates } from 'src/repositories/daycare'
import type { FastifyInstance } from 'fastify'

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
      const from = format(startOfMonth(parsedDate), 'yyyy-MM-dd')
      const until = format(endOfMonth(parsedDate), 'yyyy-MM-dd')

      const bookings = await findBookings({
        criteria: {
          from,
          until,
          status
        }
      })

      const occupancy: Record<string, number> =
        bookings?.reduce((acc, cur) => {
          const dates = eachDayOfInterval({
            start: parseISO(cur.startDate),
            end: parseISO(cur.endDate)
          })
          for (const date of dates) {
            const dateString = format(date, 'yyyy-MM-dd')
            acc[dateString] = acc[dateString]
              ? acc[dateString] + cur.pets.length
              : cur.pets.length
          }
          return acc
        }, {} as Record<string, number>) || {}
      return occupancy
    }),
  getDaycareOccupancy: procedure
    .input(
      z.object({
        date: z.string(),
        status: z.nativeEnum(BOOKING_STATUS)
      })
    )
    .query(async ({ input }) => {
      const { date, status } = input
      const parsedDate = parseISO(date)
      const from = format(startOfMonth(parsedDate), 'yyyy-MM-dd')
      const until = format(endOfMonth(parsedDate), 'yyyy-MM-dd')

      const daycareDates = await findDaycareDates({
        criteria: {
          from,
          until,
          status
        }
      })

      const occupancy: Record<string, number> =
        daycareDates?.reduce((acc, cur) => {
          acc[cur.date] = acc[cur.date]
            ? acc[cur.date] + cur.pets.length
            : cur.pets.length
          return acc
        }, {} as Record<string, number>) || {}
      return occupancy
    })
})

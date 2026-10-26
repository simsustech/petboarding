import { TRPCError } from '@trpc/server'
import { t } from '../index.js'
import * as z from 'zod'
import { openingTime } from '../../zod/openingtime.js'
import Holidays from 'date-holidays'
import type { FastifyInstance } from 'fastify'
import {
  createOpeningTime,
  findOpeningTimes,
  updateOpeningTime,
  deleteOpeningTime
} from '../../repositories/openingTime.js'

export const configurationOpeningTimeRoutes = ({
  // fastify,
  procedure
}: {
  fastify?: FastifyInstance
  procedure: typeof t.procedure
}) => ({
  getOpeningTimes: procedure
    .input(
      z.object({
        pagination: z
          .object({
            limit: z.number(),
            offset: z.number(),
            sortBy: z
              .union([z.literal('name'), z.literal('startTime')])
              .nullable(),
            descending: z.boolean()
          })
          .optional()
      })
    )
    .query(async ({ input }) => {
      const openingTimes = await findOpeningTimes({
        criteria: {},
        pagination: input.pagination
      })
      if (openingTimes) return openingTimes
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  createOpeningTime: procedure
    .input(openingTime)
    .mutation(async ({ input }) => {
      const openingTime = await createOpeningTime({
        name: input.name,
        startTime: input.startTime,
        endTime: input.endTime,
        startDayCounted: input.startDayCounted,
        endDayCounted: input.endDayCounted,
        daysOfWeek: JSON.stringify(input.daysOfWeek),
        disabled: input.disabled,
        unavailableHolidays: JSON.stringify(input.unavailableHolidays),
        type: input.type
      })

      if (openingTime) return true

      throw new TRPCError({ code: 'BAD_REQUEST' })
    }),
  updateOpeningTime: procedure
    .input(openingTime)
    .mutation(async ({ input }) => {
      if (input.id) {
        const openingTime = await updateOpeningTime(
          {
            id: input.id
          },
          {
            name: input.name,
            startTime: input.startTime,
            endTime: input.endTime,
            startDayCounted: input.startDayCounted,
            endDayCounted: input.endDayCounted,
            daysOfWeek: JSON.stringify(input.daysOfWeek),
            disabled: input.disabled,
            unavailableHolidays: JSON.stringify(input.unavailableHolidays),
            type: input.type
          }
        )

        if (openingTime) return true

        throw new TRPCError({ code: 'BAD_REQUEST' })
      }
    }),
  deleteOpeningTime: procedure.input(z.number()).mutation(async ({ input }) => {
    const result = await deleteOpeningTime(input)
    if (result.numDeletedRows) return true
    throw new TRPCError({ code: 'BAD_REQUEST' })
  }),
  getHolidays: procedure
    .input(
      z.object({
        country: z.string(),
        language: z.string()
      })
    )
    .query(async ({ input }) => {
      const { country, language } = input
      const holidays = new Holidays(country, {
        languages: ['en', language]
      })
      const localHolidays = holidays.getHolidays(undefined, language)
      return localHolidays
    })
})

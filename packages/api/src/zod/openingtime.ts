import * as z from 'zod'

export const openingTimeValidation = {
  id: z.number().optional(),
  name: z.string(),
  startDayCounted: z.number(),
  endDayCounted: z.number(),
  daysOfWeek: z.number().array(),
  unavailableHolidays: z.string().array(),
  startTime: z.string(),
  endTime: z.string(),
  disabled: z.boolean()
}

export const openingTime = z.object(openingTimeValidation)

export type OpeningTime = z.infer<typeof openingTime>

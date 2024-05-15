import * as z from 'zod'
import { OPENING_TIME_TYPE } from '../kysely/types.js'
export { OPENING_TIME_TYPE }

export const openingTimeValidation = {
  id: z.number().optional(),
  name: z.string(),
  startDayCounted: z.number(),
  endDayCounted: z.number(),
  daysOfWeek: z.number().array(),
  unavailableHolidays: z.string().array(),
  startTime: z.string(),
  endTime: z.string(),
  disabled: z.boolean(),
  type: z.nativeEnum(OPENING_TIME_TYPE)
}

export const openingTime = z.object(openingTimeValidation)

export type OpeningTime = z.infer<typeof openingTime>

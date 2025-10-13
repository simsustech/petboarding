import * as z from 'zod'
import { PERIOD_TYPE } from '../kysely/types'
export { PERIOD_TYPE }

export const periodValidation = {
  id: z.number().optional(),
  startDate: z.string(),
  endDate: z.string(),
  type: z.enum(PERIOD_TYPE),
  comments: z.string(),
  minimumRatingForException: z.number().optional().nullable()
}

export const period = z.object(periodValidation)

export type Period = z.infer<typeof period>

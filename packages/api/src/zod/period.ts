import * as z from 'zod'

export enum PERIOD_TYPE {
  UNAVAILABLE_FOR_BOOKINGS = 'unavailableforbookings',
  UNAVAILABLE_FOR_DAYCARE = 'unavailablefordaycare',
  UNAVAILABLE_FOR_ALL = 'unavailableforall'
}

export const periodValidation = {
  id: z.number().optional(),
  startDate: z.string(),
  endDate: z.string(),
  type: z.nativeEnum(PERIOD_TYPE),
  comments: z.string(),
  minimumRatingForException: z.number().optional().nullable()
}

export const period = z.object(periodValidation)

export type Period = z.infer<typeof period>

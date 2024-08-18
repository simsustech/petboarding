import * as z from 'zod'
import { pet } from './pet.js'
import { DAYCARE_DATE_STATUS } from '../kysely/types.js'
export { DAYCARE_DATE_STATUS }

export const daycareDateValidation = {
  id: z.number().optional(),
  date: z.string(),
  petIds: z.number().array(),
  pets: pet.array().optional(),
  comments: z.string().optional(),
  customerId: z.number().optional(),
  status: z.nativeEnum(DAYCARE_DATE_STATUS).optional()
}

export const daycareDate = z.object(daycareDateValidation)

export type DaycareDate = z.infer<typeof daycareDate>

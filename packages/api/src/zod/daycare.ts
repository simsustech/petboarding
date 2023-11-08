import * as z from 'zod'
import { pet } from './pet.js'

export enum DAYCARE_DATE_STATUS {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  STANDBY = 'standby'
}

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

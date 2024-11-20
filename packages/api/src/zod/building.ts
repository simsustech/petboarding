import * as z from 'zod'
import { kennel } from './kennel'

export const buildingValidation = {
  id: z.number().optional(),
  name: z.string(),
  location: z.string(),
  description: z.string(),
  order: z.number().optional().nullable(),
  kennels: kennel.array().optional()
}

export const building = z.object(buildingValidation)

export type Building = z.infer<typeof building>

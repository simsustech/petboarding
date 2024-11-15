import * as z from 'zod'

export const buildingValidation = {
  id: z.number().optional(),
  name: z.string(),
  location: z.string(),
  description: z.string(),
  order: z.number().optional().nullable()
}

export const building = z.object(buildingValidation)

export type Building = z.infer<typeof building>

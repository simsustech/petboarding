import * as z from 'zod'

export const kennelValidation = {
  id: z.number().optional(),
  buildingId: z.number(),
  name: z.string(),
  description: z.string(),
  capacity: z.number().optional().nullable(),
  order: z.number().optional().nullable(),
  building: z.unknown().optional()
}

export const kennel = z.object(kennelValidation)

export type Kennel = z.infer<typeof kennel>

import * as z from 'zod'

import { VACCINATION_TYPES_DOG } from '../kysely/types.js'

export const vaccinationValidation = {
  id: z.number().optional(),
  image: z.string(),
  types: z.enum(VACCINATION_TYPES_DOG).array(),
  petId: z.number(),
  expirationDate: z.string(),
  hasExpired: z.boolean().optional()
}

export const vaccination = z.object(vaccinationValidation)

export type Vaccination = Omit<z.infer<typeof vaccination>, 'image'> & {
  image?: string | Buffer
}

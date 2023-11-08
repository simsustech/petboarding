import * as z from 'zod'

export const VACCINATION_IMAGE_SIZE = {
  width: 1024,
  height: 768
}

export const VACCINATION_TYPES_DOG = [
  'kennelcough',
  'parvo',
  'hepatitis',
  'distemper',
  'leptospirosis',
  'rabies'
] as const

export const VACCINATION_TYPES_CAT = [
  'panleukopenia',
  'rhinotracheitis',
  'caliciviruses',
  'rabies',
  'leukemia'
] as const

export const VACCINATION_TYPES = {
  dog: VACCINATION_TYPES_DOG,
  cat: VACCINATION_TYPES_CAT
}

export const vaccinationValidation = {
  id: z.number().optional(),
  image: z.string(),
  types: z.enum(VACCINATION_TYPES_DOG).array(),
  petId: z.number(),
  expirationDate: z.string()
}

export const vaccination = z.object(vaccinationValidation)

export type Vaccination = Omit<z.infer<typeof vaccination>, 'image'> & {
  image?: string | Buffer
}

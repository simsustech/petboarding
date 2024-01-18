import * as z from 'zod'
import { customer } from './customer.js'
import { vaccination } from './vaccination.js'

export const PET_SPECIES = ['dog', 'cat'] as const

export const PET_IMAGE_SIZE = {
  width: 1024,
  height: 768
}

export const petValidation = {
  id: z.number().optional(),
  image: z.string().nullable().optional(),
  species: z.enum(PET_SPECIES),
  rating: z.number().nullable().optional(),
  chipNumber: z.string().nullable().optional(),
  name: z.string(),
  breed: z.string(),
  gender: z.union([z.literal('male'), z.literal('female'), z.literal('other')]),
  sterilized: z.boolean(),
  chemicalSterilizationDate: z.string().nullable(),
  birthDate: z.string(),
  color: z.string().nullable().optional(),
  medicines: z.string().nullable().optional(),
  food: z.string().nullable().optional(),
  weight: z.string().nullable().optional(),
  deceased: z.boolean().optional(),
  particularities: z.string().nullable().optional(),
  comments: z.string().nullable().optional(),
  categoryId: z.number().optional(),
  customerId: z.number().optional(),
  customer: customer.optional(),
  vaccinations: vaccination.array().optional(),
  hasMandatoryVaccinations: z.boolean().optional()
}
// yo

export const pet = z.object(petValidation)

export type Pet = Omit<z.infer<typeof pet>, 'image'> & {
  image?: string | Buffer
}

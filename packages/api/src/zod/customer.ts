import * as z from 'zod'
import { account } from './account.js'

export const customerValidation = {
  id: z.number().optional(),
  rating: z.number().optional(),
  gender: z.union([z.literal('male'), z.literal('female'), z.literal('other')]),
  firstName: z.string(),
  lastName: z.string(),
  address: z.string(),
  postalCode: z.string(),
  city: z.string(),
  telephoneNumber: z.string(),
  veterinarian: z.string(),
  comments: z.string().optional(),
  accountId: z.number().optional(),
  account: account.optional(),
  bookings: z
    .object({
      id: z.number()
    })
    .array()
    .optional(),
  pets: z
    .object({
      id: z.number()
    })
    .array()
    .optional()
}

export const customer = z.object(customerValidation)

export type Customer = z.infer<typeof customer>

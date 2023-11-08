import * as z from 'zod'

export const contactPersonValidation = {
  id: z.number().optional(),
  firstName: z.string(),
  lastName: z.string(),
  telephoneNumber: z.string(),
  customerId: z.number().optional()
}

export const contactPerson = z.object(contactPersonValidation)

export type ContactPerson = z.infer<typeof contactPerson>

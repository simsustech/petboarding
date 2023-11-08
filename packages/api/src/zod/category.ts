import * as z from 'zod'

export const categoryValidation = {
  id: z.number().optional(),
  species: z.string(),
  order: z.number().nullable(),
  name: z.string(),
  price: z.number().nullable(),
  productId: z.string().nullable()
}

export const category = z.object(categoryValidation)

export type Category = z.infer<typeof category>

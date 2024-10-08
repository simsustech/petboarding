import * as z from 'zod'

export const categoryPriceValidation = {
  id: z.number().optional(),
  categoryId: z.number(),
  date: z.string(),
  listPrice: z.number()
}

export const categoryPrice = z.object(categoryPriceValidation)

export type CategoryPrice = z.infer<typeof categoryPrice>

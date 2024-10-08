import * as z from 'zod'

export const daycareSubscriptionValidation = {
  id: z.number().optional(),
  description: z.string(),
  numberOfDays: z.number(),
  validityPeriod: z.object({
    years: z.number().optional(),
    months: z.number().optional(),
    days: z.number().optional()
  }),
  listPrice: z.number()
}

export const daycareSubscription = z.object(daycareSubscriptionValidation)

export type DaycareSubscription = z.infer<typeof daycareSubscription>

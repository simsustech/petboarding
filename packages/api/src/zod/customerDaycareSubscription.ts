import * as z from 'zod'
import { CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS } from '../kysely/types.js'
import { daycareSubscription } from './daycareSubscription.js'

export { CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS }

export const customerDaycareSubscriptionValidation = {
  id: z.number().optional(),
  status: z.enum(CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS).optional(),
  effectiveDate: z.string(),
  expirationDate: z.string().optional(),
  invoiceUuid: z.string().optional().nullable(),
  invoice: z
    .object({
      uuid: z.string(),
      totalIncludingTax: z.number().optional(),
      amountDue: z.number().optional().nullable(),
      amountPaid: z.number().optional().nullable(),
      requiredDownPaymentAmount: z.number().optional().nullable(),
      currency: z.union([z.literal('EUR'), z.literal('USD')])
    })
    .nullable()
    .optional(),
  customerId: z.number().optional(),
  daycareSubscriptionId: z.number(),
  daycareSubscription: daycareSubscription.optional().nullable(),
  numberOfDaysUsed: z.number().optional(),
  numberOfDaysRemaining: z.number().optional(),
  isActive: z.boolean().optional(),
  daycareDates: z
    .array(
      z.object({
        date: z.string()
      })
    )
    .optional()
}

export const customerDaycareSubscription = z.object(
  customerDaycareSubscriptionValidation
)

export type CustomerDaycareSubscription = z.infer<
  typeof customerDaycareSubscription
>

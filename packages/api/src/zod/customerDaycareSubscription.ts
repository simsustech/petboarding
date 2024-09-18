import * as z from 'zod'
import { CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS } from '../kysely/types.js'
import { daycareSubscription } from './daycareSubscription.js'

export const customerDaycareSubscriptionValidation = {
  id: z.number().optional(),
  status: z.nativeEnum(CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS).optional(),
  effectiveDate: z.string(),
  expirationDate: z.string().optional(),
  invoiceUuid: z.string().optional().nullable(),
  customerId: z.number().optional(),
  daycareSubscriptionId: z.number(),
  daycareSubscription: daycareSubscription.optional().nullable()
}

export const customerDaycareSubscription = z.object(
  customerDaycareSubscriptionValidation
)

export type CustomerDaycareSubscription = z.infer<
  typeof customerDaycareSubscription
>

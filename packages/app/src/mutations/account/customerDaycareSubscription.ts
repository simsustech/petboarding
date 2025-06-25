import type { CustomerDaycareSubscription } from '@petboarding/api/zod'
import { useMutation } from '@pinia/colada'
import { trpc } from '../../trpc.js'

export const useAccountCreateCustomerDaycareSubscriptionMutation = () => {
  const { ...rest } = useMutation({
    mutation: (customerDaycareSubscription: CustomerDaycareSubscription) =>
      trpc.user.createCustomerDaycareSubscription.mutate(
        customerDaycareSubscription
      )
  })
  return {
    ...rest
  }
}

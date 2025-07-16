import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'

export const useAccountGetCustomerDaycareSubscriptionsQuery = defineQuery(
  () => {
    const { data: customerDaycareSubscriptions, ...rest } = useQuery({
      enabled: !import.meta.env.SSR,
      key: () => ['accountGetCustomerDaycareSubscriptions'],
      query: () => trpc.user.getCustomerDaycareSubscriptions.query()
    })

    return {
      customerDaycareSubscriptions,
      ...rest
    }
  }
)

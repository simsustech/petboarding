import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'

export const useConfigurationGetDaycareSubscriptionsQuery = defineQuery(() => {
  const { data: daycareSubscriptions, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['adminGetDaycareSubscriptionsQuery'],
    query: () => trpc.configuration.getDaycareSubscriptions.query()
  })

  return {
    daycareSubscriptions,
    ...rest
  }
})

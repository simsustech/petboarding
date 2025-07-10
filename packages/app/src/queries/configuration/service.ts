import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'

export const useConfigurationGetServicesQuery = defineQuery(() => {
  const { data: services, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['adminGetServicesQuery'],
    query: () => trpc.configuration.getServices.query()
  })

  return {
    services,
    ...rest
  }
})

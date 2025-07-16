import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'

export const useAdminSlimfactHealthCheckQuery = defineQuery(() => {
  const { data, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['adminSlimfactHealthCheck'],
    query: () => trpc.admin.slimfactHealthcheck.query()
  })

  return {
    data,
    ...rest
  }
})

import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'

export const useConfigurationGetKennelsQuery = defineQuery(() => {
  const { data: kennels, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['adminGetKennelsQuery'],
    query: () => trpc.configuration.getKennels.query()
  })

  return {
    kennels,
    ...rest
  }
})

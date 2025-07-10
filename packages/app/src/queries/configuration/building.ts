import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'

export const useConfigurationGetBuildingsQuery = defineQuery(() => {
  const { data: buildings, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['adminGetBuildingsQuery'],
    query: () => trpc.configuration.getBuildings.query()
  })

  return {
    buildings,
    ...rest
  }
})

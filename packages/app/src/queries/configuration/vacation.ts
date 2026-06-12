import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'

export const useConfigurationGetVacationsQuery = defineQuery(() => {
  const { data: vacations, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['adminGetVacationsQuery'],
    query: () => trpc.configuration.getVacations.query()
  })

  return {
    vacations,
    ...rest
  }
})

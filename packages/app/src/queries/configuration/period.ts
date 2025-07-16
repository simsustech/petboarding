import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'

export const useConfigurationGetPeriodsQuery = defineQuery(() => {
  const { data: periods, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['adminGetPeriodsQuery'],
    query: () => trpc.configuration.getPeriods.query()
  })

  return {
    periods,
    ...rest
  }
})

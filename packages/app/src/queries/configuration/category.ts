import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'

export const useConfigurationGetCategoriesQuery = defineQuery(() => {
  const { data: categories, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['adminGetCategoriesQuery'],
    query: () => trpc.configuration.getCategories.query()
  })

  return {
    categories,
    ...rest
  }
})

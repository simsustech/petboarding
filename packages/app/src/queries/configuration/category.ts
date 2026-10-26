import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'
import { ref, computed } from 'vue'

export const useConfigurationGetCategoriesQuery = defineQuery(() => {
  const page = ref(1)
  const rowsPerPage = ref(10)
  const sortBy = ref<'name' | 'order'>('name')
  const descending = ref(false)

  const pagination = computed(() => ({
    limit: rowsPerPage.value,
    offset: (page.value - 1) * rowsPerPage.value,
    sortBy: sortBy.value,
    descending: descending.value
  }))

  const { data: categories, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['adminGetCategoriesQuery', pagination.value],
    query: () =>
      trpc.configuration.getCategories.query({ pagination: pagination.value })
  })

  return {
    categories,
    page,
    rowsPerPage,
    sortBy,
    descending,
    ...rest
  }
})

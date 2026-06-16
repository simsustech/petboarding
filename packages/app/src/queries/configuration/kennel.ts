import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'
import { ref, computed } from 'vue'

export const useConfigurationGetKennelsQuery = defineQuery(() => {
  const page = ref(1)
  const rowsPerPage = ref(10)
  const sortBy = ref<'name' | 'capacity' | 'order'>('name')
  const descending = ref(false)

  const pagination = computed(() => ({
    limit: rowsPerPage.value,
    offset: (page.value - 1) * rowsPerPage.value,
    sortBy: sortBy.value,
    descending: descending.value
  }))

  const { data: kennels, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['adminGetKennelsQuery', pagination.value],
    query: () =>
      trpc.configuration.getKennels.query({ pagination: pagination.value })
  })

  return {
    kennels,
    page,
    rowsPerPage,
    sortBy,
    descending,
    ...rest
  }
})

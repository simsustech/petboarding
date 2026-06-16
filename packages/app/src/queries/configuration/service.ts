import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'
import { ref, computed } from 'vue'

export const useConfigurationGetServicesQuery = defineQuery(() => {
  const page = ref(1)
  const rowsPerPage = ref(10)
  const sortBy = ref<'name' | 'type' | 'listPrice'>('name')
  const descending = ref(false)

  const pagination = computed(() => ({
    limit: rowsPerPage.value,
    offset: (page.value - 1) * rowsPerPage.value,
    sortBy: sortBy.value,
    descending: descending.value
  }))

  const { data: services, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['adminGetServicesQuery', pagination.value],
    query: () =>
      trpc.configuration.getServices.query({ pagination: pagination.value })
  })

  return {
    services,
    page,
    rowsPerPage,
    sortBy,
    descending,
    ...rest
  }
})

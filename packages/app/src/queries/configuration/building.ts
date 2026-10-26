import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'
import { ref, computed } from 'vue'

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

export const useConfigurationGetBuildingsPaginatedQuery = defineQuery(() => {
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

  const { data: buildings, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['adminGetBuildingsPaginatedQuery', pagination.value],
    query: () =>
      trpc.configuration.getBuildings.query({ pagination: pagination.value })
  })

  return {
    buildings,
    page,
    rowsPerPage,
    sortBy,
    descending,
    ...rest
  }
})

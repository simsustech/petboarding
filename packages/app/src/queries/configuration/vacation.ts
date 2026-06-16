import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'
import { ref, computed } from 'vue'

export const useConfigurationGetVacationsQuery = defineQuery(() => {
  const page = ref(1)
  const rowsPerPage = ref(10)
  const sortBy = ref<'name' | 'startDate'>('startDate')
  const descending = ref(false)

  const pagination = computed(() => ({
    limit: rowsPerPage.value,
    offset: (page.value - 1) * rowsPerPage.value,
    sortBy: sortBy.value,
    descending: descending.value
  }))

  const { data: vacations, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['adminGetVacationsQuery', pagination.value],
    query: () =>
      trpc.configuration.getVacations.query({ pagination: pagination.value })
  })

  return {
    vacations,
    page,
    rowsPerPage,
    sortBy,
    descending,
    ...rest
  }
})

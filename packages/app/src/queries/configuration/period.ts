import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'
import { ref, computed } from 'vue'

export const useConfigurationGetPeriodsQuery = defineQuery(() => {
  const page = ref(1)
  const rowsPerPage = ref(10)
  const sortBy = ref<'startDate' | 'type'>('startDate')
  const descending = ref(false)

  const pagination = computed(() => ({
    limit: rowsPerPage.value,
    offset: (page.value - 1) * rowsPerPage.value,
    sortBy: sortBy.value,
    descending: descending.value
  }))

  const { data: periods, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['adminGetPeriodsQuery', pagination.value],
    query: () =>
      trpc.configuration.getPeriods.query({ pagination: pagination.value })
  })

  return {
    periods,
    page,
    rowsPerPage,
    sortBy,
    descending,
    ...rest
  }
})

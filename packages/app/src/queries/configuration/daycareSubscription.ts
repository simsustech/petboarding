import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'
import { ref, computed } from 'vue'

export const useConfigurationGetDaycareSubscriptionsQuery = defineQuery(() => {
  const page = ref(1)
  const rowsPerPage = ref(10)
  const sortBy = ref<'description' | 'numberOfDays' | 'listPrice'>(
    'description'
  )
  const descending = ref(false)

  const pagination = computed(() => ({
    limit: rowsPerPage.value,
    offset: (page.value - 1) * rowsPerPage.value,
    sortBy: sortBy.value,
    descending: descending.value
  }))

  const { data: daycareSubscriptions, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['adminGetDaycareSubscriptionsQuery', pagination.value],
    query: () =>
      trpc.configuration.getDaycareSubscriptions.query({
        pagination: pagination.value
      })
  })

  return {
    daycareSubscriptions,
    page,
    rowsPerPage,
    sortBy,
    descending,
    ...rest
  }
})

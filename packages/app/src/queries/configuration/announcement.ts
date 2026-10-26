import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'
import { ref, computed } from 'vue'

export const useConfigurationGetAnnouncementsQuery = defineQuery(() => {
  const page = ref(1)
  const rowsPerPage = ref(10)
  const sortBy = ref<'title' | 'expirationDate'>('expirationDate')
  const descending = ref(true)

  const pagination = computed(() => ({
    limit: rowsPerPage.value,
    offset: (page.value - 1) * rowsPerPage.value,
    sortBy: sortBy.value,
    descending: descending.value
  }))

  const { data: announcements, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['adminGetAnnouncementsQuery', pagination.value],
    query: () =>
      trpc.configuration.getAnnouncements.query({
        pagination: pagination.value
      })
  })

  return {
    announcements,
    page,
    rowsPerPage,
    sortBy,
    descending,
    ...rest
  }
})

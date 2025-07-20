import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'
import { ref } from 'vue'

export const useAccountGetOpeningTimesQuery = defineQuery(() => {
  const date = ref<string>(new Date().toISOString().slice(0, 10))

  const { data: openingTimes, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['accountGetOpeningTimes', date.value],
    query: () =>
      trpc.user.getOpeningTimes.query({
        date: date.value
      }),
    placeholderData: () => []
  })

  return {
    openingTimes,
    date,
    ...rest
  }
})

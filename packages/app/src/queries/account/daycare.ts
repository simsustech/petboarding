import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'
import { ref } from 'vue'

export const useAccountGetDaycareDatesQuery = defineQuery(() => {
  const from = ref('')
  const until = ref('')

  const { data: daycareDates, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['accountGetDaycareDates'],
    query: () =>
      trpc.user.getDaycareDates.query({
        from: from.value,
        until: until.value
      })
  })

  return {
    daycareDates,
    from,
    until,
    ...rest
  }
})

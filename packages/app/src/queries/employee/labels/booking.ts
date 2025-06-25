import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../../trpc.js'
import { ref } from 'vue'

export const useEmployeeGetBookingLabelsQuery = defineQuery(() => {
  const ids = ref<number[]>([])
  const { data: bookings, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['employeeGetBookingLabels', { ids: ids.value }],
    query: () =>
      trpc.employee.getBookingsByIds.query({
        ids: ids.value
      })
  })

  return {
    bookings,
    ids,
    ...rest
  }
})

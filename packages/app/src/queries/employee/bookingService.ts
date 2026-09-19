import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'
import { ref } from 'vue'

export const useEmployeeGetBookingServiceQuery = defineQuery(() => {
  const id = ref<number | null>(null)

  const { data: bookingService, ...rest } = useQuery({
    enabled: !import.meta.env.SSR && id.value != null,
    key: () => ['employeeGetBookingService', id.value],
    query: () =>
      trpc.employee.getBookingService.query({
        id: id.value!
      })
  })

  return {
    bookingService,
    id,
    ...rest
  }
})

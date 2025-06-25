import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'
import { BOOKING_STATUS, DAYCARE_DATE_STATUS } from '@petboarding/api/zod'
import { ref } from 'vue'

export const useEmployeeGetAgendaQuery = defineQuery(() => {
  const startDate = ref('')
  const endDate = ref('')
  const status = ref<BOOKING_STATUS | DAYCARE_DATE_STATUS>(
    BOOKING_STATUS.APPROVED
  )

  const { data: bookings, ...restBookings } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => [
      'employeeAgendaBookings',
      startDate.value,
      endDate.value,
      { status: status.value }
    ],
    query: () =>
      trpc.employee.getBookings.query({
        from: startDate.value,
        until: endDate.value,
        status: status.value
      })
  })

  const { data: daycareDates, ...restDaycareDates } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => [
      'employeeAgendaDaycareDates',
      startDate.value,
      endDate.value,
      { status: status.value }
    ],
    query: () =>
      trpc.employee.getDaycareDates.query({
        from: startDate.value,
        until: endDate.value,
        status: status.value
      })
  })

  const rest = {
    refetch: async () => {
      restBookings.refetch()
      restDaycareDates.refetch()
    }
  }

  return {
    bookings,
    daycareDates,
    startDate,
    endDate,
    status,
    ...rest
  }
})

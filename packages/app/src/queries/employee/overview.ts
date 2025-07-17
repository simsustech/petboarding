import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'
import { BOOKING_STATUS, DAYCARE_DATE_STATUS } from '@petboarding/api/zod'
import { ref } from 'vue'

export const useEmployeeGetOverviewQuery = defineQuery(() => {
  const selectedDate = ref(new Date().toISOString().slice(0, 10))
  const bookingStatuses = ref<BOOKING_STATUS[]>([
    BOOKING_STATUS.APPROVED,
    BOOKING_STATUS.AWAITING_DOWNPAYMENT
  ])
  const daycareDateStatus = ref<DAYCARE_DATE_STATUS>(
    DAYCARE_DATE_STATUS.APPROVED
  )

  const { data: arrivals, ...restArrivals } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => [
      'employeeOverviewBookingArrivals',
      selectedDate.value,
      { statuses: bookingStatuses.value }
    ],
    query: () =>
      trpc.employee.getBookings.query({
        from: selectedDate.value,
        until: selectedDate.value,
        startDate: selectedDate.value,
        statuses: bookingStatuses.value
      })
  })

  const { data: departures, ...restDepartures } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => [
      'employeeOverviewBookingDepartures',
      selectedDate.value,
      { statuses: bookingStatuses.value }
    ],
    query: () =>
      trpc.employee.getBookings.query({
        from: selectedDate.value,
        until: selectedDate.value,
        endDate: selectedDate.value,
        statuses: bookingStatuses.value
      })
  })

  const { data: daycareDates, ...restDaycareDates } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => [
      'employeeOverviewDaycareDates',
      { status: daycareDateStatus.value }
    ],
    query: () =>
      trpc.employee.getDaycareDates.query({
        from: selectedDate.value,
        until: selectedDate.value,
        status: daycareDateStatus.value
      })
  })

  const rest = {
    refetch: async () => {
      restArrivals.refetch()
      restDepartures.refetch()
      restDaycareDates.refetch()
    }
  }

  return {
    arrivals,
    departures,
    daycareDates,
    selectedDate,
    ...rest
  }
})

import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'
import { ref } from 'vue'
import { BOOKING_STATUS, DAYCARE_DATE_STATUS } from '@petboarding/api/zod'

export const useAdminGetOccupancyQuery = defineQuery(() => {
  const date = ref(new Date().toISOString().slice(0, 10))

  const { data: bookingOccupancy, ...restBookingOccupancy } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['adminGetBookingOccupancy', date.value],
    query: () =>
      trpc.admin.getBookingOccupancy.query({
        date: date.value,
        status: BOOKING_STATUS.APPROVED
      })
  })

  const { data: daycareOccupancy, ...restDaycareOccupancy } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['adminGetDaycareOccupancy', date.value],
    query: () =>
      trpc.admin.getDaycareOccupancy.query({
        date: date.value,
        status: DAYCARE_DATE_STATUS.APPROVED
      })
  })

  const rest = {
    refetch: async () => {
      await restBookingOccupancy.refetch()
      await restDaycareOccupancy.refetch()
    }
  }
  return {
    bookingOccupancy,
    daycareOccupancy,
    date,
    ...rest
  }
})

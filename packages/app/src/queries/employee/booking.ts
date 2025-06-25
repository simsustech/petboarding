import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'
import { ref } from 'vue'
import { date as dateUtil } from 'quasar'

export const useEmployeeGetBookingsQuery = defineQuery(() => {
  const customerId = ref(NaN)
  const from = ref(
    dateUtil
      .subtractFromDate(new Date(), { years: 2 })
      .toISOString()
      .slice(0, 10)
  )
  const until = ref(
    dateUtil.addToDate(new Date(), { years: 1 }).toISOString().slice(0, 10)
  )

  const { data: bookings, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => [
      'employeeGetBookings',
      customerId.value,
      from.value,
      until.value
    ],
    query: () =>
      trpc.employee.getBookings.query({
        customerId: customerId.value,
        from: from.value,
        until: until.value
      })
  })

  return {
    bookings,
    customerId,
    from,
    until,
    ...rest
  }
})

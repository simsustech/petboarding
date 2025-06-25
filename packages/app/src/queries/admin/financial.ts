import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'
import { ref } from 'vue'
import { date as dateUtil } from 'quasar'
import { InvoiceStatus } from '@modular-api/fastify-checkout/types'

export const useAdminFinancialGetBookingsQuery = defineQuery(() => {
  const customerId = ref()
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
      'adminFinancialBookings',
      customerId.value,
      from.value,
      until.value
    ],
    query: () =>
      trpc.admin.getBookings.query({
        customerId: customerId.value,
        from: from.value,
        until: until.value,
        invoice: {
          status: InvoiceStatus.BILL
        }
      }),
    placeholderData: () => []
  })

  return {
    bookings,
    customerId,
    from,
    until,
    ...rest
  }
})

export const useAdminFinancialGetUnpaidBookingsQuery = defineQuery(() => {
  const days = ref(90)
  const { data: bookings, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['adminFinancialUnpaidBookings', days.value],
    query: () =>
      trpc.admin.getUnpaidBookings.query({
        days: days.value
      }),
    placeholderData: () => []
  })

  return {
    bookings,
    days,
    ...rest
  }
})

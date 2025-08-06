import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'
import { ref } from 'vue'
import { date as dateUtil } from 'quasar'
import { InvoiceStatus } from '@modular-api/fastify-checkout/types'
import { computed } from 'vue'

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
  const page = ref(1)

  const rowsPerPage = ref(5)
  const sortBy = ref<'startDate' | 'endDate'>('startDate')
  const descending = ref(false)

  const pagination = computed<{
    limit: number
    offset: number
    sortBy: 'startDate' | 'endDate'
    descending: boolean
  }>(() => ({
    limit: rowsPerPage.value,
    offset: (page.value - 1) * rowsPerPage.value,
    sortBy: sortBy.value,
    descending: descending.value
  }))

  const { data: bookings, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => [
      'adminFinancialBookings',
      customerId.value,
      from.value,
      until.value,
      pagination.value
    ],
    query: () =>
      trpc.admin.getBookings.query({
        customerId: customerId.value,
        from: from.value,
        until: until.value,
        invoice: {
          statuses: [
            InvoiceStatus.OPEN,
            InvoiceStatus.PAID,
            InvoiceStatus.RECEIPT,
            InvoiceStatus.BILL
          ]
        },
        pagination: pagination.value
      })
  })

  return {
    bookings,
    customerId,
    from,
    until,
    page,
    rowsPerPage,
    sortBy,
    descending,
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

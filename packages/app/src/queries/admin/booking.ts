import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'
import { ref } from 'vue'
import { date as dateUtil } from 'quasar'
import { BOOKING_STATUS } from '@petboarding/api/zod'
import { computed } from 'vue'
type REPLY_TYPES = ['approve', 'reject', 'standby', 'reply']

export const useAdminGetBookingsQuery = defineQuery(() => {
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
  const bookingStatus = ref<BOOKING_STATUS>(BOOKING_STATUS.PENDING)

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
      'adminGetBookings',
      customerId.value,
      from.value,
      until.value,
      bookingStatus.value,
      pagination.value
    ],
    query: () =>
      trpc.admin.getBookings.query({
        // customerId: customerId.value,
        from: from.value,
        until: until.value,
        status: bookingStatus.value,
        pagination: pagination.value
      })
  })

  return {
    bookings,
    customerId,
    from,
    until,
    bookingStatus,
    page,
    rowsPerPage,
    sortBy,
    descending,
    ...rest
  }
})

export const useAdminGetBookingEmailQuery = defineQuery(() => {
  const id = ref(NaN)
  const type = ref<REPLY_TYPES[number]>('approve')

  const { data: email, ...rest } = useQuery({
    enabled: !import.meta.env.SSR && !!id.value && !Number.isNaN(id.value),
    key: () => ['adminGetBookingEmail', id.value, type.value],
    query: () =>
      trpc.admin.getBookingEmail.query({
        id: id.value,
        type: type.value
      })
  })

  return {
    email,
    id,
    type,
    ...rest
  }
})

export const useAdminGetBookingsCount = defineQuery(() => {
  const bookingStatus = ref<BOOKING_STATUS>(BOOKING_STATUS.PENDING)

  const { data: bookingsCount, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['adminGetBookingsCount', bookingStatus.value],
    query: () =>
      trpc.admin.getBookingsCount.query({
        status: bookingStatus.value
      })
  })

  return {
    bookingsCount,
    bookingStatus,
    ...rest
  }
})

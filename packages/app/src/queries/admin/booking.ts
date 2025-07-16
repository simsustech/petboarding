import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'
import { ref } from 'vue'
import { date as dateUtil } from 'quasar'
import { BOOKING_STATUS } from '@petboarding/api/zod'
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

  const { data: bookings, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => [
      'adminGetBookings',
      customerId.value,
      from.value,
      until.value,
      bookingStatus.value
    ],
    query: () =>
      trpc.admin.getBookings.query({
        customerId: customerId.value,
        from: from.value,
        until: until.value,
        status: bookingStatus.value
      })
  })

  return {
    bookings,
    customerId,
    from,
    until,
    bookingStatus,
    ...rest
  }
})

export const useAdminGetBookingEmailQuery = defineQuery(() => {
  const id = ref(NaN)
  const type = ref<REPLY_TYPES[number]>('approve')

  const { data: email, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
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

import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'

export const useAccountGetBookingsQuery = defineQuery(() => {
  const { data: bookings, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['accountGetBookings'],
    query: () => trpc.user.getBookings.query()
  })

  return {
    bookings,
    ...rest
  }
})

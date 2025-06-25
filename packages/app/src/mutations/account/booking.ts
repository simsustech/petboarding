import type { Booking } from '@petboarding/api/zod'
import { useMutation } from '@pinia/colada'
import { trpc } from '../../trpc.js'

export const useAccountCreateBookingMutation = () => {
  const { ...rest } = useMutation({
    mutation: (booking: Booking) => trpc.user.createBooking.mutate(booking)
  })
  return {
    ...rest
  }
}

export const useAccountUpdateBookingMutation = () => {
  const { ...rest } = useMutation({
    mutation: (booking: Booking) => trpc.user.updateBooking.mutate(booking)
  })
  return {
    ...rest
  }
}

export const useAccountCancelBookingMutation = () => {
  const { ...rest } = useMutation({
    mutation: ({
      id,
      reason,
      localeCode
    }: {
      id: number
      reason: string
      localeCode?: string
    }) => trpc.user.cancelBooking.mutate({ id, reason, localeCode })
  })
  return {
    ...rest
  }
}

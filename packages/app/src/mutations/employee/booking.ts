import type { Booking } from '@petboarding/api/zod'
import { useMutation } from '@pinia/colada'
import { trpc } from '../../trpc.js'

export const useEmployeeCreateBookingMutation = () => {
  const { ...rest } = useMutation({
    mutation: (booking: Booking) => trpc.employee.createBooking.mutate(booking)
  })
  return {
    ...rest
  }
}

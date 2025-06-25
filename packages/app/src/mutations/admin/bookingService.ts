import { useMutation } from '@pinia/colada'
import { trpc } from '../../trpc.js'
import { BookingService } from '@petboarding/api'

export const useAdminUpdateBookingServiceMutation = () => {
  const { ...rest } = useMutation({
    mutation: (bookingService: BookingService) =>
      trpc.admin.updateBookingService.mutate(bookingService)
  })
  return {
    ...rest
  }
}

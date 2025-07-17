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

export const useEmployeeUpdateBookingMutation = () => {
  const { ...rest } = useMutation({
    mutation: (booking: Booking) => trpc.employee.updateBooking.mutate(booking)
  })
  return {
    ...rest
  }
}

export const useEmployeeCancelBookingMutation = () => {
  const { ...rest } = useMutation({
    mutation: ({ id, reason }: { id: number; reason: string }) =>
      trpc.employee.cancelBooking.mutate({ id, reason })
  })
  return {
    ...rest
  }
}

export const useEmployeeUpdateBookingInvoiceMutation = () => {
  const { ...rest } = useMutation({
    mutation: (id: number) => trpc.employee.updateBookingInvoice.mutate({ id })
  })
  return {
    ...rest
  }
}

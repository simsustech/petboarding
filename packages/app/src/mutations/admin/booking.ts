import { useMutation } from '@pinia/colada'
import { trpc } from '../../trpc.js'

export const useAdminBookingSettleCancellationMutation = () => {
  const { ...rest } = useMutation({
    mutation: ({ id }: { id: number }) =>
      trpc.admin.settleBookingCancelation.mutate({ id })
  })
  return {
    ...rest
  }
}

export const useAdminApproveBookingMutation = () => {
  const { ...rest } = useMutation({
    mutation: ({
      id,
      emailText,
      emailSubject,
      skipDownPayment
    }: {
      id: number
      emailText: string
      emailSubject: string
      skipDownPayment: boolean
    }) =>
      trpc.admin.approveBooking.mutate({
        id,
        emailText,
        emailSubject,
        skipDownPayment
      })
  })
  return {
    ...rest
  }
}

export const useAdminRejectBookingMutation = () => {
  const { ...rest } = useMutation({
    mutation: ({
      id,
      emailText,
      emailSubject
    }: {
      id: number
      emailText: string
      emailSubject: string
    }) =>
      trpc.admin.rejectBooking.mutate({
        id,
        emailText,
        emailSubject
      })
  })
  return {
    ...rest
  }
}

export const useAdminReplyBookingMutation = () => {
  const { ...rest } = useMutation({
    mutation: ({
      id,
      emailText,
      emailSubject
    }: {
      id: number
      emailText: string
      emailSubject: string
    }) =>
      trpc.admin.replyBooking.mutate({
        id,
        emailText,
        emailSubject
      })
  })
  return {
    ...rest
  }
}

export const useAdminStandbyBookingMutation = () => {
  const { ...rest } = useMutation({
    mutation: ({
      id,
      emailText,
      emailSubject
    }: {
      id: number
      emailText: string
      emailSubject: string
    }) =>
      trpc.admin.standbyBooking.mutate({
        id,
        emailText,
        emailSubject
      })
  })
  return {
    ...rest
  }
}

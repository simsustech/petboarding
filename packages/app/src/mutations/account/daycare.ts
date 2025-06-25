import type { DaycareDate } from '@petboarding/api/zod'
import { useMutation } from '@pinia/colada'
import { trpc } from '../../trpc.js'

export const useAccountCreateDaycareDatesMutation = () => {
  const { ...rest } = useMutation({
    mutation: (daycareDates: DaycareDate[]) =>
      trpc.user.createDaycareDates.mutate(daycareDates)
  })
  return {
    ...rest
  }
}

export const useAccountCancelDaycareDateMutation = () => {
  const { ...rest } = useMutation({
    mutation: (daycareDateIds: number[]) =>
      trpc.user.cancelDaycareDates.mutate(daycareDateIds)
  })
  return {
    ...rest
  }
}

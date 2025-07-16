import { useMutation } from '@pinia/colada'
import { trpc } from '../../trpc.js'

export const useAdminApproveDaycareDateMutation = () => {
  const { ...rest } = useMutation({
    mutation: ({ ids }: { ids: number[] }) =>
      trpc.admin.approveDaycareDateIds.mutate(ids)
  })
  return {
    ...rest
  }
}

export const useAdminRejectDaycareDateMutation = () => {
  const { ...rest } = useMutation({
    mutation: ({ ids }: { ids: number[] }) =>
      trpc.admin.approveDaycareDateIds.mutate(ids)
  })
  return {
    ...rest
  }
}

export const useAdminStandbyDaycareDateMutation = () => {
  const { ...rest } = useMutation({
    mutation: ({ ids }: { ids: number[] }) =>
      trpc.admin.approveDaycareDateIds.mutate(ids)
  })
  return {
    ...rest
  }
}

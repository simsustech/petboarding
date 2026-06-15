import { useMutation } from '@pinia/colada'
import { trpc } from '../../trpc.js'

export const useConfigurationCreateVacationMutation = () => {
  const { ...rest } = useMutation({
    mutation: (vacation: {
      name: string
      startDate: string
      endDate: string
      surchargePerDay?: number
    }) => trpc.configuration.createVacation.mutate(vacation)
  })
  return { ...rest }
}

export const useConfigurationUpdateVacationMutation = () => {
  const { ...rest } = useMutation({
    mutation: (vacation: {
      id: number
      name: string
      startDate: string
      endDate: string
      surchargePerDay?: number
    }) => trpc.configuration.updateVacation.mutate(vacation)
  })
  return { ...rest }
}

export const useConfigurationDeleteVacationMutation = () => {
  const { ...rest } = useMutation({
    mutation: ({ id }: { id: number }) =>
      trpc.configuration.deleteVacation.mutate(id)
  })
  return { ...rest }
}

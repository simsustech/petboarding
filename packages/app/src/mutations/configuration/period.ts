import { useMutation } from '@pinia/colada'
import { trpc } from '../../trpc.js'
import { Period } from '@petboarding/api/zod'

export const useConfigurationCreatePeriodMutation = () => {
  const { ...rest } = useMutation({
    mutation: (period: Period) => trpc.configuration.createPeriod.mutate(period)
  })
  return {
    ...rest
  }
}

export const useConfigurationUpdatePeriodMutation = () => {
  const { ...rest } = useMutation({
    mutation: (period: Period) => trpc.configuration.updatePeriod.mutate(period)
  })
  return {
    ...rest
  }
}

export const useConfigurationDeletePeriodMutation = () => {
  const { ...rest } = useMutation({
    mutation: ({ id }: { id: number }) =>
      trpc.configuration.deletePeriod.mutate(id)
  })
  return {
    ...rest
  }
}

import { useMutation } from '@pinia/colada'
import { trpc } from '../../trpc.js'
import { OpeningTime } from '@petboarding/api/zod'

export const useConfigurationCreateOpeningTimeMutation = () => {
  const { ...rest } = useMutation({
    mutation: (openingtime: OpeningTime) =>
      trpc.configuration.createOpeningTime.mutate(openingtime)
  })
  return {
    ...rest
  }
}

export const useConfigurationUpdateOpeningTimeMutation = () => {
  const { ...rest } = useMutation({
    mutation: (openingtime: OpeningTime) =>
      trpc.configuration.updateOpeningTime.mutate(openingtime)
  })
  return {
    ...rest
  }
}

export const useConfigurationDeleteOpeningTimeMutation = () => {
  const { ...rest } = useMutation({
    mutation: ({ id }: { id: number }) =>
      trpc.configuration.deleteOpeningTime.mutate(id)
  })
  return {
    ...rest
  }
}

import { useMutation } from '@pinia/colada'
import { trpc } from '../../trpc.js'
import { Kennel } from '@petboarding/api/zod'

export const useConfigurationCreateKennelMutation = () => {
  const { ...rest } = useMutation({
    mutation: (kennel: Kennel) => trpc.configuration.createKennel.mutate(kennel)
  })
  return {
    ...rest
  }
}

export const useConfigurationUpdateKennelMutation = () => {
  const { ...rest } = useMutation({
    mutation: (kennel: Kennel) => trpc.configuration.updateKennel.mutate(kennel)
  })
  return {
    ...rest
  }
}

export const useConfigurationDeleteKennelMutation = () => {
  const { ...rest } = useMutation({
    mutation: ({ id }: { id: number }) =>
      trpc.configuration.deleteKennel.mutate(id)
  })
  return {
    ...rest
  }
}

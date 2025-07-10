import { useMutation } from '@pinia/colada'
import { trpc } from '../../trpc.js'
import { Service } from '@petboarding/api/zod'

export const useConfigurationCreateServiceMutation = () => {
  const { ...rest } = useMutation({
    mutation: (service: Service) =>
      trpc.configuration.createService.mutate(service)
  })
  return {
    ...rest
  }
}

export const useConfigurationUpdateServiceMutation = () => {
  const { ...rest } = useMutation({
    mutation: (service: Service) =>
      trpc.configuration.updateService.mutate(service)
  })
  return {
    ...rest
  }
}

export const useConfigurationDeleteServiceMutation = () => {
  const { ...rest } = useMutation({
    mutation: ({ id }: { id: number }) =>
      trpc.configuration.deleteService.mutate(id)
  })
  return {
    ...rest
  }
}

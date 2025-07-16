import { useMutation } from '@pinia/colada'
import { trpc } from '../../trpc.js'
import { Building } from '@petboarding/api/zod'

export const useConfigurationCreateBuildingMutation = () => {
  const { ...rest } = useMutation({
    mutation: (building: Building) =>
      trpc.configuration.createBuilding.mutate(building)
  })
  return {
    ...rest
  }
}

export const useConfigurationUpdateBuildingMutation = () => {
  const { ...rest } = useMutation({
    mutation: (building: Building) =>
      trpc.configuration.updateBuilding.mutate(building)
  })
  return {
    ...rest
  }
}

export const useConfigurationDeleteBuildingMutation = () => {
  const { ...rest } = useMutation({
    mutation: ({ id }: { id: number }) =>
      trpc.configuration.deleteBuilding.mutate(id)
  })
  return {
    ...rest
  }
}

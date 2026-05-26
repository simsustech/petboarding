import type { Pet } from '@petboarding/api/zod'
import { useMutation } from '@pinia/colada'
import { trpc } from '../../trpc.js'

export const useEmployeeUpdatePetMutation = () => {
  const { ...rest } = useMutation({
    mutation: (pet: Pet) => trpc.employee.updatePet.mutate(pet)
  })
  return {
    ...rest
  }
}

export const useEmployeeSetPetRelation = () => {
  const { ...rest } = useMutation({
    mutation: ({
      petId1,
      petId2,
      rating
    }: {
      petId1: number
      petId2: number
      rating: number
    }) => trpc.employee.setPetRelation.mutate({ petId1, petId2, rating })
  })
  return {
    ...rest
  }
}

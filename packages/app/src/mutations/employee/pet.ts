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

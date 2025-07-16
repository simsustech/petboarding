import type { Pet } from '@petboarding/api/zod'
import { useMutation } from '@pinia/colada'
import { trpc } from '../../trpc.js'

export const useAccountCreatePetMutation = () => {
  const { ...rest } = useMutation({
    mutation: (pet: Pet) => trpc.user.createPet.mutate(pet)
  })
  return {
    ...rest
  }
}

export const useAccountUpdatePetMutation = () => {
  const { ...rest } = useMutation({
    mutation: (pet: Pet) => trpc.user.updatePet.mutate(pet)
  })
  return {
    ...rest
  }
}

import { useMutation } from '@pinia/colada'
import { trpc } from '../../trpc.js'

export const useAdminDeletePetMutation = () => {
  const { ...rest } = useMutation({
    mutation: ({ id }: { id: number }) => trpc.admin.deletePet.mutate({ id })
  })
  return {
    ...rest
  }
}

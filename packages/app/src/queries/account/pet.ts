import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'

export const useAccountGetPetsQuery = defineQuery(() => {
  const { data: pets, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['accountGetPets'],
    query: () => trpc.user.getPets.query()
  })

  return {
    pets,
    ...rest
  }
})

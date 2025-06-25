import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'

export const useAccountGetContactPeopleQuery = defineQuery(() => {
  const { data: contactPeople, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['accountGetContactPeople'],
    query: () => trpc.user.getContactPeople.query()
  })

  return {
    contactPeople,
    ...rest
  }
})

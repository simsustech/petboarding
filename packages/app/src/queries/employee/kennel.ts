import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'

export const useEmployeeGetKennelsQuery = defineQuery(() => {
  const { data: kennels, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['employeeGetKennelsQuery'],
    query: () => trpc.employee.getKennels.query()
  })

  return {
    kennels,
    ...rest
  }
})

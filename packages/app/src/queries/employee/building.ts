import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'

export const useEmployeeGetBuildingsQuery = defineQuery(() => {
  const { data: buildings, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['employeeGetBuildingsQuery'],
    query: () => trpc.employee.getBuildings.query()
  })

  return {
    buildings,
    ...rest
  }
})

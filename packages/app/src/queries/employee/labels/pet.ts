import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../../trpc.js'
import { ref } from 'vue'

export const useEmployeeGetPetLabelsQuery = defineQuery(() => {
  const ids = ref<number[]>([])
  const { data: pets, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['employeeGetPetLabels', ids.value],
    query: () =>
      trpc.employee.getPetsByIds.query({
        ids: ids.value
      })
  })

  return {
    pets,
    ids,
    ...rest
  }
})

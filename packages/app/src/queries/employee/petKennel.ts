import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'
import { ref } from 'vue'

export const useEmployeeGetPetKennelsQuery = defineQuery(() => {
  const selectedDate = ref('')

  const { data: petKennels, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['employeeGetPetKennelsQuery', selectedDate.value],
    query: () =>
      trpc.employee.getPetKennels.query({
        date: selectedDate.value
      })
  })

  return {
    petKennels,
    selectedDate,
    ...rest
  }
})

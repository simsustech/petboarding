import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'
import { ref } from 'vue'

export const useEmployeeGetPetsQuery = defineQuery(() => {
  // const customerId = ref(NaN)
  const ids = ref<number[]>([])

  const { data: pets, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['employeeGetPets', { ids: ids.value }],
    query: () =>
      trpc.employee.getPetsByIds.query({
        // customerId: customerId.value,
        ids: ids.value
      })
  })

  return {
    pets,
    ids,
    ...rest
  }
})

export const useEmployeeGetPetQuery = defineQuery(() => {
  const id = ref<number>(NaN)

  const { data: pet, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['employeeGetPet', id.value],
    query: () =>
      trpc.employee.getPet.query({
        id: id.value
      })
  })

  return {
    pet,
    id,
    ...rest
  }
})

export const useEmployeeSearchPetsQuery = defineQuery(() => {
  // const customerId = ref(NaN)
  const searchPhrase = ref('')

  const { data: pets, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['employeeSearchPets', searchPhrase.value],
    query: () => trpc.employee.searchPets.query(searchPhrase.value)
  })

  return {
    pets,
    searchPhrase,
    ...rest
  }
})

export const useEmployeeGetPetsByCustomerId = defineQuery(() => {
  const customerId = ref(NaN)

  const { data: pets, ...rest } = useQuery({
    enabled: !import.meta.env.SSR && !!customerId.value,
    key: () => ['employeeGetPetsByCustomerId', customerId.value],
    query: () =>
      trpc.employee.getPetsByCustomerId.query({
        customerId: customerId.value
      }),
    placeholderData: () => []
  })

  return {
    pets,
    customerId,
    ...rest
  }
})

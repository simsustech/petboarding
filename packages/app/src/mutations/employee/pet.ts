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

export const useEmployeeSetPetRelation = () => {
  const { ...rest } = useMutation({
    mutation: ({
      petId1,
      petId2,
      rating
    }: {
      petId1: number
      petId2: number
      rating: number
    }) => trpc.employee.setPetRelation.mutate({ petId1, petId2, rating })
  })
  return {
    ...rest
  }
}

export const useEmployeeCreateAlert = () => {
  const { ...rest } = useMutation({
    mutation: ({
      petId,
      condition,
      startDate,
      endDate
    }: {
      petId: number
      condition: string
      startDate?: string | null
      endDate?: string | null
    }) =>
      trpc.employee.createAlert.mutate({ petId, condition, startDate, endDate })
  })
  return {
    ...rest
  }
}

export const useEmployeeUpdateAlert = () => {
  const { ...rest } = useMutation({
    mutation: ({
      id,
      condition,
      startDate,
      endDate
    }: {
      id: number
      condition: string
      startDate?: string | null
      endDate?: string | null
    }) =>
      trpc.employee.updateAlert.mutate({ id, condition, startDate, endDate })
  })
  return {
    ...rest
  }
}

export const useEmployeeDeleteAlert = () => {
  const { ...rest } = useMutation({
    mutation: ({ id }: { id: number }) =>
      trpc.employee.deleteAlert.mutate({ id })
  })
  return {
    ...rest
  }
}

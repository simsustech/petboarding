import type { Vaccination } from '@petboarding/api/zod'
import { useMutation } from '@pinia/colada'
import { trpc } from '../../trpc.js'

export const useEmployeeCreateVaccinationMutation = () => {
  const { ...rest } = useMutation({
    mutation: (vaccination: Vaccination) =>
      trpc.employee.createVaccination.mutate(vaccination)
  })
  return {
    ...rest
  }
}

export const useEmployeeUpdateVaccinationMutation = () => {
  const { ...rest } = useMutation({
    mutation: (vaccination: Vaccination) =>
      trpc.employee.updateVaccination.mutate(vaccination)
  })
  return {
    ...rest
  }
}

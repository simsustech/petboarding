import type { DaycareDate } from '@petboarding/api/zod'
import { useMutation } from '@pinia/colada'
import { trpc } from '../../trpc.js'

export const useEmployeeCreateDaycareDatesMutation = () => {
  const { ...rest } = useMutation({
    mutation: (daycareDates: DaycareDate[]) =>
      trpc.employee.createDaycareDates.mutate(daycareDates)
  })
  return {
    ...rest
  }
}

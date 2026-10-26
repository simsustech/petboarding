import { useMutation } from '@pinia/colada'
import { trpc } from '../../trpc.js'

export const useEmployeeUpdateCustomerDaycareSubscriptionMutation = () => {
  const { ...rest } = useMutation({
    mutation: (input: { id: number; expirationDate: string }) =>
      trpc.employee.updateCustomerDaycareSubscription.mutate(input)
  })
  return {
    ...rest
  }
}

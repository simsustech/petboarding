import type { Customer } from '@petboarding/api/zod'
import { useMutation } from '@pinia/colada'
import { trpc } from '../../trpc.js'

export const useEmployeeUpdateCustomerMutation = () => {
  const { ...rest } = useMutation({
    mutation: (customer: Customer) =>
      trpc.employee.updateCustomer.mutate(customer)
  })
  return {
    ...rest
  }
}

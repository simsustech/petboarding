import type { Customer } from '@petboarding/api/zod'
import { useMutation } from '@pinia/colada'
import { trpc } from '../../trpc.js'

export const useAccountCreateCustomerMutation = () => {
  const { ...rest } = useMutation({
    mutation: (customer: Customer) => trpc.user.createCustomer.mutate(customer)
  })
  return {
    ...rest
  }
}

export const useAccountUpdateCustomerMutation = () => {
  const { ...rest } = useMutation({
    mutation: (customer: Customer) => trpc.user.updateCustomer.mutate(customer)
  })
  return {
    ...rest
  }
}

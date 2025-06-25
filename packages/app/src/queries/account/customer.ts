import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'

export const useAccountGetCustomerQuery = defineQuery(() => {
  const { data: customer, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['accountGetCustomer'],
    query: () => trpc.user.getCustomer.query()
  })

  return {
    customer,
    ...rest
  }
})

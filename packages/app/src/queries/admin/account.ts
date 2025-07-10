import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'
import { ref } from 'vue'

export const useAdminGetAccountsQuery = defineQuery(() => {
  const pagination = ref({
    limit: 5,
    offset: 0,
    sortBy: null as 'id' | 'email' | 'name' | null,
    descending: false
  })

  const criteria = ref({
    name: '',
    email: '',
    roles: []
  })

  const { data: accounts, ...restAccounts } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => [
      'adminGetAccounts',
      { criteria: criteria.value },
      { pagination: pagination.value }
    ],
    query: () =>
      trpc.admin.getAccounts.query({
        criteria: criteria.value,
        pagination: pagination.value
      }),
    placeholderData: () => []
  })

  const { data: count, ...restCount } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['adminGetAccountsCount', { criteria: criteria.value }],
    query: () =>
      trpc.admin.getAccountsCount.query({
        criteria: criteria.value
      }),
    placeholderData: () => 0
  })

  const rest = {
    refetch: async () => {
      await restAccounts.refetch()
      await restCount.refetch()
    }
  }

  return {
    accounts,
    count,
    criteria,
    pagination,
    ...rest
  }
})

export const useAdminFindAccountsQuery = defineQuery(() => {
  const email = ref<string>('')

  const { data: accounts, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['adminFindAccounts', email.value],
    query: () =>
      trpc.admin.findAccounts.query({
        email: email.value
      }),
    placeholderData: () => []
  })

  return {
    accounts,
    email,
    ...rest
  }
})

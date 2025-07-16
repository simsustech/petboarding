import type { PETBOARDING_ACCOUNT_ROLES } from '@petboarding/api/zod'
import { useMutation } from '@pinia/colada'
import { trpc } from '../../trpc.js'

export const useAdminAccountAddRoleMutation = () => {
  const { ...rest } = useMutation({
    mutation: ({ id, role }: { id: number; role: PETBOARDING_ACCOUNT_ROLES }) =>
      trpc.admin.addRole.mutate({ id, role })
  })
  return {
    ...rest
  }
}

export const useAdminAccountRemoveAddRoleMutation = () => {
  const { ...rest } = useMutation({
    mutation: ({ id, role }: { id: number; role: PETBOARDING_ACCOUNT_ROLES }) =>
      trpc.admin.removeRole.mutate({ id, role })
  })
  return {
    ...rest
  }
}

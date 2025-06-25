import type { ContactPerson } from '@petboarding/api/zod'
import { useMutation } from '@pinia/colada'
import { trpc } from '../../trpc.js'

export const useAccountCreateContactPersonMutation = () => {
  const { ...rest } = useMutation({
    mutation: (contactPerson: ContactPerson) =>
      trpc.user.createContactPerson.mutate(contactPerson)
  })
  return {
    ...rest
  }
}

export const useAccountUpdateContactPersonMutation = () => {
  const { ...rest } = useMutation({
    mutation: (contactPerson: ContactPerson) =>
      trpc.user.updateContactPerson.mutate(contactPerson)
  })
  return {
    ...rest
  }
}

import { useMutation } from '@pinia/colada'
import { trpc } from '../../trpc.js'

export const useAdminUpdateTermsAndConditionsMutation = () => {
  const { ...rest } = useMutation({
    mutation: ({ content }: { content: string }) =>
      trpc.admin.updateTermsAndConditions.mutate({
        content
      })
  })
  return {
    ...rest
  }
}

export const useAdminUpdatePrivacyPolicyMutation = () => {
  const { ...rest } = useMutation({
    mutation: ({ content }: { content: string }) =>
      trpc.admin.updatePrivacyPolicy.mutate({
        content
      })
  })
  return {
    ...rest
  }
}

import { useMutation } from '@pinia/colada'
import { trpc } from '../../trpc.js'
import { DaycareSubscription } from '@petboarding/api/zod'

export const useConfigurationCreateDaycareSubscriptionMutation = () => {
  const { ...rest } = useMutation({
    mutation: (daycaresubscription: DaycareSubscription) =>
      trpc.configuration.createDaycareSubscription.mutate(daycaresubscription)
  })
  return {
    ...rest
  }
}

export const useConfigurationUpdateDaycareSubscriptionMutation = () => {
  const { ...rest } = useMutation({
    mutation: (daycaresubscription: DaycareSubscription) =>
      trpc.configuration.updateDaycareSubscription.mutate(daycaresubscription)
  })
  return {
    ...rest
  }
}

export const useConfigurationDeleteDaycareSubscriptionMutation = () => {
  const { ...rest } = useMutation({
    mutation: ({ id }: { id: number }) =>
      trpc.configuration.deleteDaycareSubscription.mutate({ id })
  })
  return {
    ...rest
  }
}

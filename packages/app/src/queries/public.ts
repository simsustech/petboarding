import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../trpc.js'

export const usePublicGetCategories = defineQuery(() => {
  const { data: categories, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['publicGetCategories'],
    query: () => trpc.public.getCategories.query()
  })

  return {
    categories,
    ...rest
  }
})

export const usePublicGetServicesQuery = defineQuery(() => {
  const { data: services, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['publicGetServices'],
    query: () => trpc.public.getServices.query()
  })

  return {
    services,
    ...rest
  }
})

export const usePublicGetDaycareSubscriptionsQuery = defineQuery(() => {
  const { data: daycareSubscriptions, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['publicGetDaycareSubscriptions'],
    query: () => trpc.public.getDaycareSubscriptions.query()
  })

  return {
    daycareSubscriptions,
    ...rest
  }
})

export const usePublicGetUnavailableDaycareDatesQuery = defineQuery(() => {
  const { data: unavailableDaycareDates, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['publicGetUnavailableDaycareDates'],
    query: () => trpc.public.getUnavailableDaycareDates.query()
  })

  return {
    unavailableDaycareDates,
    ...rest
  }
})

export const usePublicGetOpeningTimesQuery = defineQuery(() => {
  const { data: openingTimes, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['publicGetOpeningTimesQuery'],
    query: () => trpc.public.getOpeningTimes.query()
  })

  return {
    openingTimes,
    ...rest
  }
})

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

export const usePublicGetPeriodsQuery = defineQuery(() => {
  const { data: periods, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['publicGetPeriodsQuery'],
    query: () => trpc.public.getPeriods.query()
  })

  return {
    periods,
    ...rest
  }
})

export const usePublicGetAnnouncementsQuery = defineQuery(() => {
  const { data: announcements, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['publicGetAnnouncementsQuery'],
    query: () => trpc.public.getAnnouncements.query(),
    placeholderData: () => []
  })

  return {
    announcements,
    ...rest
  }
})

export const usePublicGetUrgentAnnouncementsQuery = defineQuery(() => {
  const { data: urgentAnnouncements, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['publicGetUrgentAnnouncements'],
    query: () => trpc.public.getUrgentAnnouncements.query(),
    placeholderData: () => []
  })

  return {
    urgentAnnouncements,
    ...rest
  }
})

export const usePublicGetPrivacyPolicyQuery = defineQuery(() => {
  const { data: privacyPolicy, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['publicGetPrivacyPolicy'],
    query: () => trpc.public.getPrivacyPolicy.query()
  })

  return {
    privacyPolicy,
    ...rest
  }
})

export const usePublicGetTermsAndConditionsQuery = defineQuery(() => {
  const { data: termsAndConditions, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['publicGetTermsAndConditions'],
    query: () => trpc.public.getTermsAndConditions.query()
  })

  return {
    termsAndConditions,
    ...rest
  }
})

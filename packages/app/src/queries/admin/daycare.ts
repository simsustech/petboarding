import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'
import { ref } from 'vue'
import { DAYCARE_DATE_STATUS } from '@petboarding/api/zod'

export const useAdminGetDaycareDatesQuery = defineQuery(() => {
  const from = ref('')
  const until = ref('')
  const daycareDateStatus = ref<DAYCARE_DATE_STATUS>(
    DAYCARE_DATE_STATUS.PENDING
  )

  const { data: daycareDates, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => [
      'adminGetDaycareDates',
      from.value,
      until.value,
      daycareDateStatus.value
    ],
    query: () =>
      trpc.admin.getDaycareDates.query({
        from: from.value,
        until: until.value,
        status: daycareDateStatus.value
      })
  })

  return {
    daycareDates,
    from,
    until,
    daycareDateStatus,
    ...rest
  }
})

export const useAdminGetDaycareDatesByIdQuery = defineQuery(() => {
  const ids = ref<number[]>([])

  const { data: daycareDates, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['adminGetDaycareDatesById', ids.value],
    query: () =>
      trpc.admin.getDaycareDates.query({
        ids: ids.value
      })
  })

  return {
    daycareDates,
    ids,
    ...rest
  }
})

export const useAdminGetDaycareCount = defineQuery(() => {
  const daycareStatus = ref<DAYCARE_DATE_STATUS>(DAYCARE_DATE_STATUS.PENDING)

  const { data: daycareCount, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['adminGetDaycareCount', daycareStatus.value],
    query: () =>
      trpc.admin.getDaycareCount.query({
        status: daycareStatus.value
      })
  })

  return {
    daycareCount,
    daycareStatus,
    ...rest
  }
})

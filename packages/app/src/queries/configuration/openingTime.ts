import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'
import { useConfiguration } from '../../configuration.js'
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { watch } from 'vue'

export const useConfigurationGetOpeningTimesQuery = defineQuery(() => {
  const page = ref(1)
  const rowsPerPage = ref(10)
  const sortBy = ref<'name' | 'startTime'>('name')
  const descending = ref(false)

  const pagination = computed(() => ({
    limit: rowsPerPage.value,
    offset: (page.value - 1) * rowsPerPage.value,
    sortBy: sortBy.value,
    descending: descending.value
  }))

  const { data: openingTimes, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['adminGetOpeningTimesQuery', pagination.value],
    query: () =>
      trpc.configuration.getOpeningTimes.query({ pagination: pagination.value })
  })

  return {
    openingTimes,
    page,
    rowsPerPage,
    sortBy,
    descending,
    ...rest
  }
})

export const useConfigurationGetHolidaysQuery = defineQuery(() => {
  const configuration = useConfiguration()
  const $q = useQuasar()

  const country = ref(configuration.value.COUNTRY)
  const language = ref('en')

  watch($q.lang, (val) => (language.value = val.isoName.substring(0, 2)))

  const { data: holidays, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['adminGetHolidaysQuery'],
    query: () =>
      trpc.configuration.getHolidays.query({
        country: country.value,
        language: language.value
      })
  })

  return {
    holidays,
    country,
    language,
    ...rest
  }
})

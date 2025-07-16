import { defineQuery, useQuery } from '@pinia/colada'
import { trpc } from '../../trpc.js'
import { useConfiguration } from '../../configuration.js'
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { watch } from 'vue'

export const useConfigurationGetOpeningTimesQuery = defineQuery(() => {
  const { data: openingTimes, ...rest } = useQuery({
    enabled: !import.meta.env.SSR,
    key: () => ['adminGetOpeningTimesQuery'],
    query: () => trpc.configuration.getOpeningTimes.query()
  })

  return {
    openingTimes,
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

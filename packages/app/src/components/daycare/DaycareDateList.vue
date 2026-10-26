<template>
  <div>
    <template v-if="months.length">
      <!-- One section per month, each with its own count: the list can reach
           years ahead, and the header is what keeps it scannable. -->
      <section v-for="month in months" :key="month.key">
        <div class="row items-baseline justify-between q-pt-md">
          <div class="text-subtitle1 text-weight-medium">{{ month.label }}</div>
          <div class="text-caption text-on-surface-variant">
            {{ lang.daycare.messages.datesInMonth(month.dates.length) }}
          </div>
        </div>
        <q-separator class="q-mb-xs" />
        <q-list dense>
          <q-item v-for="daycareDate in month.dates" :key="daycareDate.id">
            <q-item-section>
              <q-item-label overline>{{
                formatDay(daycareDate.date)
              }}</q-item-label>
              <q-item-label>{{ petNames(daycareDate) }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="row items-center q-gutter-xs">
                <!-- The status fill and its ink, as one pair: the fill has a
                     value per scheme, so the ink cannot be inherited. -->
                <span
                  class="rounded-full text-weight-medium q-px-sm q-py-xs"
                  :class="DAYCARE_DATE_BUTTON_BG_CLASSES[daycareDate.status]"
                >
                  {{ lang.daycare.status[daycareDate.status] }}
                </span>
                <q-btn
                  flat
                  dense
                  round
                  icon="i-mdi-close"
                  :aria-label="`${lang.daycare.messages.cancelDate}: ${formatDay(daycareDate.date)}`"
                  @click="emit('cancel', daycareDate.id)"
                >
                  <q-tooltip>{{ lang.daycare.messages.cancelDate }}</q-tooltip>
                </q-btn>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </section>
    </template>
    <div v-else class="text-on-surface-variant">
      {{ lang.daycare.messages.noUpcomingDates }}
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'DaycareDateList'
}
</script>

<script setup lang="ts">
import type { DaycareDate } from '@petboarding/api/zod'
import { computed, ref, toRefs } from 'vue'
import { QList, QSeparator, useQuasar } from 'quasar'
import { useLang } from '../../lang/index.js'
import { DAYCARE_DATE_BUTTON_BG_CLASSES } from '../../configuration.js'

export interface Props {
  daycareDates: DaycareDate[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'cancel', id: number): void
}>()

const { daycareDates } = toRefs(props)

const lang = useLang()
const $q = useQuasar()

/** Dates in the API are `YYYY-MM-DD`; formatting them as UTC keeps the day. */
const format = (date: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat($q.lang.isoName, {
    ...options,
    timeZone: 'UTC'
  }).format(new Date(date))

const formatDay = (date: string) =>
  format(date, { weekday: 'short', day: 'numeric' })

const petNames = (daycareDate: DaycareDate) =>
  daycareDate.pets.map((pet) => pet.name).join(', ')

/** Chronological, grouped by calendar month, ascending. */
const months = computed(() => {
  const grouped = new Map<string, DaycareDate[]>()

  for (const daycareDate of [...daycareDates.value].sort((a, b) =>
    a.date.localeCompare(b.date)
  )) {
    const key = daycareDate.date.slice(0, 7)
    const dates = grouped.get(key)
    if (dates) dates.push(daycareDate)
    else grouped.set(key, [daycareDate])
  }

  return [...grouped].map(([key, dates]) => ({
    key,
    label: format(`${key}-01`, { month: 'long', year: 'numeric' }),
    dates
  }))
})

const variables = ref({
  // header: lang.value.some.nested.prop
})
const functions = ref({
  // submit
})
defineExpose({
  variables,
  functions
})
</script>

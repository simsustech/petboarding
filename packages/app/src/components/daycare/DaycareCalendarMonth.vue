<template>
  <div class="column col">
    <slot name="navigation" />
    <div class="row justify-center">
      <a class="text-subtitle1 text-weight-medium">{{
        `${lang.daycare.title} - ${getSelectedMonthName()}`
      }}</a>
    </div>
    <div class="row items-center justify-between q-px-sm q-mb-xs">
      <q-btn
        dense
        flat
        no-caps
        icon="i-mdi-chevron-left"
        :label="prevMonth.label"
        :aria-label="`${lang.previous}: ${prevMonth.aria}`"
        @click="onPrev"
      />
      <q-btn
        dense
        flat
        no-caps
        icon-right="i-mdi-chevron-right"
        :label="nextMonth.label"
        :aria-label="`${lang.next}: ${nextMonth.aria}`"
        @click="onNext"
      />
    </div>
    <div class="row q-mt-sm">
      <q-scroll-area :style="contentSize">
        <q-resize-observer @resize="onResize" />
        <q-calendar-month
          ref="calendarRef"
          v-model="selectedDate"
          animated
          bordered
          :focusable="focusable"
          :hoverable="hoverable"
          no-active-date
          month-label-size="xl"
          :weekdays="weekdays"
          :selected-dates="selectedDates"
          :locale="$q.lang.isoName"
          :disabled-days="disabledDates"
          :disabled-before="disabledBefore"
          :disabled-after="disabledAfter"
          :style="{
            height: '100%',
            'min-width': '600px'
          }"
          @change="onChange"
          @moved="onMoved"
          @click-date="onClickDate"
          @click-workweek="onClickWorkweek"
          @click-head-workweek="onClickHeadWorkweek"
          @click-head-day="onClickHeadDay"
        >
          <template #head-day-button="{ scope }">
            <q-btn
              :disabled="
                !selectedDates ||
                scope.timestamp.disabled ||
                disabledDates?.includes(scope.timestamp.date)
              "
              :class="{
                'q-mb-sm': true,
                'q-mt-sm': true,
                ...getButtonBgClasses(scope.timestamp.date),
                ...getButtonOutlineClasses(scope.timestamp.date)
              }"
              size="md"
              :outline="!getButtonBgClasses(scope.timestamp.date)"
              rounded
              :label="scope.dayLabel"
              @click="onClickDate({ scope })"
            >
              <q-tooltip v-if="$slots['head-day-button-tooltip']">
                <slot name="head-day-button-tooltip"></slot>
              </q-tooltip>
            </q-btn>
          </template>
          <template #day="{ scope: { timestamp } }">
            <div v-if="Object.keys(eventsMap).length" style="min-height: 30px">
              <template
                v-for="event in eventsMap[timestamp.date]"
                :key="event.id"
              >
                <div class="text-center q-mb-sm">
                  <q-chip
                    class="q-mt-none q-mb-none"
                    size="sm"
                    :color="event.bgcolor"
                    clickable
                    :selected="selectedEvents?.includes(event.id)"
                    style="height: 100%"
                    @click="emit('click:event', event)"
                  >
                    <div>
                      <div
                        v-for="(petName, index) in event.petNames"
                        :key="index"
                      >
                        {{ petName }}
                      </div>
                      <i v-if="event.lastName">{{ event.lastName }}</i>
                    </div>
                    <q-tooltip v-if="event.details" :delay="800">
                      {{ event.details }}
                    </q-tooltip>
                    <q-menu v-if="onOpenPets" context-menu>
                      <q-list>
                        <q-item
                          clickable
                          @click="$emit('openPets', { ids: event.petIds })"
                        >
                          <q-item-section>
                            <q-item-label>
                              {{ lang.daycare.messages.openPets }}
                            </q-item-label>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-chip>
                </div>
              </template>
              <slot name="dayFooter" :timestamp="timestamp" />
            </div>
          </template>
        </q-calendar-month>
      </q-scroll-area>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'DaycareCalendarMonth'
}
</script>

<script setup lang="ts">
import { QCalendarMonth } from '@quasar/quasar-ui-qcalendar/QCalendarMonth'
import type { QCalendarMonth as QCalendarMonthInstance } from '@quasar/quasar-ui-qcalendar'
import {
  type Timestamp,
  addToDate,
  nowUTC,
  parseTimestamp,
  today
} from '@timestamp-js/core'

import { QChip, QResizeObserver, date as dateUtil } from 'quasar'
import { computed, ref, toRefs } from 'vue'
import { useLang } from '../../lang/index.js'
import { useQuasar } from 'quasar'
import type { DaycareDate } from '@petboarding/api/zod'
import {
  DAYCARE_DATE_BUTTON_BG_CLASSES,
  DAYCARE_DATE_BUTTON_OUTLINE_CLASSES,
  useConfiguration
} from '../../configuration.js'

export interface QCalendarEvent {
  id: number
  title?: string
  details?: string
  petNames: string
  lastName?: string | null
  date: Timestamp | string
  bgcolor?: string
}
export interface Props {
  events?: QCalendarEvent[]
  selectedEvents?: number[]
  selectedDates?: string[]
  disabledWeekdays?: number[]
  disabledDates?: string[]
  focusable?: boolean
  hoverable?: boolean
  onOpenPets?: (payload: { ids: number[] }) => void
  maxNumberOfSelectedDates?: number
  currentDaycareDates?: DaycareDate[]
  allowPastDates?: boolean
}
const configuration = useConfiguration()
const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'click:event', value: QCalendarEvent): void
  (
    e: 'changeDate',
    {
      start,
      end,
      days
    }: {
      start: string
      end: string
      days: Timestamp[]
    }
  ): void
  (
    e: 'openPets',
    {
      ids
    }: {
      ids: number[]
    }
  ): void
}>()
const lang = useLang()
const $q = useQuasar()

const calendarRef = ref<QCalendarMonthInstance>()
const selectedDate = ref(today())
const {
  events,
  selectedDates,
  disabledWeekdays,
  maxNumberOfSelectedDates,
  currentDaycareDates,
  allowPastDates
} = toRefs(props)
const weekdays = ref(
  [1, 2, 3, 4, 5, 6, 0].filter((day) => !disabledWeekdays?.value?.includes(day))
)

const eventsMap = computed(() => {
  const map = {}
  if (events?.value && events?.value?.length > 0) {
    events.value.forEach((event) => {
      ;(map[event.date] = map[event.date] || []).push(event)
      if (event.days !== undefined) {
        let timestamp = parseTimestamp(event.date)
        let days = event.days
        // add a new event for each day
        // skip 1st one which would have been done above
        do {
          timestamp = addToDate(timestamp, { day: 1 })
          if (!map[timestamp.date]) {
            map[timestamp.date] = []
          }
          map[timestamp.date].push(event)
          // already accounted for 1st day
        } while (--days > 1)
      }
    })
  }
  return map
})

const onPrev = () => {
  calendarRef.value?.prev()
}
const onNext = () => {
  calendarRef.value?.next()
}
const onMoved = (data) => {}
const onChange = (data) => {
  emit('changeDate', data)
}

const onClickDate = ({ scope }) => {
  const date = scope.timestamp.date
  if (selectedDates?.value?.includes(date)) {
    // remove the date
    for (let i = 0; i < selectedDates.value.length; ++i) {
      if (date === selectedDates.value[i]) {
        selectedDates.value.splice(i, 1)
        break
      }
    }
    return
  }
  if (!selectedDates?.value) return
  if (
    scope.timestamp.disabled === true ||
    props.disabledDates?.includes(date) ||
    (maxNumberOfSelectedDates.value != null &&
      maxNumberOfSelectedDates.value <= selectedDates.value.length)
  ) {
    return
  }
  // Clicking a day from the previous or next month moves the calendar
  // there first, so adjacent days are a doorway instead of a dead end.
  if (scope.outside === true) {
    const diff = monthIndex(date) - monthIndex(selectedDate.value)
    if (diff > 0) calendarRef.value?.next()
    else if (diff < 0) calendarRef.value?.prev()
  }
  selectedDates.value.push(date)
}

const onClickWorkweek = (data) => {
  console.log('onClickWorkweek', data)
}
const onClickHeadDay = (data) => {
  console.log('onClickHeadDay', data)
}
const onClickHeadWorkweek = (data) => {
  console.log('onClickHeadWorkweek', data)
}

const disabledBefore = computed(() => {
  let ts = nowUTC()
  ts = addToDate(ts!, {
    day: allowPastDates.value ? -30 : 0,
    hour: Number(configuration.value.DAYCARE_CUTOFF_PERIOD_HOURS) ?? 0
  })
  return ts.date
})

const disabledAfter = computed(() => {
  let ts = parseTimestamp(today())
  ts = addToDate(ts!, { day: 366 })
  return ts.date
})

// const getMonthName = (date: string) =>
//   dateUtil.formatDate(new Date(date), 'MMMM')

const parseLocalDate = (value: string) => {
  const [year, month, day] = (value || '').slice(0, 10).split('-').map(Number)
  if (!year || !month || month < 1 || month > 12 || !day || day > 31) {
    return null
  }
  return new Date(year, month - 1, day)
}

const monthIndex = (value: string) => {
  const [year, month] = value.slice(0, 7).split('-').map(Number)
  return year * 12 + month
}

const adjacentMonth = (offset: number) => {
  const current = parseLocalDate(selectedDate.value)
  if (!current) return { label: '', aria: '' }
  const target = new Date(current.getFullYear(), current.getMonth() + offset, 1)
  return {
    label: dateUtil.formatDate(target, 'MMMM'),
    aria: dateUtil.formatDate(target, 'MMMM YYYY')
  }
}

const prevMonth = computed(() => adjacentMonth(-1))
const nextMonth = computed(() => adjacentMonth(1))

const getSelectedMonthName = () => {
  const current = parseLocalDate(selectedDate.value)
  if (!current) return ''
  return dateUtil.formatDate(current, 'MMMM YYYY')
}

const contentSize = ref({
  width: '100%',
  height: '200px'
})
const onResize: InstanceType<typeof QResizeObserver>['$props']['onResize'] = (
  size
) => {
  contentSize.value.width = '100%'
  contentSize.value.height = `${size.height}px`
}

// const getButtonColor = (date: string) => {
//   const existingDaycareDate = currentDaycareDates.value?.find(
//     (daycareDate) => daycareDate.date === date
//   )
//   if (existingDaycareDate?.status) {
//     return DAYCARE_DATE_COLORS[existingDaycareDate.status]
//   } else if (date === new Date().toISOString().slice(0, 10)) {
//     return DAYCARE_DATE_COLORS.default
//   }
// }

const getButtonBgClasses = (date: string) => {
  const existingDaycareDate = currentDaycareDates.value?.find(
    (daycareDate) => daycareDate.date === date
  )
  if (existingDaycareDate?.status) {
    return DAYCARE_DATE_BUTTON_BG_CLASSES[existingDaycareDate.status].reduce(
      (acc, cur) => {
        acc[cur] = true
        return acc
      },
      {} as Record<string, boolean>
    )
  }
}

const getButtonOutlineClasses = (date: string) => {
  if (date === new Date().toISOString().slice(0, 10)) {
    return DAYCARE_DATE_BUTTON_OUTLINE_CLASSES.default.reduce(
      (acc, cur) => {
        acc[cur] = true
        return acc
      },
      {} as Record<string, boolean>
    )
  }
}
</script>

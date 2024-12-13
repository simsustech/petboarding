<template>
  <div class="column col">
    <div class="row justify-center">
      <a>{{ `${lang.daycare.title} - ${getSelectedMonthName()}` }} </a>
    </div>
    <div class="row justify-center">
      <q-btn icon="arrow_left" @click="onPrev" />
      <q-btn icon="arrow_right" @click="onNext" />
    </div>
    <div class="row">
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
              :disabled="!selectedDates || scope.timestamp.disabled"
              class="q-mb-sm q-mt-sm"
              size="md"
              :outline="!getButtonColor(scope.timestamp.date)"
              rounded
              :label="scope.dayLabel"
              :color="getButtonColor(scope.timestamp.date)"
              @click="onClickDate({ scope })"
            >
              <q-tooltip v-if="$slots['head-day-button-tooltip']">
                <slot name="head-day-button-tooltip"></slot>
              </q-tooltip>
            </q-btn>
          </template>
          <template #day="{ scope: { timestamp } }">
            <div v-if="Object.keys(eventsMap).length" style="min-height: 30px">
              <!-- <slot name="dayHeader" :timestamp="timestamp" /> -->
              <template
                v-for="event in eventsMap[timestamp.date]"
                :key="event.id"
              >
                <div class="text-center">
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
import {
  QCalendarMonth,
  addToDate,
  parseTimestamp,
  today
} from '@quasar/quasar-ui-qcalendar'
import type { Timestamp } from '@quasar/quasar-ui-qcalendar'
import '@quasar/quasar-ui-qcalendar/src/QCalendarVariables.sass'
import '@quasar/quasar-ui-qcalendar/src/QCalendarTransitions.sass'
import '@quasar/quasar-ui-qcalendar/src/QCalendarMonth.sass'
import { QChip, QResizeObserver, date as dateUtil } from 'quasar'
import { computed, ref, toRefs } from 'vue'
import { useLang } from '../../lang/index.js'
import { useQuasar } from 'quasar'
import { DaycareDate } from '@petboarding/api/zod'
import { DAYCARE_DATE_COLORS } from 'src/configuration.js'

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
  focusable?: boolean
  hoverable?: boolean
  onOpenPets?: unknown
  maxNumberOfSelectedDates?: number
  currentDaycareDates?: DaycareDate[]
  allowPastDates?: boolean
}
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

const calendarRef = ref<QCalendarMonth>()
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
  } else {
    // add the date if not outside
    if (selectedDates?.value && scope.outside !== true) {
      if (
        maxNumberOfSelectedDates.value === void 0 ||
        maxNumberOfSelectedDates.value === 0 ||
        maxNumberOfSelectedDates.value > selectedDates.value.length
      )
        selectedDates.value.push(date)
    }
  }
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
  let ts = parseTimestamp(today())
  ts = addToDate(ts!, { day: allowPastDates.value ? -30 : -1 })
  return ts.date
})

const disabledAfter = computed(() => {
  let ts = parseTimestamp(today())
  ts = addToDate(ts!, { day: 366 })
  return ts.date
})

// const getMonthName = (date: string) =>
//   dateUtil.formatDate(new Date(date), 'MMMM')

const getSelectedMonthName = () =>
  dateUtil.formatDate(new Date(selectedDate.value), 'MMMM YYYY')

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

const getButtonColor = (date: string) => {
  const existingDaycareDate = currentDaycareDates.value?.find(
    (daycareDate) => daycareDate.date === date
  )
  if (existingDaycareDate?.status) {
    return DAYCARE_DATE_COLORS[existingDaycareDate.status]
  } else if (date === new Date().toISOString().slice(0, 10)) {
    return 'blue-3'
  }
}
</script>

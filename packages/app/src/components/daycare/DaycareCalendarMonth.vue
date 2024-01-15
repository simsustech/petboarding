<template>
  <div class="subcontent" style="width: 100%">
    <div class="row justify-center">
      <a>{{ `${lang.daycare.title} - ${getSelectedMonthName()}` }} </a>
    </div>
    <div class="row justify-center">
      <q-btn icon="arrow_left" @click="onPrev" />
      <q-btn icon="arrow_right" @click="onNext" />
    </div>
    <div class="row justify-center">
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
        @change="onChange"
        @moved="onMoved"
        @click-date="onClickDate"
        @click-workweek="onClickWorkweek"
        @click-head-workweek="onClickHeadWorkweek"
        @click-head-day="onClickHeadDay"
      >
        <template #head-day-button="{ scope }">
          <q-btn
            :disabled="!selectedDates"
            @click="onClickDate({ scope })"
            class="q-mb-sm q-mt-sm"
            size="md"
            outline
            rounded
            :label="scope.dayLabel"
          />
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
                  @click="emit('click:event', event)"
                >
                  {{ event.title }}
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
                            {{
                              `${
                                lang.daycare.messages.openPets
                              } ${lang.pet.title.toLowerCase()}`
                            }}
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
import { QChip, date as dateUtil } from 'quasar'
import { computed, ref, toRefs } from 'vue'
import { useLang } from '../../lang/index.js'

export interface QCalendarEvent {
  id: number
  title?: string
  details?: string
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

const calendarRef = ref<QCalendarMonth>()
const selectedDate = ref(today())
const { events, selectedDates, disabledWeekdays } = toRefs(props)
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
  ts = addToDate(ts!, { day: -1 })
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
</script>

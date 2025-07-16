<template>
  <div class="grid grid-cols-12 gap-3">
    <slot name="navigation" />
    <date-input
      v-model="selectedDate"
      class="col-span-12 md:col-span-7"
      hide-bottom-space
      :label="lang.kennellayout.labels.date"
      format="DD-MM-YYYY"
      clearable
      :date="{
        noUnset: true,
        firstDayOfWeek: '1'
      }"
      :icons="{
        event: 'i-mdi-event',
        clear: 'i-mdi-clear'
      }"
    >
    </date-input>

    <q-btn-toggle
      v-model="view"
      spread
      class="col-span-12 md:col-span-2"
      push
      toggle-color="primary"
      :options="[
        { label: lang.agenda.day, value: 'day' },
        { label: lang.agenda.week, value: 'week' }
      ]"
    />
  </div>
  <div class="row justify-center">
    <a class="col text-center">
      {{ getMonthYear(selectedDate) }}
    </a>
  </div>
  <agenda-legend />
  <pet-legend />
  <div class="row q-mb-md">
    <q-toggle v-model="showLastNames" :label="lang.customer.fields.lastName" />
  </div>
  <q-scroll-area :style="contentSize">
    <q-resize-observer @resize="onResize" />
    <q-calendar-agenda
      ref="calendar"
      v-model="date"
      :view="view"
      :weekdays="[1, 2, 3, 4, 5, 6, 0]"
      column-options-id="id"
      column-options-label="label"
      :day-min-height="200"
      :locale="$q.lang.isoName"
      :style="{
        height: '100%',
        'min-width': '600px'
      }"
      animated
      bordered
      @change="onChange"
    >
      <template #day="{ scope: { timestamp } }">
        <q-list>
          <q-item
            v-for="booking in getBookingDeparturesWithServices(timestamp.date)"
            :key="booking.id"
          >
            <q-item-section>
              <q-item-label
                v-for="service in booking.services"
                :key="service.id"
              >
                {{ service.service?.name }}
              </q-item-label>
              <q-item-label caption>
                {{ booking.pets?.map((pet) => pet.name).join(',') }}
              </q-item-label>
              <q-menu context-menu>
                <q-list>
                  <q-item clickable :to="`/employee/bookings/${booking.id}`">
                    <q-item-section>
                      <q-item-label>
                        {{ lang.open }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-item-section>
          </q-item>
        </q-list>
        <q-separator class="q-pt-none" inset />
        <a class="text-center text-subtitle-1"
          >{{ lang.booking.title }}
          {{ getNumberOfBookingPets(timestamp.date) }}</a
        >
        <q-separator class="q-pt-none q-mb-md" inset />
        <div
          v-for="booking in getBookingArrivals(timestamp.date)"
          :key="booking.id"
        >
          <agenda-chip
            :model-value="booking"
            :show-last-name="showLastNames"
            type="arrival"
            :selected-pets="selectedPets"
            @click="onClickPet"
            @open-booking="onOpenBooking"
            @open-pets="onOpenPets"
          >
            <q-tooltip>{{ formatBooking(booking) }}</q-tooltip>
          </agenda-chip>
        </div>
        <div
          v-for="booking in getBookingDepartures(timestamp.date)"
          :key="booking.id"
          class="justify-end text-right"
        >
          <agenda-chip
            :model-value="booking"
            :show-last-name="showLastNames"
            type="departure"
            :selected-pets="selectedPets"
            @click="onClickPet"
            @open-booking="onOpenBooking"
            @open-pets="onOpenPets"
          >
            <q-tooltip>{{ formatBooking(booking) }}</q-tooltip>
          </agenda-chip>
        </div>
        <div
          v-for="booking in getBookingStays(timestamp.date)"
          :key="booking.id"
          class="justify-center text-center"
        >
          <agenda-chip
            :model-value="booking"
            :show-last-name="showLastNames"
            type="stay"
            :selected-pets="selectedPets"
            @click="onClickPet"
            @open-booking="onOpenBooking"
            @open-pets="onOpenPets"
          >
            <q-tooltip>{{ formatBooking(booking) }}</q-tooltip>
          </agenda-chip>
        </div>

        <a class="text-center text-subtitle-1"
          >{{ lang.daycare.title }}
          {{ getNumberOfDaycarePets(timestamp.date) }}</a
        >
        <q-separator class="q-pt-none q-mb-md" inset />
        <div
          v-for="daycareDate in getDaycareDates(timestamp.date)"
          :key="daycareDate.id"
          class="text-center justify-center"
        >
          <agenda-chip
            :model-value="daycareDate"
            :show-last-name="showLastNames"
            type="daycare"
            @open-pets="onOpenPets"
          >
          </agenda-chip>
        </div>
      </template>
    </q-calendar-agenda>
  </q-scroll-area>
</template>

<script lang="ts">
export default {
  name: 'AgendaComponent'
}
</script>

<script setup lang="ts">
import { QCalendarAgenda } from '@quasar/quasar-ui-qcalendar/QCalendarAgenda'
import '@quasar/quasar-ui-qcalendar/src/QCalendarVariables.scss'
import '@quasar/quasar-ui-qcalendar/src/QCalendarTransitions.scss'
import '@quasar/quasar-ui-qcalendar/src/QCalendarAgenda.scss'

import AgendaChip from './AgendaChip.vue'
import { ref, toRefs, watch } from 'vue'
import { QResizeObserver, date as dateUtil, useQuasar } from 'quasar'
import { Booking, DaycareDate, OpeningTime } from '@petboarding/api/zod'
import { useLang } from '../lang/index.js'
import { useRoute, useRouter } from 'vue-router'
import { formatBookingDates } from './booking/BookingItemContent.vue'
import type { Timestamp } from '@quasar/quasar-ui-qcalendar'
import AgendaLegend from './agenda/AgendaLegend.vue'
import PetLegend from './pet/PetLegend.vue'
import { DateInput } from '@simsustech/quasar-components/form'
export interface Props {
  bookings?: Booking[]
  daycareDates?: DaycareDate[]
  openingTimes?: OpeningTime[]
  selectedPets?: number[]
}
const props = defineProps<Props>()
const { bookings, daycareDates, selectedPets } = toRefs(props)
const $q = useQuasar()

const emit = defineEmits<{
  (
    e: 'clickPet',
    {
      data,
      done
    }: {
      data: number
      done: () => void
    }
  ): void
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
}>()

const route = useRoute()
const router = useRouter()
const lang = useLang()

const selectedDate = ref(
  !Array.isArray(route.params.date)
    ? route.params.date
    : new Date().toISOString().slice(0, 10)
)
const date = ref(selectedDate.value)
watch(selectedDate, (val) => {
  if (dateUtil.isValid(val)) {
    date.value = val
  }
})

const setDate = (newDate: string) => {
  if (dateUtil.isValid(newDate)) {
    selectedDate.value = newDate
  }
}

const view = ref('week')

const getBookingDeparturesWithServices = (date: string) =>
  bookings?.value?.filter(
    (booking) => booking.endDate === date && booking.services?.length
  )

const getBookingArrivals = (date: string) =>
  bookings?.value?.filter((booking) => booking.startDate === date)

const getBookingDepartures = (date: string) =>
  bookings?.value
    ? [...bookings.value]
        ?.sort((booking) => (booking.services?.length ? -1 : 1))
        .filter((booking) => booking.endDate === date)
    : []

const getBookingStays = (date: string) =>
  bookings?.value?.filter(
    (booking) => booking.startDate < date && booking.endDate > date
  )

const getDaycareDates = (date: string) =>
  daycareDates?.value?.filter((daycareDate) => daycareDate.date === date)

const getNumberOfBookingPets = (date: string) =>
  bookings?.value
    ?.filter((booking) => booking.startDate <= date && booking.endDate >= date)
    .reduce((acc, cur) => {
      if (cur.pets?.length) acc = acc + cur.pets?.length
      return acc
    }, 0)

const getNumberOfDaycarePets = (date: string) =>
  daycareDates?.value
    ?.filter((daycareDate) => daycareDate.date === date)
    .reduce((acc, cur) => {
      if (cur.pets?.length) acc = acc + cur.pets?.length
      return acc
    }, 0)

const formatBooking = (booking: Booking) =>
  formatBookingDates({
    startDate: booking.startDate,
    startTime: booking.startTime!.name,
    endDate: booking.endDate,
    endTime: booking.endTime!.name,
    lang: lang.value,
    locale: $q.lang.isoName
  })

const onClickPet: InstanceType<typeof AgendaChip>['$props']['onClick'] = ({
  data,
  done
}) => {
  emit('clickPet', { data, done })
}

const onOpenBooking: InstanceType<
  typeof AgendaChip
>['$props']['onOpenBooking'] = (id) => router.push(`/employee/bookings/${id}`)

const onOpenPets: InstanceType<typeof AgendaChip>['$props']['onOpenPets'] = (
  petIds
) => router.push(`/employee/pets/${petIds.join('/')}`)

const onChange = (data) => {
  emit('changeDate', {
    date: date.value,
    ...data
  })
}

const getMonthYear = (date: string) => dateUtil.formatDate(date, 'MMMM YYYY')

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

const showLastNames = ref(false)

defineExpose({
  setDate
})
</script>

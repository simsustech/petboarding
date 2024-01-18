<template>
  <div class="row justify-center">
    <slot name="navigation" />
    <q-input
      v-model="selectedDate"
      class="q-pb-none"
      filled
      mask="date"
      :rules="['date']"
    >
      <template #append>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-date v-model="selectedDate" first-day-of-week="1">
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Close" color="primary" flat />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>

    <q-btn-toggle
      v-model="view"
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
  <div class="row">
    <div class="col-12 col-sm">
      <q-badge
        rounded
        text-color="black"
        :color="BOOKING_SERVICE_COLORS.appointment"
      ></q-badge
      ><a>{{ lang.service.type.appointment }}</a>
      <q-badge class="q-ml-lg" rounded text-color="black" color="red"></q-badge
      ><a>{{ lang.pet.vaccination.missingVaccinations }}</a>
    </div>
  </div>
  <q-scroll-area style="width: 100%; height: 100vh">
    <div
      class="row justify-center"
      :style="{
        'min-width': view === 'day' ? '300px' : '700px'
      }"
    >
      <q-calendar-agenda
        ref="calendar"
        v-model="date"
        :view="view"
        :weekdays="[1, 2, 3, 4, 5, 6, 0]"
        column-options-id="id"
        column-options-label="label"
        :day-min-height="200"
        :locale="$q.lang.isoName"
        animated
        bordered
        @change="onChange"
      >
        <template #day="{ scope: { timestamp } }">
          <q-list>
            <q-item
              v-for="booking in getBookingDeparturesWithServices(
                timestamp.date
              )"
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
          <q-separator class="q-pt-none" inset />
          <div
            v-for="booking in getBookingArrivals(timestamp.date)"
            :key="booking.id"
            class="row"
          >
            <agenda-chip
              :model-value="booking"
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
            class="row justify-end text-right"
          >
            <agenda-chip
              :model-value="booking"
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
            class="row justify-center text-center"
          >
            <agenda-chip
              :model-value="booking"
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
          <q-separator class="q-pt-none" inset />
          <div
            v-for="daycareDate in getDaycareDates(timestamp.date)"
            :key="daycareDate.id"
            class="row text-center justify-center"
          >
            <agenda-chip :model-value="daycareDate" type="daycare">
            </agenda-chip>
          </div>
        </template>
      </q-calendar-agenda>
    </div>
  </q-scroll-area>
</template>

<script lang="ts">
export default {
  name: 'AgendaComponent'
}
</script>

<script setup lang="ts">
import {
  QCalendarAgenda,
  today,
  validateTimestamp
} from '@quasar/quasar-ui-qcalendar'
import '@quasar/quasar-ui-qcalendar/src/QCalendarVariables.sass'
import '@quasar/quasar-ui-qcalendar/src/QCalendarTransitions.sass'
import '@quasar/quasar-ui-qcalendar/src/QCalendarAgenda.sass'

import AgendaChip from './AgendaChip.vue'
import { onMounted, ref, toRefs, watch } from 'vue'
import { date as dateUtil } from 'quasar'
import { Booking, DaycareDate, OpeningTime } from '@petboarding/api/zod'
import { useLang } from '../lang/index.js'
import { useRoute, useRouter } from 'vue-router'
import { BOOKING_SERVICE_COLORS } from '../configuration.js'
import type { Timestamp } from '@quasar/quasar-ui-qcalendar'
export interface Props {
  bookings?: Booking[]
  daycareDates?: DaycareDate[]
  openingTimes?: OpeningTime[]
  selectedPets?: number[]
}
const props = defineProps<Props>()
const { bookings, daycareDates, selectedPets } = toRefs(props)

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

const selectedDate = ref(today())
const date = ref(selectedDate.value.replaceAll('/', '-'))
watch(selectedDate, (val) => {
  if (dateUtil.isValid(val)) {
    date.value = val.replaceAll('/', '-')
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
  `${dateUtil.formatDate(new Date(booking.startDate), 'D MMMM YYYY')} ${booking
    .startTime?.name} ${lang.value.booking.until} ${dateUtil.formatDate(
    new Date(booking.endDate),
    'D MMMM YYYY'
  )} ${booking.endTime?.name}`

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

defineExpose({
  setDate
})
onMounted(() => {
  if (typeof route.params.date === 'string') {
    if (validateTimestamp(route.params.date)) {
      selectedDate.value = route.params.date.replace('-', '/')
    }
  }
})
</script>

<template>
  <q-page padding class="q-gutter-md">
    <q-toolbar>
      <q-input
        ref="dateInputRef"
        :model-value="selectedDate"
        class="q-mr-md"
        filled
        mask="date"
        :rules="['date']"
        @update:model-value="setDate"
      >
        <template #append>
          <q-icon name="i-mdi-event" class="cursor-pointer">
            <q-popup-proxy
              cover
              transition-show="scale"
              transition-hide="scale"
            >
              <q-date
                :model-value="selectedDate"
                first-day-of-week="1"
                @update:model-value="setDate"
              >
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
      <q-btn-dropdown icon="i-mdi-printer">
        <q-list>
          <q-item clickable @click="printPage">
            <q-item-section>
              <q-item-label> {{ lang.page }} </q-item-label>
            </q-item-section>
          </q-item>
          <q-item
            :to="`/print/bookings/${(arrivalsData || [])
              .map((booking) => booking.id)
              .join('/')}`"
          >
            <q-item-section>
              <q-item-label>
                {{ lang.booking.title }}
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item
            :to="`/print/pets/${(arrivalsData || [])
              .map((booking) => booking.pets.map((pet) => pet.id).join('/'))
              .join('/')}`"
          >
            <q-item-section>
              <q-item-label>
                {{ lang.pet.title }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </q-toolbar>

    <div id="print-area">
      <div class="grid grid-cols-24 gap-3">
        <q-card class="col-span-24 sm:col-span-12">
          <q-card-section class="text-h6">
            {{ lang.booking.arrivals }}
          </q-card-section>
          <q-list>
            <div
              v-for="openingTime in sortedOpeningTimes"
              :key="openingTime.id"
            >
              <q-item-label header>
                {{ openingTime.name }}
              </q-item-label>
              <booking-item
                v-for="booking in (arrivalsData || []).filter(
                  (booking) => booking.startTimeId === openingTime.id
                )"
                :key="booking.id"
                :model-value="booking"
                @open-customer="
                  ({ id }) => router.push(`/employee/customers/${id}`)
                "
                @open-booking="
                  ({ id }) => router.push(`/employee/bookings/${id}`)
                "
                @open-pets="
                  ({ ids }) => router.push(`/employee/pets/${ids.join('/')}`)
                "
              ></booking-item>
            </div>
          </q-list>
        </q-card>

        <q-card class="col-span-24 sm:col-span-12">
          <q-card-section class="text-h6">
            {{ lang.booking.departures }}
          </q-card-section>
          <q-list>
            <div
              v-for="openingTime in sortedOpeningTimes"
              :key="openingTime.id"
            >
              <q-item-label header>
                {{ openingTime.name }}
              </q-item-label>
              <booking-item
                v-for="booking in (departuresData || []).filter(
                  (booking) => booking.endTimeId === openingTime.id
                )"
                :key="booking.id"
                :model-value="booking"
                @open-booking="
                  ({ id }) => router.push(`/employee/bookings/${id}`)
                "
                @open-pets="
                  ({ ids }) => router.push(`/employee/pets/${ids.join('/')}`)
                "
              ></booking-item>
            </div>
          </q-list>
        </q-card>

        <q-card class="col-span-24 sm:col-span-12">
          <q-card-section class="text-h6">
            {{ lang.daycare.title }}
          </q-card-section>
          <q-list>
            <q-item
              v-for="daycareDate in daycareDatesData"
              :key="daycareDate.id"
            >
              <q-item-section avatar>
                <q-icon
                  v-if="
                    daycareDate.customerDaycareSubscription?.status ===
                    CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS.PAID
                  "
                  name="i-mdi-paid"
                  color="green"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>
                  {{ getPetsFromDaycareDate(daycareDate.pets) }}
                </q-item-label>
                <q-item-label caption>
                  {{ daycareDate.customer.lastName }}
                </q-item-label>
              </q-item-section>
              <q-menu context-menu>
                <q-list dense>
                  <q-item
                    clickable
                    :to="`/employee/pets/${daycareDate.pets
                      .map((pet) => pet.id)
                      .join('/')}`"
                  >
                    <q-item-section>
                      <q-item-label>{{
                        lang.booking.messages.openPets
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
export default {
  name: 'EmployeeOverviewPage'
}
</script>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { createUseTrpc } from '../../trpc.js'
import { QInput, date as dateUtil } from 'quasar'
import BookingItem from '../../components/booking/BookingItem.vue'
import {
  BOOKING_STATUS,
  CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS,
  DAYCARE_DATE_STATUS,
  Pet
} from '@petboarding/api/zod'
import { useRouter, useRoute, onBeforeRouteUpdate } from 'vue-router'
import { useLang } from '../../lang/index.js'

const lang = useLang()
const { useQuery } = await createUseTrpc()
const router = useRouter()
const route = useRoute()
const selectedDate = ref(
  !Array.isArray(route.params.date)
    ? route.params.date.replaceAll('-', '/')
    : dateUtil.formatDate(new Date(), 'YYYY/MM/DD')
)

onBeforeRouteUpdate((to) => {
  if (to.params.date && !Array.isArray(to.params.date)) {
    selectedDate.value = to.params.date.replaceAll('-', '/')
  }
})
const parsedDate = computed(() => selectedDate.value.replaceAll('/', '-'))
const dateInputRef = ref<QInput>()
const dateError = computed(() => dateInputRef.value?.hasError)

watch(selectedDate, async () => {
  await dateInputRef.value?.validate()
  if (!dateError.value) {
    executeGetArrivals()
    executeGetDepartures()
    executeDaycareDates()
  }
})

const { data: arrivalsData, execute: executeGetArrivals } = useQuery(
  'employee.getBookings',
  {
    args: () =>
      reactive({
        from: parsedDate.value,
        until: parsedDate.value,
        startDate: parsedDate.value,
        statuses: [BOOKING_STATUS.APPROVED, BOOKING_STATUS.AWAITING_DOWNPAYMENT]
      })
  }
)

const { data: departuresData, execute: executeGetDepartures } = useQuery(
  'employee.getBookings',
  {
    args: () =>
      reactive({
        from: parsedDate.value,
        until: parsedDate.value,
        endDate: parsedDate.value,
        statuses: [BOOKING_STATUS.APPROVED, BOOKING_STATUS.AWAITING_DOWNPAYMENT]
      })
  }
)

const { data: daycareDatesData, execute: executeDaycareDates } = useQuery(
  'employee.getDaycareDates',
  {
    args: () =>
      reactive({
        from: parsedDate.value,
        until: parsedDate.value,
        status: DAYCARE_DATE_STATUS.APPROVED
      })
  }
)

const { data: openingTimesData, execute: executeOpeningTimes } = useQuery(
  'public.getOpeningTimes'
)

const sortedOpeningTimes = computed(() => {
  if (openingTimesData.value) {
    return [...openingTimesData.value].sort((a, b) =>
      a.startTime > b.startTime ? 1 : -1
    )
  }
  return []
})

const getPetsFromDaycareDate = (pets: Pet[]) =>
  pets.map((pet) => pet.name).join(', ')

const setDate = (date: string) => {
  if (date)
    router.push({
      path: `/employee/overview/${date.replaceAll('/', '-')}`
    })
}

const printPage = async () => {
  router.push(`/print/overview/${parsedDate.value}`)
}

onMounted(async () => {
  await executeOpeningTimes()
  await dateInputRef.value?.validate()
  if (!dateError.value) {
    // executeGetBookings()
    executeGetArrivals()
    executeGetDepartures()
    // executeAwaitingDownPaymentBookings()
    executeDaycareDates()
  }
})
</script>

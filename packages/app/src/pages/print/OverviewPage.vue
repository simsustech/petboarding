<template>
  <div class="p-1em print:p-0">
    <div class="grid grid-cols-24 gap-3">
      <q-card class="col-span-24 sm:col-span-12">
        <q-card-section class="text-h6">
          {{ lang.booking.arrivals }}
        </q-card-section>
        <q-list>
          <div v-for="openingTime in sortedOpeningTimes" :key="openingTime.id">
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
          <div v-for="openingTime in sortedOpeningTimes" :key="openingTime.id">
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
          <q-item v-for="daycareDate in daycareDatesData" :key="daycareDate.id">
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

<style>
@media print {
  @page {
    size: auto;
    margin: 15mm;
  }
  .q-page {
    padding: 0;
  }
}
.q-card {
  --at-apply: bg-transparent outline-solid outline-black outline-1px;
}
</style>

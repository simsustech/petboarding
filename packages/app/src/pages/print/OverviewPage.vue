<template>
  <div class="p-1em print:p-0">
    <div class="row justify-center text-h6">
      {{ formatDate(selectedDate, { dateStyle: 'medium' }) }}
    </div>
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
                name="i-mdi-dollar"
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
import { computed, onMounted } from 'vue'
import BookingItem from '../../components/booking/BookingItem.vue'
import { CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS, Pet } from '@petboarding/api/zod'
import { useRouter, onBeforeRouteUpdate, useRoute } from 'vue-router'
import { useLang } from '../../lang/index.js'
import { formatDate } from '../../tools.js'
import { useEmployeeGetOverviewQuery } from 'src/queries/employee/overview.js'
import { usePublicGetOpeningTimesQuery } from 'src/queries/public.js'
import { date as dateUtil } from 'quasar'
const lang = useLang()
const router = useRouter()
const route = useRoute()

const { openingTimes: openingTimesData, refetch: executeOpeningTimes } =
  usePublicGetOpeningTimesQuery()
const {
  arrivals: arrivalsData,
  departures: departuresData,
  daycareDates: daycareDatesData,
  refetch,
  selectedDate
} = useEmployeeGetOverviewQuery()

onBeforeRouteUpdate((to) => {
  if (to.params.date && !Array.isArray(to.params.date)) {
    selectedDate.value = to.params.date.replaceAll('-', '/')
  }
})
selectedDate.value = !Array.isArray(route.params.date)
  ? (route.params.date as string)
  : dateUtil.formatDate(new Date(), 'YYYY-MM-DD')
// const parsedDate = computed(() => selectedDate.value.replaceAll('/', '-'))
// const dateInputRef = ref<QInput>()
// const dateError = computed(() => dateInputRef.value?.hasError)

// watch(selectedDate, async () => {
//   await dateInputRef.value?.validate()
//   if (!dateError.value) {
//     await refetch()
//   }
// })

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
  // await dateInputRef.value?.validate()
  // if (!dateError.value) {
  await refetch()
  // }
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

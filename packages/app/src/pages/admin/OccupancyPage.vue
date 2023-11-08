<template>
  <q-input
    :model-value="parsedDate"
    class="q-pb-none"
    filled
    mask="date"
    :rules="['date']"
    @update:model-value="updateDate"
  >
    <template #append>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-date
            :model-value="parsedDate"
            @update:model-value="updateDate"
            first-day-of-week="1"
          >
            <div class="row items-center justify-end">
              <q-btn v-close-popup label="Close" color="primary" flat />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>

  <div class="column items-center">
    <a class="col">
      {{ getMonthYear(selectedDate) }}
    </a>
  </div>
  <q-calendar-month
    v-if="data && daycareOccupancy"
    ref="calendar"
    :model-value="selectedDate"
    animated
    bordered
    focusable
    hoverable
    no-active-date
    :weekdays="[1, 2, 3, 4, 5, 6, 0]"
    :day-min-height="60"
    :day-height="0"
  >
    <template #day="{ scope: { timestamp } }">
      <div
        v-if="data && daycareOccupancy"
        :class="{
          column: true,
          'items-center': true,
          'text-bold': true,
          ...getClasses(data[timestamp.date] + daycareOccupancy[timestamp.date])
        }"
      >
        <div>
          <a>
            {{ data[timestamp.date] || 0 }}
            <q-tooltip>
              {{ lang.booking.title }}
            </q-tooltip>
          </a>
          +
          <a>
            {{ daycareOccupancy[timestamp.date] || 0 }}
            <q-tooltip>
              {{ lang.daycare.title }}
            </q-tooltip>
          </a>
        </div>

        <q-menu context-menu>
          <q-list>
            <q-item clickable :to="`/employee/agenda/${timestamp.date}`">
              <q-item-section>
                <q-item-label>
                  {{ lang.open }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </div>
    </template>
  </q-calendar-month>
</template>

<script lang="ts">
export default {
  name: 'AdminOccupancyPage'
}
</script>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useLang } from '../../lang/index.js'
import { createUseTrpc } from '../../trpc.js'
import { QCalendarMonth, today } from '@quasar/quasar-ui-qcalendar'
import '@quasar/quasar-ui-qcalendar/src/QCalendarVariables.sass'
import '@quasar/quasar-ui-qcalendar/src/QCalendarTransitions.sass'
import '@quasar/quasar-ui-qcalendar/src/QCalendarMonth.sass'
import { onBeforeRouteUpdate, useRouter } from 'vue-router'
import { BOOKING_STATUS } from '@petboarding/api/zod'
import { useRoute } from 'vue-router'
import { date as dateUtil } from 'quasar'

const MAX_OCCUPANCY = Number(import.meta.env.MAX_OCCUPANCY) || 50

const route = useRoute()
const { useQuery } = await createUseTrpc()
const router = useRouter()

const selectedDate = ref(
  !Array.isArray(route.params.date) ? route.params.date : null || today()
)

const parsedDate = computed(() => selectedDate.value.replaceAll('-', '/'))
onBeforeRouteUpdate((to) => {
  if (to.params.date && !Array.isArray(to.params.date)) {
    selectedDate.value = to.params.date
  }
})

const updateDate = (val: string | number | null) => {
  if (typeof val === 'string') {
    router.push({ path: '/admin/occupancy/' + val.replaceAll('/', '-') })
  }
}

const { data, execute } = useQuery('admin.getBookingOccupancy', {
  args: reactive({
    date: selectedDate,
    status: BOOKING_STATUS.APPROVED
  })
})

const { data: daycareOccupancy, execute: executeDaycareOccupancy } = useQuery(
  'admin.getDaycareOccupancy',
  {
    args: reactive({
      date: selectedDate,
      status: BOOKING_STATUS.APPROVED
    })
  }
)

const lang = useLang()

const getClasses = (occupancy: number) => {
  const percentage = Math.floor((occupancy / MAX_OCCUPANCY) * 100)

  if (percentage > 80) return { 'bg-red-4': true }
  if (percentage > 60) return { 'bg-orange-4': true }
  if (percentage > 40) return { 'bg-yellow-4': true }
}

const getMonthYear = (date: string) => dateUtil.formatDate(date, 'MMMM YYYY')

onMounted(async () => {
  await execute()
  await executeDaycareOccupancy()
})
</script>

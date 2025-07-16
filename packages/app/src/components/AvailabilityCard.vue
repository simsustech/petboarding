<template>
  <q-card>
    <q-card-section>
      <div class="row justify-center items-center">
        {{ lang.availability.title }}
        <q-btn icon="i-mdi-info" flat color="primary" @click="openDialog" />
      </div>
      <div class="row justify-center items-center">
        <q-btn-toggle v-model="toggle" :options="buttonOptions" />
      </div>

      <div class="row justify-center items-center">
        <date-picker
          v-model="dateRange"
          class="col-12 q-mt-md"
          :periods="unavailablePeriods"
          :range="toggle === 'boarding'"
          :options="options"
          first-day-of-week="1"
        />
      </div>
    </q-card-section>
    <q-card-section>
      {{ lang.availability.messages.doesNotApplyToApprovedBookings }}
      <br />
      <router-link to="/account/bookings">{{
        lang.availability.messages.addBooking
      }}</router-link>
    </q-card-section>
  </q-card>
  <responsive-dialog
    ref="dialogRef"
    padding
    :icons="{ close: 'i-mdi-close' }"
    display
  >
    <a>
      {{ lang.availability.messages.doesNotApplyToApprovedBookings }}
    </a>
    <periods-list v-if="periods" :model-value="periods" bordered />
  </responsive-dialog>
</template>

<script lang="ts">
export default {
  name: 'AvailabilityCard'
}
</script>

<script setup lang="ts">
import { Period } from '@petboarding/api/zod'
import { watch, computed, ref, toRefs } from 'vue'
import { ResponsiveDialog } from '@simsustech/quasar-components'
import { DatePicker } from '@simsustech/quasar-components/form'
import { useLang } from '../lang/index.js'
import { useConfiguration } from '../configuration.js'
import { date as dateUtil } from 'quasar'
import { PERIOD_TYPE } from '@petboarding/api/zod'

const props = defineProps<{
  periods: Period[]
  allowPastDates?: boolean
}>()

const lang = useLang()
const configuration = useConfiguration()
const { periods, allowPastDates } = toRefs(props)

const toggle = ref<'boarding' | 'daycare'>('boarding')
const buttonOptions = computed(() => [
  {
    label: lang.value.boarding.substring(0, 12),
    value: 'boarding'
  },
  {
    label: lang.value.daycare.title.substring(0, 12),
    value: 'daycare'
  }
])

const dialogRef = ref<typeof ResponsiveDialog>()
const openDialog = () => {
  dialogRef.value?.functions.open()
}

const dateRange = ref({
  from: '',
  to: ''
})
watch(toggle, (val) => {
  if (val) dateRange.value = { from: '', to: '' }
})
const unavailablePeriods = computed(() => {
  const periodTypes = [PERIOD_TYPE.UNAVAILABLE_FOR_ALL]
  if (toggle.value === 'boarding')
    periodTypes.push(PERIOD_TYPE.UNAVAILABLE_FOR_BOOKINGS)
  else periodTypes.push(PERIOD_TYPE.UNAVAILABLE_FOR_DAYCARE)
  return periods.value
    ?.filter((period) => periodTypes.includes(period.type))
    .map((period) => ({
      startDate: period.startDate,
      endDate: period.endDate,
      type: 'unavailable' as const
    }))
})

const options = (date: string) => {
  if (
    toggle.value === 'daycare' &&
    configuration.value.DAYCARE_DISABLED_WEEKDAYS?.includes(
      Number(dateUtil.formatDate(dateUtil.extractDate(date, 'YYYY/MM/DD'), 'd'))
    )
  ) {
    return false
  }
  return (
    date >
      dateUtil.formatDate(
        dateUtil.subtractFromDate(new Date(), {
          days: allowPastDates?.value ? 14 : 2
        }),
        'YYYY/MM/DD'
      ) &&
    date <
      dateUtil.formatDate(
        dateUtil.addToDate(new Date(), { days: 366 }),
        'YYYY/MM/DD'
      )
  )
}
</script>

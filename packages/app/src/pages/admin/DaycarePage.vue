<template>
  <div class="row justify-center">
    <daycare-status-select v-model="status" />
  </div>
  <daycare-legend />
  <q-toggle v-model="showLastNames" :label="lang.customer.fields.lastName" />
  <daycare-calendar-month
    :events="events"
    :selected-events="selectedEvents"
    @click:event="onClickEvent"
    @change-date="onChangeDate"
    @open-pets="openPets"
  >
    <template #dayFooter="{ timestamp }">
      <div
        v-if="status === DAYCARE_DATE_STATUS.APPROVED"
        class="text-bold text-center"
      >
        {{ numberOfPets[timestamp.date] }}
      </div>
    </template>
  </daycare-calendar-month>
  <div v-if="selectedEvents.length" class="row justify-center">
    <q-btn
      :label="lang.daycare.replies.approve"
      color="green"
      @click="approveDaycareDates"
    />
    <q-btn
      :label="lang.daycare.replies.reject"
      color="red"
      @click="rejectDaycareDates"
    />
    <q-btn
      :label="lang.daycare.replies.standby"
      color="yellow"
      text-color="black"
      @click="standbyDaycareDates"
    />
  </div>
</template>

<script lang="ts">
export default {
  name: 'AdminDaycarePage'
}
</script>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useLang } from '../../lang/index.js'
import { createUseTrpc } from '../../trpc.js'
import DaycareCalendarMonth from '../../components/daycare/DaycareCalendarMonth.vue'
import { DAYCARE_DATE_COLORS, DAYCARE_DATE_ICONS } from '../../configuration.js'
import DaycareStatusSelect from '../../components/daycare/DaycareStatusSelect.vue'
import type { QCalendarEvent } from '../../components/daycare/DaycareCalendarMonth.vue'
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import DaycareLegend from '../../components/daycare/DaycareLegend.vue'
import { Customer, DAYCARE_DATE_STATUS } from '@petboarding/api/zod'
const { useQuery, useMutation } = await createUseTrpc()
const router = useRouter()

const status = ref('pending')
const startDate = ref('')
const endDate = ref('')
const onChangeDate: InstanceType<
  typeof DaycareCalendarMonth
>['$props']['onChangeDate'] = (data) => {
  startDate.value = data.start
  endDate.value = data.end
}

const { data, execute } = useQuery('admin.getDaycareDates', {
  args: reactive({
    from: startDate,
    until: endDate,
    status
  })
})

const $q = useQuasar()
const lang = useLang()

const showLastNames = ref(false)
const getLastName = (customer: Customer) => {
  if (customer?.lastName) {
    const lastName = customer.lastName.substring(0, 8)
    if (customer.lastName.length > 8) return lastName + '...'
    return lastName
  }
}

const events = computed(() =>
  data.value?.map((daycareDate) => ({
    id: daycareDate.id,
    bgcolor: DAYCARE_DATE_COLORS[daycareDate.status],
    title: daycareDate.pets.map((pet) => pet.name).join('<br />'),
    petNames: daycareDate.pets.map((pet) => pet.name),
    lastName: showLastNames.value ? getLastName(daycareDate.customer) : null,
    petIds: daycareDate.pets.map((pet) => pet.id),
    date: daycareDate.date,
    details: daycareDate.customer.lastName,
    // details: lang.value.daycare.status[daycareDate.status],
    icon: DAYCARE_DATE_ICONS[daycareDate.status]
  }))
)
const selectedEvents = ref<number[]>([])
const onClickEvent = (event: QCalendarEvent) => {
  if (selectedEvents.value.includes(event.id)) {
    const index = selectedEvents.value.findIndex((id) => id === event.id)
    if (index !== -1) selectedEvents.value.splice(index, 1)
  } else {
    selectedEvents.value.push(event.id)
  }
}

const numberOfPets = computed(() => {
  return (
    data.value?.reduce(
      (acc, cur) => {
        acc[cur.date] = acc[cur.date]
          ? acc[cur.date] + cur.pets.length
          : cur.pets.length
        return acc
      },
      {} as Record<string, number>
    ) || {}
  )
})

const dateFormatter = (date: Date, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    dateStyle: 'long',
    timeZone: 'UTC'
  }).format(date)

const approveDaycareDates = async () => {
  $q.dialog({
    html: true,
    message: `${
      lang.value.daycare.messages.verifyApproval
    } <br /> <b>${events.value
      ?.filter((ev) => selectedEvents.value.includes(ev.id))
      .map((event) => {
        return `${event.title} ${dateFormatter(
          new Date(event.date),
          $q.lang.isoName
        )}`
      })
      .join('<br />')}</b>`
  }).onOk(async () => {
    const { immediatePromise } = useMutation('admin.approveDaycareDateIds', {
      args: selectedEvents.value,
      immediate: true
    })
    await immediatePromise
    await execute()
    selectedEvents.value = []
  })
}

const rejectDaycareDates = async () => {
  $q.dialog({
    html: true,
    message: `${
      lang.value.daycare.messages.verifyRejection
    } <br /> <b>${events.value
      ?.filter((ev) => selectedEvents.value.includes(ev.id))
      .map((event) => {
        return `${event.title} ${dateFormatter(
          new Date(event.date),
          $q.lang.isoName
        )}`
      })
      .join('<br />')}</b>`
  }).onOk(async () => {
    const { immediatePromise } = useMutation('admin.rejectDaycareDateIds', {
      args: selectedEvents.value,
      immediate: true
    })
    await immediatePromise
    await execute()
    selectedEvents.value = []
  })
}

const standbyDaycareDates = async () => {
  $q.dialog({
    html: true,
    message: `${
      lang.value.daycare.messages.verifyStandby
    } <br /> <b>${events.value
      ?.filter((ev) => selectedEvents.value.includes(ev.id))
      .map((event) => {
        return `${event.title} ${dateFormatter(
          new Date(event.date),
          $q.lang.isoName
        )}`
      })
      .join('<br />')}</b>`
  }).onOk(async () => {
    const { immediatePromise } = useMutation('admin.standbyDaycareDateIds', {
      args: selectedEvents.value,
      immediate: true
    })
    await immediatePromise
    await execute()
    selectedEvents.value = []
  })
}

const openPets: InstanceType<
  typeof DaycareCalendarMonth
>['$props']['onOpenPets'] = ({ ids }) =>
  router.push(`/employee/pets/${ids.join('/')}`)

onMounted(async () => {
  // await execute()
})
</script>

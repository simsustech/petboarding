<template>
  <q-page padding>
    <q-toolbar>
      <daycare-status-select v-model="status" />
    </q-toolbar>
    <daycare-legend />
    <q-toggle v-model="showLastNames" :label="lang.customer.fields.lastName" />
    <daycare-calendar-month
      :events="events"
      :selected-events="selectedEventIds"
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
    <div v-if="selectedEventIds.length" class="row justify-center q-ma-lg">
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
  </q-page>
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
import DaycareCalendarMonth from '../../components/daycare/DaycareCalendarMonth.vue'
import { DAYCARE_DATE_COLORS, DAYCARE_DATE_ICONS } from '../../configuration.js'
import DaycareStatusSelect from '../../components/daycare/DaycareStatusSelect.vue'
import type { QCalendarEvent } from '../../components/daycare/DaycareCalendarMonth.vue'
import { useRouter } from 'vue-router'
import DaycareLegend from '../../components/daycare/DaycareLegend.vue'
import { Customer, DAYCARE_DATE_STATUS } from '@petboarding/api/zod'
import {
  useAdminGetDaycareDatesByIdQuery,
  useAdminGetDaycareDatesQuery
} from 'src/queries/admin/daycare.js'
import {
  useAdminApproveDaycareDateMutation,
  useAdminRejectDaycareDateMutation,
  useAdminStandbyDaycareDateMutation
} from 'src/mutations/admin/daycare.js'

const router = useRouter()

const onChangeDate: InstanceType<
  typeof DaycareCalendarMonth
>['$props']['onChangeDate'] = (data) => {
  from.value = data.start
  until.value = data.end
}

const {
  daycareDates: data,
  refetch: execute,
  from,
  until,
  daycareDateStatus: status
} = useAdminGetDaycareDatesQuery()

const { daycareDates: selectedEventsData, ids: selectedEventIds } =
  useAdminGetDaycareDatesByIdQuery()

const { mutateAsync: approveDaycareDatesMutation } =
  useAdminApproveDaycareDateMutation()
const { mutateAsync: rejectDaycareDatesMutation } =
  useAdminRejectDaycareDateMutation()
const { mutateAsync: standbyDaycareDatesMutation } =
  useAdminStandbyDaycareDateMutation()

const $q = useQuasar()
const lang = useLang()

const showLastNames = ref(false)
const getLastName = (customer: Customer | null) => {
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
    details: daycareDate.customer?.lastName,
    // details: lang.value.daycare.status[daycareDate.status],
    icon: DAYCARE_DATE_ICONS[daycareDate.status]
  }))
)

const selectedEvents = computed(() =>
  selectedEventsData.value?.map((daycareDate) => ({
    id: daycareDate.id,
    bgcolor: DAYCARE_DATE_COLORS[daycareDate.status],
    title: daycareDate.pets.map((pet) => pet.name).join('<br />'),
    petNames: daycareDate.pets.map((pet) => pet.name),
    lastName: showLastNames.value ? getLastName(daycareDate.customer) : null,
    petIds: daycareDate.pets.map((pet) => pet.id),
    date: daycareDate.date,
    details: daycareDate.customer?.lastName,
    // details: lang.value.daycare.status[daycareDate.status],
    icon: DAYCARE_DATE_ICONS[daycareDate.status]
  }))
)

const onClickEvent = (event: QCalendarEvent) => {
  if (selectedEventIds.value.includes(event.id)) {
    const index = selectedEventIds.value.findIndex((id) => id === event.id)
    if (index !== -1) selectedEventIds.value.splice(index, 1)
  } else {
    selectedEventIds.value.push(event.id)
  }
}

// prettier-ignore
const numberOfPets = computed(() => {
  return (
    data.value?.reduce((acc, cur) => {
      acc[cur.date] = acc[cur.date]
        ? acc[cur.date] + cur.pets.length
        : cur.pets.length
      return acc
    }, {} as Record<string, number>) || {}
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
    } <br /> <b>${selectedEvents.value
      ?.map((event) => {
        return `${event.title} ${dateFormatter(
          new Date(event.date),
          $q.lang.isoName
        )}`
      })
      .join('<br />')}</b>`
  }).onOk(async () => {
    try {
      await approveDaycareDatesMutation({ ids: selectedEventIds.value })
      await execute()
      selectedEventIds.value = []
    } catch (e) {}
  })
}

const rejectDaycareDates = async () => {
  $q.dialog({
    html: true,
    message: `${
      lang.value.daycare.messages.verifyRejection
    } <br /> <b>${selectedEvents.value
      ?.map((event) => {
        return `${event.title} ${dateFormatter(
          new Date(event.date),
          $q.lang.isoName
        )}`
      })
      .join('<br />')}</b>`
  }).onOk(async () => {
    try {
      await rejectDaycareDatesMutation({ ids: selectedEventIds.value })
      await execute()
      selectedEventIds.value = []
    } catch (e) {}
  })
}

const standbyDaycareDates = async () => {
  $q.dialog({
    html: true,
    message: `${
      lang.value.daycare.messages.verifyStandby
    } <br /> <b>${selectedEvents.value
      ?.map((event) => {
        return `${event.title} ${dateFormatter(
          new Date(event.date),
          $q.lang.isoName
        )}`
      })
      .join('<br />')}</b>`
  }).onOk(async () => {
    try {
      await standbyDaycareDatesMutation({ ids: selectedEventIds.value })
      await execute()
      selectedEventIds.value = []
    } catch (e) {}
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

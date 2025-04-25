<template>
  <q-page padding>
    <agenda-component
      ref="agendaComponentRef"
      :bookings="bookingsData"
      :daycare-dates="daycareDatesData"
      :opening-times="openingTimesData"
      @click-pet="onClickPet"
      @change-date="onChangeDate"
    >
      <template #navigation>
        <booking-status-select v-model="status" :options="statusOptions" />
      </template>
    </agenda-component>
  </q-page>
</template>

<script lang="ts">
export default {
  name: 'EmployeeAgendaPage'
}
</script>

<script setup lang="ts">
import { BOOKING_STATUS } from '@petboarding/api/zod'
import AgendaComponent from '../../components/AgendaComponent.vue'
import { onMounted, reactive, ref } from 'vue'
import BookingStatusSelect from '../../components/booking/BookingStatusSelect.vue'
import { createUseTrpc } from '../../trpc.js'
import { onBeforeRouteUpdate } from 'vue-router'
import { useLang } from '../../lang/index.js'
import { useRouter } from 'vue-router'
const { useQuery } = await createUseTrpc()

const lang = useLang()
const selectedPets = ref<number[]>([])
const status = ref<BOOKING_STATUS>(BOOKING_STATUS.APPROVED)

const onClickPet: InstanceType<
  typeof AgendaComponent
>['$props']['onClickPet'] = ({ data }) => {
  const petId = data
  if (selectedPets.value.includes(petId)) {
    const index = selectedPets.value.findIndex((id) => id === petId)
    if (index !== -1) selectedPets.value.splice(index, 1)
  } else {
    selectedPets.value.push(petId)
  }
}

const agendaComponentRef = ref<typeof AgendaComponent>()
// const route = useRoute()
const router = useRouter()
onBeforeRouteUpdate((to) => {
  if (to.params.date && !Array.isArray(to.params.date)) {
    const parsedDate = to.params.date.replace('/', '-') // Convert to - for agenda
    if (agendaComponentRef.value) agendaComponentRef.value.setDate(parsedDate)
  }
})

const startDate = ref('')
const endDate = ref('')
const { data: openingTimesData, execute: executeOpeningTimes } = useQuery(
  'public.getOpeningTimes'
)

const { data: bookingsData } = useQuery('employee.getBookings', {
  args: reactive({ from: startDate, until: endDate, status }),
  reactive: {
    args: true
  }
})

const { data: daycareDatesData } = useQuery('employee.getDaycareDates', {
  args: reactive({ from: startDate, until: endDate, status }),
  reactive: {
    args: true
  }
})
const onChangeDate: InstanceType<
  typeof AgendaComponent
>['$props']['onChangeDate'] = (data) => {
  router.push({ path: `/employee/agenda/${data.date}` })
  startDate.value = data.start
  endDate.value = data.end
}

const statusOptions = ref([
  {
    label: lang.value.booking.status[BOOKING_STATUS.PENDING],
    value: BOOKING_STATUS.PENDING
  },
  {
    label: lang.value.booking.status[BOOKING_STATUS.APPROVED],
    value: BOOKING_STATUS.APPROVED
  },
  {
    label: lang.value.booking.status[BOOKING_STATUS.REJECTED],
    value: BOOKING_STATUS.REJECTED
  },
  {
    label: lang.value.booking.status[BOOKING_STATUS.STANDBY],
    value: BOOKING_STATUS.STANDBY
  },
  {
    label: lang.value.booking.status[BOOKING_STATUS.CANCELED],
    value: BOOKING_STATUS.CANCELED
  }
])

onMounted(async () => {
  await executeOpeningTimes()
})
</script>

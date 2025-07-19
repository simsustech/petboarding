<template>
  <q-page padding>
    <div v-if="data">
      <q-list v-if="upcomingBookings?.length">
        <q-item-label header>{{
          lang.booking.messages.upcomingBookings
        }}</q-item-label>
        <booking-expansion-item
          v-for="booking in upcomingBookings"
          :key="booking.id"
          :model-value="booking"
          show-edit-button
          show-history
          show-icon
          show-booking-services-edit-button
          @update="openUpdateDialog"
          @cancel="cancelBooking"
          @open-customer="openCustomer"
          @update-booking-invoice="updateBookingInvoice"
          @update-booking-service="openUpdateBookingServiceDialog"
        />
      </q-list>
      <q-list v-if="otherBookings?.length">
        <q-item-label header>{{
          lang.booking.messages.otherBookings
        }}</q-item-label>
        <booking-expansion-item
          v-for="booking in otherBookings"
          :key="booking.id"
          :model-value="booking"
          show-edit-button
          show-history
          show-icon
          @update="openUpdateDialog"
          @cancel="cancelBooking"
          @open-customer="openCustomer"
          @update-booking-invoice="updateBookingInvoice"
        />
      </q-list>

      <!-- <booking-expansion-item
        v-for="booking in data"
        :key="booking.id"
        :model-value="booking"
        show-edit-button
        show-history
        show-icon
        @update="openUpdateDialog"
        @cancel="cancelBooking"
        @open-customer="openCustomer"
      /> -->
    </div>

    <responsive-dialog
      ref="updateDialogRef"
      padding
      :icons="{ close: 'i-mdi-close' }"
      persistent
      @submit="update"
    >
      <booking-form
        ref="updateBookingFormRef"
        :pets="petsData"
        :services="servicesData"
        allow-hidden-services
        ignore-terms-and-conditions
        hide-approved-after-down-payment
        allow-past-dates
        @submit="updateBooking"
      ></booking-form>
    </responsive-dialog>
    <responsive-dialog
      ref="updateBookingServiceDialogRef"
      padding
      :icons="{ close: 'i-mdi-close' }"
      @submit="submitBookingService"
    >
      <booking-service-form
        ref="updateBookingServiceFormRef"
        @submit="updateBookingService"
      ></booking-service-form>
    </responsive-dialog>
  </q-page>
</template>

<script lang="ts">
export default {
  name: 'EmployeeBookingsPage'
}
</script>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import BookingExpansionItem from '../../components/booking/BookingExpansionItem.vue'
import BookingItem from '../../components/booking/BookingItem.vue'
import { ResponsiveDialog } from '@simsustech/quasar-components'
import BookingForm from '../../components/booking/BookingForm.vue'
import { extend, useQuasar } from 'quasar'
import { useLang } from '../../lang/index.js'
import { BOOKING_STATUS } from '@petboarding/api/zod'
import BookingServiceForm from '../../components/booking/BookingServiceForm.vue'
import { useEmployeeGetBookingsByIdsQuery } from 'src/queries/employee/booking.js'
import { useEmployeeGetPetsByCustomerId } from 'src/queries/employee/pet.js'
import {
  useEmployeeCancelBookingMutation,
  useEmployeeUpdateBookingInvoiceMutation,
  useEmployeeUpdateBookingMutation
} from 'src/mutations/employee/booking.js'
import { useEmployeeGetBookingServiceQuery } from 'src/queries/employee/bookingService.js'
import { useAdminUpdateBookingServiceMutation } from 'src/mutations/admin/bookingService.js'
import { usePublicGetServicesQuery } from 'src/queries/public.js'

const lang = useLang()
const route = useRoute()
const router = useRouter()
const $q = useQuasar()

const {
  bookings: data,
  refetch: execute,
  ids
} = useEmployeeGetBookingsByIdsQuery()
const {
  pets: petsData,
  refetch: executePets,
  customerId
} = useEmployeeGetPetsByCustomerId()
const {
  bookingService,
  refetch: executeBookingService,
  id: bookingServiceId
} = useEmployeeGetBookingServiceQuery()
const { services: servicesData, refetch: executeServices } =
  usePublicGetServicesQuery()

const { mutateAsync: updateBookingMutation } =
  useEmployeeUpdateBookingMutation()

const { mutateAsync: updateBookingServiceMutation } =
  useAdminUpdateBookingServiceMutation()

const { mutateAsync: cancelBookingMutation } =
  useEmployeeCancelBookingMutation()

const { mutateAsync: updateBookingInvoiceMutation } =
  useEmployeeUpdateBookingInvoiceMutation()

ids.value = ((route.params.ids as string[]) || []).map((id) => Number(id))
onBeforeRouteUpdate((to) => {
  if (to.params.ids && Array.isArray(to.params.ids)) {
    ids.value = to.params.ids.map((id) => Number(id))
  }
})

const upcomingBookings = computed(() =>
  data.value?.filter(
    (booking) =>
      (booking.status?.status === BOOKING_STATUS.APPROVED ||
        booking.status?.status === BOOKING_STATUS.PENDING ||
        booking.status?.status === BOOKING_STATUS.AWAITING_DOWNPAYMENT) &&
      booking.endDate >= new Date().toISOString().slice(0, 10)
  )
)
const otherBookings = computed(() =>
  data.value
    ?.filter(
      (booking) =>
        !upcomingBookings.value
          ?.map((upcomingBooking) => upcomingBooking.id)
          .includes(booking.id)
    )
    .sort((a, b) => (a.startDate > b.startDate ? -1 : 1))
)

const updateBookingFormRef = ref<typeof BookingForm>()
const updateDialogRef = ref<typeof ResponsiveDialog>()

const update: InstanceType<
  typeof ResponsiveDialog
>['$props']['onSubmit'] = async ({ done }) => {
  const afterUpdate = (success?: boolean) => {
    done(success)
    execute()
  }
  updateBookingFormRef.value?.functions.submit({ done: afterUpdate })
}

const openUpdateDialog: InstanceType<
  typeof BookingExpansionItem
>['$props']['onUpdate'] = ({ data }) => {
  customerId.value = data.customerId
  executePets()
  updateDialogRef.value?.functions.open()
  nextTick(() => {
    updateBookingFormRef.value?.functions.setValue(data)
  })
}

const updateBooking: InstanceType<
  typeof BookingForm
>['$props']['onSubmit'] = async ({ data, done }) => {
  data = extend(true, {}, data)

  try {
    await updateBookingMutation(data)
    done(true)
  } catch (e) {
    done(false)
  }
}

const cancelBooking: InstanceType<
  typeof BookingItem
>['$props']['onCancel'] = async ({ data: { booking, reason }, done }) => {
  if (booking.id) {
    try {
      await cancelBookingMutation(booking.id)
      done(true)
      await execute()
    } catch (e) {
      done(false)
    }
  }
}

const updateBookingInvoice: InstanceType<
  typeof BookingExpansionItem
>['$props']['onUpdateBookingInvoice'] = async ({ data, done }) => {
  if (data.id) {
    try {
      await updateBookingInvoiceMutation(data.id)
      done(true)
      $q.notify({
        icon: 'i-mdi-check-circle',
        color: 'positive',
        message: lang.value.booking.messages.invoiceSynchronized
      })
      await execute()
    } catch (e) {
      done(false)
    }
  }
}

const openCustomer: InstanceType<
  typeof BookingExpansionItem
>['$props']['onOpenCustomer'] = ({ id }) =>
  router.push(`/employee/customers/${id}`)

const updateBookingServiceDialogRef = ref<typeof ResponsiveDialog>()
const updateBookingServiceFormRef = ref<typeof BookingServiceForm>()
const openUpdateBookingServiceDialog: InstanceType<
  typeof BookingExpansionItem
>['$props']['onUpdateBookingService'] = async ({ data, done }) => {
  if (data.id) {
    bookingServiceId.value = data.id
    await executeBookingService()

    updateBookingServiceDialogRef.value?.functions.open()
    nextTick(() => {
      updateBookingServiceFormRef.value?.functions.setValue(
        bookingService.value
      )
    })
  }
}
const submitBookingService: InstanceType<
  typeof ResponsiveDialog
>['$props']['onSubmit'] = async ({ done }) => {
  updateBookingServiceFormRef.value?.functions.submit({ done })
}

const updateBookingService: InstanceType<
  typeof BookingServiceForm
>['$props']['onSubmit'] = async ({ data, done }) => {
  try {
    await updateBookingServiceMutation(data)
    if (done) done(true)
    await execute()
  } catch (e) {
    if (done) done(false)
  }
}

onMounted(async () => {
  if (data.value?.[0]) {
    customerId.value = data.value[0].customerId
  } else {
    customerId.value = NaN
  }
  await executeServices()
  await executePets()
  if (route.params.ids) await execute()
})
</script>

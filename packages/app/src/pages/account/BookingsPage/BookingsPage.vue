<template>
  <q-page padding>
    <q-banner class="q-mt-none q-pt-none" rounded>
      <template #avatar>
        <q-icon name="i-mdi-info" color="info" />
      </template>
      {{ lang.booking.messages.changeDaycareToBooking }}
    </q-banner>
    <div v-if="ready">
      <div v-if="petsData?.length">
        <div class="row">
          <q-list v-if="upcomingBookings?.length" class="col-12 col-md-6">
            <q-item-label header>{{
              lang.booking.messages.upcomingBookings
            }}</q-item-label>
            <booking-expansion-item
              v-for="booking in upcomingBookings"
              :key="booking.id"
              :model-value="booking"
              show-icon
              show-edit-button
              @update="openUpdateDialog"
              @cancel="cancelBooking"
            />
          </q-list>
          <q-expansion-item v-if="otherBookings.length" class="col-12 col-md-6">
            <template #header>
              <q-item-label header>{{
                lang.booking.messages.otherBookings
              }}</q-item-label>
            </template>

            <q-list>
              <booking-expansion-item
                v-for="booking in otherBookings"
                :key="booking.id"
                :model-value="booking"
                show-icon
                show-edit-button
                @update="openUpdateDialog"
                @cancel="cancelBooking"
              />
            </q-list>
          </q-expansion-item>
        </div>
      </div>
      <div v-else>
        <router-link to="/account/pets">{{
          lang.booking.messages.addPets
        }}</router-link>
      </div>
    </div>
  </q-page>

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
      :terms-and-conditions-url="termsAndConditionsUrl"
      :hide-approved-after-down-payment="
        !configuration.INTEGRATIONS?.slimfact.host
      "
      @submit="updateBooking"
    ></booking-form>
  </responsive-dialog>
  <responsive-dialog
    ref="createDialogRef"
    padding
    :icons="{ close: 'i-mdi-close' }"
    persistent
    @submit="create"
  >
    <booking-form
      ref="createBookingFormRef"
      :pets="petsData"
      :services="servicesData"
      :terms-and-conditions-url="termsAndConditionsUrl"
      :hide-approved-after-down-payment="
        !configuration.INTEGRATIONS?.slimfact.host
      "
      @submit="createBooking"
    ></booking-form>
  </responsive-dialog>
</template>

<script lang="ts">
export default {
  name: 'AccountBookingsPage'
}
</script>

<script setup lang="ts">
import { ref, nextTick, onMounted, inject } from 'vue'
import { ResourcePage, ResponsiveDialog } from '@simsustech/quasar-components'
import BookingForm from '../../../components/booking/BookingForm.vue'
import BookingItem from '../../../components/booking/BookingItem.vue'
import { useLang } from '../../../lang/index.js'
import { extend } from 'quasar'
import { computed } from 'vue'
import { useConfiguration } from '../../../configuration.js'
import { BOOKING_STATUS } from '@petboarding/api/zod'
import { useQuasar } from 'quasar'
import { EventBus } from 'quasar'
import { usePublicGetServicesQuery } from '../../../queries/public.js'
import { useAccountGetPetsQuery } from '../../../queries/account/pet.js'
import {
  useAccountCancelBookingMutation,
  useAccountCreateBookingMutation,
  useAccountUpdateBookingMutation
} from '../../../mutations/account/booking.js'
import { useAccountGetBookingsQuery } from '../../../queries/account/booking.js'

const bus = inject<EventBus>('bus')!
bus.on('account-open-bookings-create-dialog', () => {
  if (openCreateDialog)
    openCreateDialog({
      done: () => {}
    })
})

const $q = useQuasar()
const configuration = useConfiguration()

const lang = useLang()

const { services: servicesData, refetch: executeServices } =
  usePublicGetServicesQuery()
const { pets: petsData, refetch: executePets } = useAccountGetPetsQuery()
const { bookings: data, refetch: execute } = useAccountGetBookingsQuery()

const { mutateAsync: createBookingMutation } = useAccountCreateBookingMutation()
const { mutateAsync: updateBookingMutation } = useAccountUpdateBookingMutation()
const { mutateAsync: cancelBookingMutation } = useAccountCancelBookingMutation()

// const { data: petsData, execute: executeCustomer } = useQuery('user.getPets', {
//   // immediate: true
// })

// const { data, execute } = useQuery('user.getBookings', {
//   // immediate: true
// })
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

// const { data: servicesData, execute: executeServices } =
//   useQuery('public.getServices')

// const disabled = computed(() => !petsData.value?.length)

const termsAndConditionsUrl = computed(
  () =>
    configuration.value.TERMS_AND_CONDITIONS_URL || '/print/termsandconditions'
)

const updateBookingFormRef = ref<typeof BookingForm>()
const createBookingFormRef = ref<typeof BookingForm>()
const updateDialogRef = ref<typeof ResponsiveDialog>()
const createDialogRef = ref<typeof ResponsiveDialog>()
// const updateDialogOpened = ref(false)
const openUpdateDialog: InstanceType<
  typeof ResourcePage
>['$props']['onUpdate'] = ({ data }) => {
  updateDialogRef.value?.functions.open()
  nextTick(() => {
    updateBookingFormRef.value?.functions.setValue(data)
  })
}

const openCreateDialog: InstanceType<
  typeof ResourcePage
>['$props']['onCreate'] = () => {
  createDialogRef.value?.functions.open()
}

const update: InstanceType<
  typeof ResponsiveDialog
>['$props']['onSubmit'] = async ({ done }) => {
  updateBookingFormRef.value?.functions.submit({ done })
}

const create: InstanceType<
  typeof ResponsiveDialog
>['$props']['onSubmit'] = async ({ done }) => {
  createBookingFormRef.value?.functions.submit({ done })
}

const updateBooking: InstanceType<
  typeof BookingForm
>['$props']['onSubmit'] = async ({ data, done }) => {
  data = extend(true, {}, data)
  delete data.customerId

  try {
    await updateBookingMutation(data)

    done()
    await execute()
  } catch (e) {}
}

const cancelBooking: InstanceType<
  typeof BookingItem
>['$props']['onCancel'] = async ({ data: { booking, reason }, done }) => {
  if (booking.id) {
    try {
      await cancelBookingMutation({
        id: booking.id,
        reason
      })

      done()
      await execute()
    } catch (e) {}
  }
}

const createBooking: InstanceType<
  typeof BookingForm
>['$props']['onSubmit'] = async ({ data, done }) => {
  delete data.customerId

  try {
    await createBookingMutation(data)

    done()
    $q.dialog({
      message: lang.value.booking.messages.submitted,
      persistent: true
    })

    await execute()
  } catch (e) {}
}

const ready = ref<boolean>(false)
onMounted(async () => {
  await executePets()
  await executeServices()
  await execute()
  ready.value = true
})
</script>

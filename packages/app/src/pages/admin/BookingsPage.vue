<template>
  <resource-page padding :icons="{ add: 'i-mdi-add', edit: 'i-mdi-edit' }">
    <template #header>
      {{ lang.booking.title }}
    </template>
    <template #header-side>
      <q-btn icon="i-mdi-search">
        <q-menu class="q-pa-sm">
          <booking-status-select v-model="status" />

          <customer-select
            v-model="customerId"
            :label="lang.customer.customer"
            :filtered-options="filteredCustomers"
            @filter="onFilterCustomers"
          >
          </customer-select>
          <date-input
            v-model="from"
            :label="capitalizeFirstLetter(lang.booking.from)"
            format="DD-MM-YYYY"
            clearable
            :date="{
              noUnset: true,
              firstDayOfWeek: '1'
            }"
          />
          <date-input
            v-model="until"
            :label="capitalizeFirstLetter(lang.booking.until)"
            format="DD-MM-YYYY"
            clearable
            :date="{
              noUnset: true,
              firstDayOfWeek: '1'
            }"
          />
        </q-menu>
      </q-btn>
    </template>
    <q-list separator>
      <booking-expansion-item
        v-for="booking in bookingsData"
        :key="booking.id"
        :model-value="booking"
        :show-approval-buttons="
          ['pending', 'standby', 'rejected'].includes(booking.status.status)
        "
        :show-handle-cancelation-button="
          booking.status.status === 'canceledoutsideperiod'
        "
        show-booking-services-edit-button
        show-history
        @approve="approve"
        @reject="reject"
        @standby="standby"
        @reply="reply"
        @settle-cancelation="settleCancelation"
        @edit-pet="openUpdatePetDialog"
        @edit-booking-service="openUpdateBookingServiceDialog"
        @open-customer="openCustomer"
      />
    </q-list>
  </resource-page>
  <responsive-dialog
    padding
    :icons="{ close: 'i-mdi-close' }"
    ref="updatePetDialogRef"
    @submit="submitPet"
  >
    <pet-form
      ref="updatePetFormRef"
      :categories="categories"
      use-category
      use-comments
      use-rating
      use-food
      @submit="updatePet"
    />
  </responsive-dialog>
  <responsive-dialog
    padding
    :icons="{ close: 'i-mdi-close' }"
    ref="editorDialogRef"
    button-type="send"
    @submit="submit"
  >
    <template #title>
      <a v-if="replyType">
        {{ lang.booking.replies[replyType] }}
      </a>
    </template>
    <q-checkbox
      v-if="replyType === 'approve'"
      v-model="skipDownPayment"
      color="primary"
      class="q-mb-sm"
    >
      <template #default>
        {{ lang.booking.messages.skipDownPayment }}
      </template>
    </q-checkbox>
    <email-input
      v-model:subject="replyEmailSubject"
      v-model:body="replyEmailBody"
    />
  </responsive-dialog>
  <responsive-dialog
    padding
    :icons="{ close: 'i-mdi-close' }"
    ref="updateBookingServiceDialogRef"
    @submit="submitBookingService"
  >
    <booking-service-form
      ref="updateBookingServiceFormRef"
      @submit="updateBookingService"
    ></booking-service-form>
  </responsive-dialog>
</template>

<script lang="ts">
export default {
  name: 'AdminBookingsPage'
}
</script>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { extend, useQuasar } from 'quasar'
import { useLang } from '../../lang/index.js'
import { BOOKING_STATUS } from '@petboarding/api/zod'
import BookingStatusSelect from '../../components/booking/BookingStatusSelect.vue'
import BookingItem from '../../components/booking/BookingItem.vue'
import BookingExpansionItem from '../../components/booking/BookingExpansionItem.vue'
import { createUseTrpc } from '../../trpc.js'
import { ResponsiveDialog, ResourcePage } from '@simsustech/quasar-components'
import { EmailInput, DateInput } from '@simsustech/quasar-components/form'
import PetForm from '../../components/pet/PetForm.vue'
import BookingServiceForm from '../../components/booking/BookingServiceForm.vue'
import { useRouter } from 'vue-router'
import CustomerSelect from '../../components/employee/CustomerSelect.vue'

type REPLY_TYPES = ['approve', 'reject', 'standby', 'reply']

enum MUTATION_NAMES {
  approve = 'admin.approveBooking',
  reject = 'admin.rejectBooking',
  standby = 'admin.standbyBooking',
  reply = 'admin.replyBooking'
}
const router = useRouter()
const lang = useLang()
const $q = useQuasar()

const { useQuery, useMutation } = await createUseTrpc()

const status = ref<BOOKING_STATUS>(BOOKING_STATUS.PENDING)
const customerId = ref<number>()
const from = ref<string | null>(null)
const until = ref<string | null>(null)

const { data: categories, execute: executeCategories } = useQuery(
  'public.getCategories',
  {
    // immediate: true
  }
)

const { data, execute: executeBookings } = useQuery('admin.getBookings', {
  args: reactive({ status, customerId, from, until }),
  reactive: {
    args: true
  }
})

const bookingsData = computed(() =>
  data?.value?.filter(
    (booking) => !handledBookingIds.value.includes(booking.id)
  )
)

const replyBookingId = ref<number>()
const replyType = ref<'approve' | 'reject' | 'reply'>()
const editorDialogRef = ref<typeof ResponsiveDialog>()
const replyEmailBody = ref('')
const replyEmailSubject = ref('')
const handledBookingIds = ref<number[]>([])
const skipDownPayment = ref(false)

const openEditor = () => {
  editorDialogRef.value?.functions.open()
}

const submit: InstanceType<
  typeof ResponsiveDialog
>['$props']['onSubmit'] = async ({ done }) => {
  if (replyType.value && replyBookingId.value) {
    let mutationName = MUTATION_NAMES[replyType.value]

    if (mutationName !== void 0) {
      const { immediatePromise, error } = useMutation(mutationName, {
        args: {
          id: replyBookingId.value,
          emailText: replyEmailBody.value,
          emailSubject: replyEmailSubject.value,
          skipDownPayment:
            replyType.value === 'approve' ? skipDownPayment.value : undefined
        },
        immediate: true
      })

      await immediatePromise
      done(!error.value)
      if (!error.value && replyBookingId.value && replyType.value !== 'reply') {
        handledBookingIds.value.push(replyBookingId.value)
        replyType.value = undefined
        replyBookingId.value = undefined
      }
    }
  }
}

const getBookingEmail = async ({
  id,
  type
}: {
  id: number
  type: REPLY_TYPES[number]
}) => {
  const { immediatePromise, data } = useQuery('admin.getBookingEmail', {
    args: { type, id },
    immediate: true
  })

  await immediatePromise
  return {
    subject: data.value?.subject,
    body: data.value?.body
  }
}

const approve: InstanceType<
  typeof BookingItem
>['$props']['onApprove'] = async ({ data, done }) => {
  const { subject, body } = await getBookingEmail({
    type: 'approve',
    id: data.id!
  })
  if (body && subject) {
    replyType.value = 'approve'
    replyEmailBody.value = body
    replyEmailSubject.value = subject
    replyBookingId.value = data.id
    openEditor()
  }
}

const reject: InstanceType<typeof BookingItem>['$props']['onReject'] = async ({
  data,
  done
}) => {
  if (data.id) {
    const { subject, body } = await getBookingEmail({
      type: 'reject',
      id: data.id
    })
    replyType.value = 'reject'
    replyEmailBody.value = body
    replyEmailSubject.value = subject
    replyBookingId.value = data.id
    openEditor()
  }
}

const standby: InstanceType<
  typeof BookingItem
>['$props']['onStandby'] = async ({ data, done }) => {
  if (data.id) {
    const { subject, body } = await getBookingEmail({
      type: 'standby',
      id: data.id
    })
    replyType.value = 'standby'
    replyEmailBody.value = body
    replyEmailSubject.value = subject
    replyBookingId.value = data.id
    openEditor()
  }
}
const reply: InstanceType<typeof BookingItem>['$props']['onReply'] = async ({
  data,
  done
}) => {
  if (data.id) {
    const { subject, body } = await getBookingEmail({
      type: 'reply',
      id: data.id
    })
    replyType.value = 'reply'
    replyEmailBody.value = body
    replyEmailSubject.value = subject
    replyBookingId.value = data.id
    openEditor()
  }
}

const updatePetDialogRef = ref<typeof ResponsiveDialog>()
const updatePetFormRef = ref<typeof PetForm>()

const openUpdatePetDialog: InstanceType<
  typeof BookingExpansionItem
>['$props']['onEditPet'] = async ({ id, done }) => {
  const { data, immediatePromise, error } = useQuery('employee.getPet', {
    args: {
      id
    },
    immediate: true
  })

  await immediatePromise
  updatePetDialogRef.value?.functions.open()
  nextTick(() => {
    updatePetFormRef.value?.functions.setValue(data.value)
  })
}

const submitPet: InstanceType<
  typeof ResponsiveDialog
>['$props']['onSubmit'] = async ({ done }) => {
  updatePetFormRef.value?.functions.submit({ done })
}

const updatePet: InstanceType<typeof PetForm>['$props']['onSubmit'] = async ({
  pet,
  done
}) => {
  pet = extend(true, {}, pet)
  delete pet.customer
  delete pet.customerId

  const result = useMutation('employee.updatePet', {
    args: pet,
    immediate: true
  })

  await result.immediatePromise
  if (!result.error.value) executeBookings()
  done(!result.error.value)
}

const updateBookingServiceDialogRef = ref<typeof ResponsiveDialog>()
const updateBookingServiceFormRef = ref<typeof BookingServiceForm>()
const openUpdateBookingServiceDialog: InstanceType<
  typeof BookingExpansionItem
>['$props']['onEditBookingService'] = async ({ data, done }) => {
  if (data.id) {
    const {
      data: bookingServiceData,
      immediatePromise,
      error
    } = useQuery('employee.getBookingService', {
      args: {
        id: data.id
      },
      immediate: true
    })

    await immediatePromise

    updateBookingServiceDialogRef.value?.functions.open()
    nextTick(() => {
      updateBookingServiceFormRef.value?.functions.setValue(
        bookingServiceData.value
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
  const result = useMutation('admin.updateBookingService', {
    args: data,
    immediate: true
  })

  await result.immediatePromise
  if (!result.error.value) executeBookings()
  if (done) done(!result.error.value)
}

const openCustomer: InstanceType<
  typeof BookingExpansionItem
>['$props']['onOpenCustomer'] = ({ id }) =>
  router.push(`/employee/customers/${id}`)

const settleCancelation: InstanceType<
  typeof BookingItem
>['$props']['onSettleCancelation'] = async ({ data, done }) => {
  if (data.id) {
    $q.dialog({
      message: `${lang.value.booking.messages.settleCancelation}<br />
      ${data.pets?.map((pet) => pet.name).join(', ')}<br />
      ${data.startDate} ${data.startTime.name} - ${data.endDate} ${
        data.endTime.name
      }`,
      html: true
    }).onOk(async () => {
      const result = useMutation('admin.settleBookingCancelation', {
        args: {
          id: data.id
        },
        immediate: true
      })

      await result.immediatePromise
      if (!result.error.value) {
        handledBookingIds.value.push(data.id)
      }
      if (done) done(!result.error.value)
    })
  }
}

const filteredCustomers = ref<Customer[]>([])

const onFilterCustomers: InstanceType<
  typeof CustomerSelect
>['$props']['onFilter'] = async ({ searchPhrase, ids, done }) => {
  const result = useQuery('employee.searchCustomers', {
    args: { searchPhrase, ids },
    immediate: true
  })

  await result.immediatePromise

  if (result.data.value) filteredCustomers.value = result.data.value

  if (done) done()
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

onMounted(async () => {
  await executeCategories()
  await executeBookings()
})
</script>

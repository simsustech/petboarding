<template>
  <q-page padding>
    <q-toolbar>
      <q-space />
      <q-btn icon="i-mdi-search">
        <q-menu class="q-pa-sm">
          <booking-status-select v-model="status" />

          <customer-select
            v-if="filteredCustomers"
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
            :icons="{
              event: 'i-mdi-event',
              clear: 'i-mdi-clear'
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
            :icons="{
              event: 'i-mdi-event',
              clear: 'i-mdi-clear'
            }"
          />
        </q-menu>
      </q-btn>
    </q-toolbar>

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
        @update-booking-service="openUpdateBookingServiceDialog"
        @open-customer="openCustomer"
        @update-booking-invoice="updateBookingInvoice"
      ></booking-expansion-item>
    </q-list>

    <div class="flex flex-center q-mt-md">
      <q-pagination
        v-model="page"
        :disable="!(total && page && rowsPerPage)"
        :max="Math.ceil(total / rowsPerPage)"
        :max-pages="5"
        direction-links
      />
    </div>
  </q-page>
  <!-- 
  <responsive-dialog
    ref="updatePetDialogRef"
    padding
    :icons="{ close: 'i-mdi-close' }"
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
  </responsive-dialog> -->
  <responsive-dialog
    ref="editorDialogRef"
    padding
    :icons="{ close: 'i-mdi-close' }"
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
</template>

<script lang="ts">
export default {
  name: 'AdminBookingsPage'
}
</script>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { useLang } from '../../lang/index.js'
import BookingStatusSelect from '../../components/booking/BookingStatusSelect.vue'
import BookingItem from '../../components/booking/BookingItem.vue'
import BookingExpansionItem from '../../components/booking/BookingExpansionItem.vue'
import { ResponsiveDialog } from '@simsustech/quasar-components'
import { EmailInput, DateInput } from '@simsustech/quasar-components/form'
import BookingServiceForm from '../../components/booking/BookingServiceForm.vue'
import { useRouter } from 'vue-router'
import CustomerSelect from '../../components/employee/CustomerSelect.vue'
import {
  useAdminGetBookingEmailQuery,
  useAdminGetBookingsQuery
} from '../../queries/admin/booking.js'
import { useEmployeeGetBookingServiceQuery } from '../../queries/employee/bookingService.js'
import { useAdminUpdateBookingServiceMutation } from '../../mutations/admin/bookingService.js'
import {
  useAdminApproveBookingMutation,
  useAdminBookingSettleCancellationMutation,
  useAdminRejectBookingMutation,
  useAdminReplyBookingMutation,
  useAdminStandbyBookingMutation
} from '../../mutations/admin/booking.js'
import { useEmployeeSearchCustomersQuery } from '../../queries/employee/customer.js'
import { useEmployeeUpdateBookingInvoiceMutation } from '../../mutations/employee/booking.js'

type REPLY_TYPES = ['approve', 'reject', 'standby', 'reply']

const router = useRouter()
const lang = useLang()
const $q = useQuasar()

const {
  bookings: data,
  refetch: executeBookings,
  customerId,
  from,
  until,
  bookingStatus: status,
  page,
  rowsPerPage
} = useAdminGetBookingsQuery()

const {
  email,
  type: emailType,
  id: emailId,
  refetch: refetchEmail
} = useAdminGetBookingEmailQuery()

const {
  bookingService,
  refetch: refetchBookingService,
  id: bookingServiceId
} = useEmployeeGetBookingServiceQuery()

const {
  customers: filteredCustomers,
  searchPhrase: customerSearchPhrase,
  customerIds
} = useEmployeeSearchCustomersQuery()

const { mutateAsync: updateBookingServiceMutation } =
  useAdminUpdateBookingServiceMutation()

const { mutateAsync: settleBookingCancellationMutation } =
  useAdminBookingSettleCancellationMutation()

const { mutateAsync: approveBookingMutation } = useAdminApproveBookingMutation()
const { mutateAsync: rejectBookingMutation } = useAdminRejectBookingMutation()
const { mutateAsync: replyBookingMutation } = useAdminReplyBookingMutation()
const { mutateAsync: standbyBookingMutation } = useAdminStandbyBookingMutation()

const { mutateAsync: updateBookingInvoiceMutation } =
  useEmployeeUpdateBookingInvoiceMutation()

const total = computed(() => data.value?.at(0)?.total || 0)
// const { pet, id: petId, refetch: refetchPet } = useEmployeeGetPetQuery()

// const status = ref<BOOKING_STATUS>(BOOKING_STATUS.PENDING)
// const customerId = ref<number>()
// const from = ref<string | null>(null)
// const until = ref<string | null>(null)

// const { data: categories, execute: executeCategories } = useQuery(
//   'public.getCategories',
//   {
//     // immediate: true
//   }
// )

// const { data, execute: executeBookings } = useQuery('admin.getBookings', {
//   args: reactive({ status, customerId, from, until }),
//   reactive: {
//     args: true
//   }
// })

const bookingsData = computed(() =>
  data?.value?.filter(
    (booking) => !handledBookingIds.value.includes(booking.id)
  )
)

const replyBookingId = ref<number>()
const replyType = ref<'approve' | 'reject' | 'reply' | 'standby'>()
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
    // let mutationName = MUTATION_NAMES[replyType.value]

    try {
      switch (replyType.value) {
        case 'approve':
          await approveBookingMutation({
            id: replyBookingId.value,
            emailText: replyEmailBody.value,
            emailSubject: replyEmailSubject.value,
            skipDownPayment: skipDownPayment.value
          })
          break
        case 'reject':
          await rejectBookingMutation({
            id: replyBookingId.value,
            emailText: replyEmailBody.value,
            emailSubject: replyEmailSubject.value
          })
          break
        case 'reply':
          await replyBookingMutation({
            id: replyBookingId.value,
            emailText: replyEmailBody.value,
            emailSubject: replyEmailSubject.value
          })
          break
        case 'standby':
          await standbyBookingMutation({
            id: replyBookingId.value,
            emailText: replyEmailBody.value,
            emailSubject: replyEmailSubject.value
          })
          break
        default:
          break
      }

      if (replyBookingId.value && replyType.value !== 'reply') {
        handledBookingIds.value.push(replyBookingId.value)
        replyType.value = undefined
        replyBookingId.value = undefined
      }
      done(true)
    } catch (e) {
      done(false)
    }
    // if (mutationName !== void 0) {
    //   const { immediatePromise, error } = useMutation(mutationName, {
    //     args: {
    //       id: replyBookingId.value,
    //       emailText: replyEmailBody.value,
    //       emailSubject: replyEmailSubject.value,
    //       skipDownPayment:
    //         replyType.value === 'approve' ? skipDownPayment.value : undefined
    //     },
    //     immediate: true
    //   })

    //   await immediatePromise
    //   done(!error.value)
    //   if (!error.value && replyBookingId.value && replyType.value !== 'reply') {
    //     handledBookingIds.value.push(replyBookingId.value)
    //     replyType.value = undefined
    //     replyBookingId.value = undefined
    //   }
    // }
  }
}

const getBookingEmail = async ({
  id,
  type
}: {
  id: number
  type: REPLY_TYPES[number]
}) => {
  emailType.value = type
  emailId.value = id
  await refetchEmail()
  // const { immediatePromise, data } = useQuery('admin.getBookingEmail', {
  //   args: { type, id },
  //   immediate: true
  // })

  // await immediatePromise
  return {
    subject: email.value?.subject,
    body: email.value?.body
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

// const updatePetDialogRef = ref<typeof ResponsiveDialog>()
// const updatePetFormRef = ref<typeof PetForm>()

// const openUpdatePetDialog: InstanceType<
//   typeof BookingExpansionItem
// >['$props']['onEditPet'] = async ({ id, done }) => {
//   petId.value = id
//   await refetchPet()

//   updatePetDialogRef.value?.functions.open()
//   nextTick(() => {
//     updatePetFormRef.value?.functions.setValue(data.value)
//   })

//   // const { data, immediatePromise, error } = useQuery('employee.getPet', {
//   //   args: {
//   //     id
//   //   },
//   //   immediate: true
//   // })

//   // await immediatePromise
//   // updatePetDialogRef.value?.functions.open()
//   // nextTick(() => {
//   //   updatePetFormRef.value?.functions.setValue(data.value)
//   // })
// }

// const submitPet: InstanceType<
//   typeof ResponsiveDialog
// >['$props']['onSubmit'] = async ({ done }) => {
//   updatePetFormRef.value?.functions.submit({ done })
// }

// const updatePet: InstanceType<typeof PetForm>['$props']['onSubmit'] = async ({
//   pet,
//   done
// }) => {
//   pet = extend(true, {}, pet)
//   delete pet.customer
//   delete pet.customerId

//   const result = useMutation('employee.updatePet', {
//     args: pet,
//     immediate: true
//   })

//   await result.immediatePromise
//   if (!result.error.value) executeBookings()
//   done(!result.error.value)
// }

const updateBookingServiceDialogRef = ref<typeof ResponsiveDialog>()
const updateBookingServiceFormRef = ref<typeof BookingServiceForm>()
const openUpdateBookingServiceDialog: InstanceType<
  typeof BookingExpansionItem
>['$props']['onUpdateBookingService'] = async ({ data, done }) => {
  if (data.id) {
    bookingServiceId.value = data.id
    await refetchBookingService()

    // const {
    //   data: bookingServiceData,
    //   immediatePromise,
    //   error
    // } = useQuery('employee.getBookingService', {
    //   args: {
    //     id: data.id
    //   },
    //   immediate: true
    // })

    // await immediatePromise

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
    await executeBookings()
    if (done) done(true)
  } catch (e) {
    if (done) done(false)
  }

  // const result = useMutation('admin.updateBookingService', {
  //   args: data,
  //   immediate: true
  // })

  // await result.immediatePromise
  // if (!result.error.value) executeBookings()
  // if (done) done(!result.error.value)
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
      try {
        await settleBookingCancellationMutation({ id: data.id })
        handledBookingIds.value.push(data.id)
        if (done) done(true)
      } catch (e) {
        if (done) done(false)
      }
      // const result = useMutation('admin.settleBookingCancelation', {
      //   args: {
      //     id: data.id
      //   },
      //   immediate: true
      // })

      // await result.immediatePromise
      // if (!result.error.value) {
      //   handledBookingIds.value.push(data.id)
      // }
      // if (done) done(!result.error.value)
    })
  }
}

// const filteredCustomers = ref<Customer[]>([])

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
      await executeBookings()
    } catch (e) {
      done(false)
    }
  }
}
const onFilterCustomers: InstanceType<
  typeof CustomerSelect
>['$props']['onFilter'] = async ({ searchPhrase, ids, done }) => {
  customerSearchPhrase.value = searchPhrase
  customerIds.value = ids
  // const result = useQuery('employee.searchCustomers', {
  //   args: { searchPhrase, ids },
  //   immediate: true
  // })

  // await result.immediatePromise

  // if (result.data.value) filteredCustomers.value = result.data.value

  // if (done) done()
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

onMounted(async () => {
  await executeBookings()
})
</script>

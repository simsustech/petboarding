<template>
  <q-page>
    <div v-if="data">
      <booking-expansion-item
        v-for="booking in data"
        :key="booking.id"
        :model-value="booking"
        show-edit-button
        show-history
        show-icon
        @update="openUpdateDialog"
        @cancel="cancelBooking"
        @open-customer="openCustomer"
      />
    </div>

    <responsive-dialog ref="updateDialogRef" persistent @submit="update">
      <booking-form
        ref="updateBookingFormRef"
        :pets="petsData"
        :services="servicesData"
        allow-hidden-services
        ignore-terms-and-conditions
        @submit="updateBooking"
      ></booking-form>
    </responsive-dialog>
  </q-page>
</template>

<script lang="ts">
export default {
  name: 'EmployeeBookingsPage'
}
</script>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { createUseTrpc } from '../../trpc.js'
import BookingExpansionItem from '../../components/booking/BookingExpansionItem.vue'
import BookingItem from 'src/components/booking/BookingItem.vue'
import { ResponsiveDialog } from '@simsustech/quasar-components'
import BookingForm from '../../components/booking/BookingForm.vue'
import { extend } from 'quasar'

const { useQuery, useMutation } = await createUseTrpc()

const route = useRoute()
const router = useRouter()

const ids = ref(((route.params.ids as string[]) || []).map((id) => Number(id)))
onBeforeRouteUpdate((to) => {
  if (to.params.ids && Array.isArray(to.params.ids)) {
    ids.value = to.params.ids.map((id) => Number(id))
  }
})

const { data, execute } = useQuery('employee.getBookingsByIds', {
  args: reactive({ ids }),
  reactive: {
    args: true
  }
})

const updateBookingFormRef = ref<typeof BookingForm>()
const updateDialogRef = ref<typeof ResponsiveDialog>()
const customerId = ref<number>()
const { data: petsData, execute: executePets } = useQuery(
  'employee.getPetsByCustomerId',
  {
    args: reactive({ customerId }),
    initialData: [],
    reactive: {
      args: true
    }
  }
)

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

  const result = useMutation('employee.updateBooking', {
    args: data,
    immediate: true
  })

  await result.immediatePromise

  // if (result.data.value) modelValue.value = result.data.value
  done(!result.error.value)
}

const { data: servicesData, execute: executeServices } =
  useQuery('public.getServices')

const cancelBooking: InstanceType<
  typeof BookingItem
>['$props']['onCancel'] = async ({ data: { booking, reason }, done }) => {
  if (booking.id) {
    const result = useMutation('employee.cancelBooking', {
      args: {
        id: booking.id,
        reason
      },
      immediate: true
    })

    await result.immediatePromise

    execute()
    // if (result.data.value) modelValue.value = result.data.value
    done(!result.error.value)
  }
}

const openCustomer: InstanceType<
  typeof BookingExpansionItem
>['$props']['onOpenCustomer'] = ({ id }) =>
  router.push(`/employee/customers/${id}`)

onMounted(async () => {
  await executeServices()
  if (route.params.ids) await execute()
})
</script>

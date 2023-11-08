<template>
  <customer-select :model-value="id" @update:model-value="setParam" />

  <customer-card
    v-if="data"
    :model-value="data"
    :categories="categories"
    show-edit-button
    use-rating
    @update="openUpdateDialog"
    @open-bookings="openBookings"
    @open-pets="openPets"
  />
  <responsive-dialog ref="updateDialogRef" persistent @submit="update">
    <customer-form
      ref="updateCustomerFormRef"
      :categories="categories"
      use-comments
      use-food
      use-rating
      use-category
      @submit="updateCustomer"
    ></customer-form>
  </responsive-dialog>
</template>

<script lang="ts">
export default {
  name: 'EmployeeCustomersPage'
}
</script>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { createUseTrpc } from '../../trpc.js'
import CustomerSelect from '../../components/employee/CustomerSelect.vue'
import CustomerCard from '../../components/customer/CustomerCard.vue'
import CustomerForm from '../../components/customer/CustomerForm.vue'
import { ResponsiveDialog } from '@simsustech/quasar-components'
import { extend } from 'quasar'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }

const route = useRoute()
const router = useRouter()
const { useQuery, useMutation } = await createUseTrpc()

const id = ref(Number(route.params.id))
onBeforeRouteUpdate((to) => {
  if (to.params.id) {
    id.value = Number(to.params.id)
  }
})

const setParam = (id: number) => router.push({ params: { id } })
const { data, execute } = useQuery('employee.getCustomer', {
  args: reactive({ id }),
  reactive: {
    args: true
  }
})

const { data: categories, execute: executeCategories } = useQuery(
  'public.getCategories',
  {
    // immediate: true
  }
)

const updateDialogRef = ref<typeof ResponsiveDialog>()
const updateCustomerFormRef = ref<typeof CustomerForm>()
const openUpdateDialog: InstanceType<
  typeof CustomerCard
>['$props']['onUpdate'] = ({ data }) => {
  updateDialogRef.value?.functions.open()
  nextTick(() => {
    updateCustomerFormRef.value?.functions.setValue(data)
  })
}

const update: InstanceType<
  typeof ResponsiveDialog
>['$props']['onSubmit'] = async ({ done }) => {
  const afterUpdate = (success?: boolean) => {
    done(success)
    execute()
  }
  updateCustomerFormRef.value?.functions.submit({ done: afterUpdate })
}

const updateCustomer: InstanceType<
  typeof CustomerForm
>['$props']['onSubmit'] = async ({ customer, done }) => {
  customer = extend(true, {}, customer)
  delete customer.customerId

  const result = useMutation('employee.updateCustomer', {
    args: customer as WithRequired<typeof customer, 'id'>,
    immediate: true
  })

  await result.immediatePromise

  done(!result.error.value)
}

const openBookings: InstanceType<
  typeof CustomerCard
>['$props']['onOpenBookings'] = ({ ids }) =>
  router.push({
    path: `/employee/bookings/${ids.join('/')}`
  })

const openPets: InstanceType<typeof CustomerCard>['$props']['onOpenPets'] = ({
  ids
}) =>
  router.push({
    path: `/employee/pets/${ids.join('/')}`
  })

onMounted(async () => {
  await executeCategories()
  if (route.params.id) execute()
})
</script>

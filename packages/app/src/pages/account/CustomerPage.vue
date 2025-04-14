<template>
  <resource-page
    :icons="{ add: 'i-mdi-add', edit: 'i-mdi-edit' }"
    :type="customerData ? 'update' : 'create'"
    @create="openCreateDialog"
    @update="openUpdateDialog"
  >
    <template #header>
      {{ lang.customer.title }}
    </template>
    <customer-card v-if="customerData" :model-value="customerData" />

    <responsive-dialog
      :icons="{ close: 'i-mdi-close' }"
      ref="updateDialogRef"
      persistent
      @submit="update"
    >
      <customer-form
        ref="updateCustomerFormRef"
        @submit="updateCustomer"
      ></customer-form>
    </responsive-dialog>
    <responsive-dialog
      :icons="{ close: 'i-mdi-close' }"
      ref="createDialogRef"
      persistent
      @submit="create"
    >
      <customer-form
        ref="createCustomerFormRef"
        @submit="createCustomer"
      ></customer-form>
    </responsive-dialog>
  </resource-page>
</template>

<script lang="ts">
export default {
  name: 'AccountCustomerPage'
}
</script>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { createUseTrpc } from '../../trpc.js'
import { ResourcePage, ResponsiveDialog } from '@simsustech/quasar-components'
import CustomerForm from '../../components/customer/CustomerForm.vue'
import CustomerCard from '../../components/customer/CustomerCard.vue'
import { Customer } from '@petboarding/api/zod'
import { useLang } from '../../lang/index.js'
const { useQuery, useMutation } = await createUseTrpc()

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }

const lang = useLang()
const { data: customerData, execute } = useQuery('user.getCustomer', {
  // immediate: true
})

const modelValue = ref<Customer>({
  gender: 'male',
  firstName: '',
  lastName: '',
  address: '',
  postalCode: '',
  city: '',
  telephoneNumber: '',
  veterinarian: ''
})

const updateCustomerFormRef = ref<typeof CustomerForm>()
const createCustomerFormRef = ref<typeof CustomerForm>()
const updateDialogRef = ref<typeof ResponsiveDialog>()
const createDialogRef = ref<typeof ResponsiveDialog>()
// const updateDialogOpened = ref(false)
const openUpdateDialog: InstanceType<
  typeof ResourcePage
>['$props']['onUpdate'] = ({ data }) => {
  updateDialogRef.value?.functions.open()
  nextTick(() => {
    updateCustomerFormRef.value?.functions.setValue(data || customerData.value)
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
  const afterUpdate = (success?: boolean) => {
    done(success)
    execute()
  }
  updateCustomerFormRef.value?.functions.submit({ done: afterUpdate })
}

const create: InstanceType<
  typeof ResponsiveDialog
>['$props']['onSubmit'] = async ({ done }) => {
  const afterCreate = (success?: boolean) => {
    done(success)
    execute()
  }
  createCustomerFormRef.value?.functions.submit({ done: afterCreate })
}

const updateCustomer: InstanceType<
  typeof CustomerForm
>['$props']['onSubmit'] = async ({ customer, done }) => {
  delete customer.accountId
  delete customer.rating
  delete customer.comments

  const result = useMutation('user.updateCustomer', {
    args: customer as WithRequired<typeof customer, 'id'>,
    immediate: true
  })

  await result.immediatePromise

  if (result.data.value) modelValue.value = result.data.value
  done(!result.error.value)
}

const createCustomer: InstanceType<
  typeof CustomerForm
>['$props']['onSubmit'] = async ({ customer, done }) => {
  delete customer.accountId
  delete customer.rating
  delete customer.comments

  const result = useMutation('user.createCustomer', {
    args: customer as WithRequired<typeof customer, 'id'>,
    immediate: true
  })

  await result.immediatePromise

  if (result.data.value) modelValue.value = result.data.value
  done(!result.error.value)
}

onMounted(() => execute())
</script>

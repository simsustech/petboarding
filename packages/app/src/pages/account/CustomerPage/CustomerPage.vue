<template>
  <q-page padding>
    <div class="row">
      <customer-card
        v-if="customerData"
        class="col-12 col-md-4"
        :model-value="customerData"
      />
    </div>
  </q-page>

  <responsive-dialog
    ref="updateDialogRef"
    padding
    :icons="{ close: 'i-mdi-close' }"
    persistent
    @submit="update"
  >
    <customer-form
      ref="updateCustomerFormRef"
      @submit="updateCustomer"
    ></customer-form>
  </responsive-dialog>
  <responsive-dialog
    ref="createDialogRef"
    padding
    :icons="{ close: 'i-mdi-close' }"
    persistent
    @submit="create"
  >
    <customer-form
      ref="createCustomerFormRef"
      @submit="createCustomer"
    ></customer-form>
  </responsive-dialog>
</template>

<script lang="ts">
export default {
  name: 'AccountCustomerPage'
}
</script>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { ResourcePage, ResponsiveDialog } from '@simsustech/quasar-components'
import CustomerForm from '../../../components/customer/CustomerForm.vue'
import CustomerCard from '../../../components/customer/CustomerCard.vue'
import { inject } from 'vue'
import { EventBus } from 'quasar'
import { useAccountGetCustomerQuery } from '../../../queries/account/customer.js'
import {
  useAccountCreateCustomerMutation,
  useAccountUpdateCustomerMutation
} from '../../../mutations/account/customer'

const bus = inject<EventBus>('bus')!
bus.on('account-open-customer-create-dialog', () => {
  if (openCreateDialog)
    openCreateDialog({
      done: () => {}
    })
})
bus.on('account-open-customer-update-dialog', () => {
  if (openUpdateDialog)
    openUpdateDialog({
      done: () => {}
    })
})

// const lang = useLang()
// const { data: customerData, execute } = useQuery('user.getCustomer', {
//   // immediate: true
// })
const { customer: customerData, refetch: execute } =
  useAccountGetCustomerQuery()

// const modelValue = ref<Customer>({
//   gender: 'male',
//   firstName: '',
//   lastName: '',
//   address: '',
//   postalCode: '',
//   city: '',
//   telephoneNumber: '',
//   veterinarian: ''
// })

const { mutateAsync: createCustomerMutation } =
  useAccountCreateCustomerMutation()
const { mutateAsync: updateCustomerMutation } =
  useAccountUpdateCustomerMutation()

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
    bus.emit('account-get-customer')
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

  try {
    await updateCustomerMutation(customer)

    done()
    await execute()
  } catch (e) {}
}

const createCustomer: InstanceType<
  typeof CustomerForm
>['$props']['onSubmit'] = async ({ customer, done }) => {
  delete customer.accountId
  delete customer.rating
  delete customer.comments

  try {
    await createCustomerMutation(customer)

    done()
    await execute()
  } catch (e) {}
}

onMounted(async () => {
  await execute()
})
</script>

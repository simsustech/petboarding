<template>
  <resource-page
    :icons="{ add: 'i-mdi-add', edit: 'i-mdi-edit' }"
    type="create"
    :disabled="!customerData"
    @create="openCreateDialog"
    @update="openUpdateDialog"
  >
    <template #header>
      {{ lang.contactPerson.title }}
    </template>
    <div v-if="ready">
      <div v-if="customerData">
        <div class="row">
          <contact-person-card
            v-for="contactPerson in data"
            class="col-12 col-md-4"
            :key="contactPerson.id"
            :model-value="contactPerson"
            @update="openUpdateDialog"
          />
        </div>
      </div>
      <div v-else>
        <router-link to="/account/customer">{{
          lang.contactPerson.messages.addCustomerDetails
        }}</router-link>
      </div>
    </div>
    <responsive-dialog
      :icons="{ close: 'i-mdi-close' }"
      ref="updateDialogRef"
      persistent
      @submit="update"
    >
      <contact-person-form
        ref="updateContactPersonFormRef"
        @submit="updateContactPerson"
      ></contact-person-form>
    </responsive-dialog>
    <responsive-dialog
      :icons="{ close: 'i-mdi-close' }"
      ref="createDialogRef"
      persistent
      @submit="create"
    >
      <contact-person-form
        ref="createContactPersonFormRef"
        @submit="createContactPerson"
      ></contact-person-form>
    </responsive-dialog>
  </resource-page>
</template>

<script lang="ts">
export default {
  name: 'AccountContactPeoplePage'
}
</script>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { createUseTrpc } from '../../trpc.js'
import { ResourcePage, ResponsiveDialog } from '@simsustech/quasar-components'
import ContactPersonForm from '../../components/contactperson/ContactPersonForm.vue'
import ContactPersonCard from '../../components/contactperson/ContactPersonCard.vue'
import { useLang } from '../../lang/index.js'
import { extend } from 'quasar'
const { useQuery, useMutation } = await createUseTrpc()
type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }

const lang = useLang()

const { data: customerData, execute: executeCustomer } = useQuery(
  'user.getCustomer',
  {
    // immediate: true
  }
)

const { data, execute } = useQuery('user.getContactPeople', {
  // immediate: true
})

const modelValue = ref({
  firstName: '',
  lastName: '',
  telephoneNumber: ''
})
const updateContactPersonFormRef = ref<typeof ContactPersonForm>()
const createContactPersonFormRef = ref<typeof ContactPersonForm>()
const updateDialogRef = ref<typeof ResponsiveDialog>()
const createDialogRef = ref<typeof ResponsiveDialog>()
const openUpdateDialog: InstanceType<
  typeof ResourcePage
>['$props']['onUpdate'] = ({ data }) => {
  updateDialogRef.value?.functions.open()
  nextTick(() => {
    updateContactPersonFormRef.value?.functions.setValue(data)
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
  updateContactPersonFormRef.value?.functions.submit({ done: afterUpdate })
}

const create: InstanceType<
  typeof ResponsiveDialog
>['$props']['onSubmit'] = async ({ done }) => {
  const afterCreate = (success?: boolean) => {
    done(success)
    execute()
  }
  createContactPersonFormRef.value?.functions.submit({ done: afterCreate })
}

const updateContactPerson: InstanceType<
  typeof ContactPersonForm
>['$props']['onSubmit'] = async ({ contactPerson, done }) => {
  contactPerson = extend(true, {}, contactPerson)
  delete contactPerson.customerId

  const result = useMutation('user.updateContactPerson', {
    args: contactPerson as WithRequired<typeof contactPerson, 'id'>,
    immediate: true
  })

  await result.immediatePromise

  if (result.data.value) modelValue.value = result.data.value
  done(!result.error.value)
}

const createContactPerson: InstanceType<
  typeof ContactPersonForm
>['$props']['onSubmit'] = async ({ contactPerson, done }) => {
  delete contactPerson.customerId

  const result = useMutation('user.createContactPerson', {
    args: contactPerson as WithRequired<typeof contactPerson, 'id'>,
    immediate: true
  })

  await result.immediatePromise

  if (result.data.value) modelValue.value = result.data.value
  done(!result.error.value)
}

const ready = ref<boolean>(false)
onMounted(async () => {
  await executeCustomer()
  await execute()
  ready.value = true
})
</script>

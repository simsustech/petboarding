<template>
  <q-page padding>
    <div v-if="ready">
      <div v-if="customerData">
        <div class="row">
          <contact-person-card
            v-for="contactPerson in data"
            :key="contactPerson.id"
            class="col-12 col-md-4"
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
  </q-page>

  <responsive-dialog
    ref="updateDialogRef"
    padding
    :icons="{ close: 'i-mdi-close' }"
    persistent
    @submit="update"
  >
    <contact-person-form
      ref="updateContactPersonFormRef"
      @submit="updateContactPerson"
    ></contact-person-form>
  </responsive-dialog>
  <responsive-dialog
    ref="createDialogRef"
    padding
    :icons="{ close: 'i-mdi-close' }"
    persistent
    @submit="create"
  >
    <contact-person-form
      ref="createContactPersonFormRef"
      @submit="createContactPerson"
    ></contact-person-form>
  </responsive-dialog>
</template>

<script lang="ts">
export default {
  name: 'AccountContactPeoplePage'
}
</script>

<script setup lang="ts">
import { ref, nextTick, onMounted, inject } from 'vue'
import { ResourcePage, ResponsiveDialog } from '@simsustech/quasar-components'
import ContactPersonForm from '../../../components/contactperson/ContactPersonForm.vue'
import ContactPersonCard from '../../../components/contactperson/ContactPersonCard.vue'
import { useLang } from '../../../lang/index.js'
import { extend } from 'quasar'
import { EventBus } from 'quasar'
import { useAccountGetCustomerQuery } from 'src/queries/account/customer.js'
import { useAccountGetContactPeopleQuery } from 'src/queries/account/contactperson.js'
import {
  useAccountCreateContactPersonMutation,
  useAccountUpdateContactPersonMutation
} from 'src/mutations/account/contactperson.js'

const bus = inject<EventBus>('bus')!
bus.on('account-open-contact-people-create-dialog', () => {
  if (openCreateDialog)
    openCreateDialog({
      done: () => {}
    })
})

const lang = useLang()

// const { data: customerData, execute: executeCustomer } = useQuery(
//   'user.getCustomer',
//   {
//     // immediate: true
//   }
// )

// const { data, execute } = useQuery('user.getContactPeople', {
//   // immediate: true
// })

const { customer: customerData, refetch: executeCustomer } =
  useAccountGetCustomerQuery()
const { contactPeople: data, refetch: execute } =
  useAccountGetContactPeopleQuery()
const { mutateAsync: createContactPersonMutation } =
  useAccountCreateContactPersonMutation()
const { mutateAsync: updateContactPersonMutation } =
  useAccountUpdateContactPersonMutation()

// const modelValue = ref({
//   firstName: '',
//   lastName: '',
//   telephoneNumber: ''
// })
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

  try {
    await updateContactPersonMutation(contactPerson)

    done()
    await execute()
  } catch (e) {}
}

const createContactPerson: InstanceType<
  typeof ContactPersonForm
>['$props']['onSubmit'] = async ({ contactPerson, done }) => {
  delete contactPerson.customerId

  try {
    await createContactPersonMutation(contactPerson)

    done()
    await execute()
  } catch (e) {}
}

const ready = ref<boolean>(false)
onMounted(async () => {
  await executeCustomer()
  await execute()
  ready.value = true
})
</script>

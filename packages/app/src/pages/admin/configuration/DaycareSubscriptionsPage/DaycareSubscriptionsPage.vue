<template>
  <q-page padding>
    <q-banner>
      <template #avatar>
        <q-icon name="i-mdi-info" color="info" />
      </template>
      {{ lang.daycareSubscription.messages.addDaycareSubscriptionNotification }}
    </q-banner>
    <daycareSubscriptions-list
      v-if="daycareSubscriptions"
      :model-value="daycareSubscriptions"
      show-edit-button
      show-delete-button
      @update="openUpdateDaycareSubscriptionDialog"
      @delete="openDeleteDaycareSubscriptionDialog"
    />
  </q-page>
  <responsive-dialog
    ref="createDaycareSubscriptionDialogRef"
    padding
    :icons="{ close: 'i-mdi-close' }"
    persistent
    @submit="create"
  >
    <daycareSubscription-form
      ref="createDaycareSubscriptionFormRef"
      @submit="createDaycareSubscription"
    />
  </responsive-dialog>
  <responsive-dialog
    ref="updateDaycareSubscriptionDialogRef"
    padding
    :icons="{ close: 'i-mdi-close' }"
    persistent
    @submit="update"
  >
    <daycareSubscription-form
      ref="updateDaycareSubscriptionFormRef"
      @submit="updateDaycareSubscription"
    />
  </responsive-dialog>
</template>

<script lang="ts">
export default {
  name: 'AdminDaycareSubscriptionsPage'
}
</script>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { useLang } from '../../../../lang/index.js'
import { ResponsiveDialog, ResourcePage } from '@simsustech/quasar-components'
import { DaycareSubscription } from '@petboarding/api/zod'
import DaycareSubscriptionForm from '../../../../components/daycareSubscription/DaycareSubscriptionForm.vue'
import DaycareSubscriptionsList from '../../../../components/daycareSubscription/DaycareSubscriptionsList.vue'
import { useQuasar } from 'quasar'
import { EventBus } from 'quasar'
import { inject } from 'vue'
import {
  useConfigurationCreateDaycareSubscriptionMutation,
  useConfigurationDeleteDaycareSubscriptionMutation,
  useConfigurationUpdateDaycareSubscriptionMutation
} from 'src/mutations/configuration/daycareSubscription.js'
import { useConfigurationGetDaycareSubscriptionsQuery } from 'src/queries/configuration/daycareSubscription.js'

const bus = inject<EventBus>('bus')!
bus.on(
  'administrator-configuration-open-daycare-subscriptions-create-dialog',
  () => {
    if (openCreateDialog)
      openCreateDialog({
        done: () => {}
      })
  }
)

const { daycareSubscriptions, refetch: execute } =
  useConfigurationGetDaycareSubscriptionsQuery()

const { mutateAsync: createDaycareSubscriptionMutation } =
  useConfigurationCreateDaycareSubscriptionMutation()
const { mutateAsync: updateDaycareSubscriptionMutation } =
  useConfigurationUpdateDaycareSubscriptionMutation()
const { mutateAsync: deleteDaycareSubscriptionMutation } =
  useConfigurationDeleteDaycareSubscriptionMutation()

const lang = useLang()
const $q = useQuasar()

const createDaycareSubscriptionDialogRef =
  ref<InstanceType<typeof ResponsiveDialog>>()
const createDaycareSubscriptionFormRef =
  ref<InstanceType<typeof DaycareSubscriptionForm>>()
const openCreateDialog: InstanceType<
  typeof ResourcePage
>['$props']['onCreate'] = () => {
  createDaycareSubscriptionDialogRef.value?.functions.open()
}

const create: InstanceType<
  typeof ResponsiveDialog
>['$props']['onSubmit'] = async ({ done }) => {
  const afterCreate = (success?: boolean) => {
    done(success)
    execute()
  }
  createDaycareSubscriptionFormRef.value?.functions.submit({
    done: afterCreate
  })
}

const createDaycareSubscription: InstanceType<
  typeof DaycareSubscriptionForm
>['$props']['onSubmit'] = async ({ data, done }) => {
  try {
    await createDaycareSubscriptionMutation(data)
    done(true)
    await execute()
  } catch (e) {
    done(false)
  }
}

const updateDaycareSubscriptionDialogRef = ref<typeof ResponsiveDialog>()
const updateDaycareSubscriptionFormRef = ref<typeof DaycareSubscriptionForm>()

const openUpdateDaycareSubscriptionDialog = ({
  data
}: {
  data: DaycareSubscription
}) => {
  updateDaycareSubscriptionDialogRef.value?.functions.open()
  nextTick(() => {
    updateDaycareSubscriptionFormRef.value?.functions.setValue(data)
  })
}

const update: InstanceType<
  typeof ResponsiveDialog
>['$props']['onSubmit'] = async ({ done }) => {
  const afterUpdate = (success?: boolean) => {
    done(success)
    execute()
  }
  updateDaycareSubscriptionFormRef.value?.functions.submit({
    done: afterUpdate
  })
}

const updateDaycareSubscription: InstanceType<
  typeof DaycareSubscriptionForm
>['$props']['onSubmit'] = async ({ data, done }) => {
  try {
    await updateDaycareSubscriptionMutation(data)
    done(true)
    await execute()
  } catch (e) {
    done(false)
  }
}

const openDeleteDaycareSubscriptionDialog = ({
  data
}: {
  data: DaycareSubscription
}) => {
  $q.dialog({
    html: true,
    cancel: true,
    message: `${lang.value.daycareSubscription.messages.verifyDeletion}<br />
    ${lang.value.daycareSubscription.fields.description}: ${data.description}<br />
    `
  }).onOk(async () => {
    try {
      await deleteDaycareSubscriptionMutation({ id: data.id })
      await execute()
    } catch (e) {}
  })
}

onMounted(async () => {
  execute()
})
</script>

<template>
  <resource-page type="create" @create="openCreateDialog">
    <template #header>
      {{ lang.daycareSubscription.title }}
    </template>
    <q-banner>
      <template #avatar>
        <q-icon name="info" color="info" />
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
  </resource-page>
  <responsive-dialog
    ref="createDaycareSubscriptionDialogRef"
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
import { useLang } from '../../../lang/index.js'
import { ResponsiveDialog, ResourcePage } from '@simsustech/quasar-components'
import { createUseTrpc } from '../../../trpc.js'
import { DaycareSubscription } from '@petboarding/api/zod'
import DaycareSubscriptionForm from '../../../components/daycareSubscription/DaycareSubscriptionForm.vue'
import DaycareSubscriptionsList from '../../../components/daycareSubscription/DaycareSubscriptionsList.vue'
import { useQuasar } from 'quasar'
const { useQuery, useMutation } = await createUseTrpc()

const { data: daycareSubscriptions, execute } = useQuery(
  'configuration.getDaycareSubscriptions',
  {}
)

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
  const result = useMutation('configuration.createDaycareSubscription', {
    args: data,
    immediate: true
  })

  await result.immediatePromise

  if (done) done(!result.error.value)
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
  const result = useMutation('configuration.updateDaycareSubscription', {
    args: data,
    immediate: true
  })

  await result.immediatePromise

  if (done) done(!result.error.value)
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
    const result = useMutation('configuration.deleteDaycareSubscription', {
      args: {
        id: data.id!
      },
      immediate: true
    })

    await result.immediatePromise
    if (!result.error.value) await execute()
  })
}

onMounted(async () => {
  execute()
})
</script>

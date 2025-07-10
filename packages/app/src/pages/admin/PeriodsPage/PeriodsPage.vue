<template>
  <q-page padding>
    <periods-list
      v-if="periods"
      :model-value="periods"
      show-edit-button
      show-delete-button
      @update="openUpdatePeriodDialog"
      @delete="openDeletePeriodDialog"
    />
  </q-page>
  <responsive-dialog
    ref="createPeriodDialogRef"
    padding
    :icons="{ close: 'i-mdi-close' }"
    persistent
    @submit="create"
  >
    <period-form ref="createPeriodFormRef" @submit="createPeriod" />
  </responsive-dialog>
  <responsive-dialog
    ref="updatePeriodDialogRef"
    padding
    :icons="{ close: 'i-mdi-close' }"
    persistent
    @submit="update"
  >
    <period-form ref="updatePeriodFormRef" @submit="updatePeriod" />
  </responsive-dialog>
</template>

<script lang="ts">
export default {
  name: 'AdminPeriodsPage'
}
</script>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { useLang } from '../../../lang/index.js'
import { ResponsiveDialog, ResourcePage } from '@simsustech/quasar-components'
import { Period } from '@petboarding/api/zod'
import PeriodForm from '../../../components/period/PeriodForm.vue'
import PeriodsList from '../../../components/period/PeriodsList.vue'
import { useQuasar } from 'quasar'

import { EventBus } from 'quasar'
import { inject } from 'vue'
import { useConfigurationGetPeriodsQuery } from 'src/queries/configuration/period.js'
import {
  useConfigurationCreatePeriodMutation,
  useConfigurationDeletePeriodMutation,
  useConfigurationUpdatePeriodMutation
} from 'src/mutations/configuration/period.js'

const bus = inject<EventBus>('bus')!
bus.on('administrator-open-periods-create-dialog', () => {
  if (openCreateDialog)
    openCreateDialog({
      done: () => {}
    })
})

const { periods, refetch: execute } = useConfigurationGetPeriodsQuery()
const { mutateAsync: createPeriodMutation } =
  useConfigurationCreatePeriodMutation()
const { mutateAsync: updatePeriodMutation } =
  useConfigurationUpdatePeriodMutation()
const { mutateAsync: deletePeriodMutation } =
  useConfigurationDeletePeriodMutation()

const lang = useLang()
const $q = useQuasar()
const createPeriodDialogRef = ref<InstanceType<typeof ResponsiveDialog>>()
const createPeriodFormRef = ref<InstanceType<typeof PeriodForm>>()
const openCreateDialog: InstanceType<
  typeof ResourcePage
>['$props']['onCreate'] = () => {
  createPeriodDialogRef.value?.functions.open()
}

const create: InstanceType<
  typeof ResponsiveDialog
>['$props']['onSubmit'] = async ({ done }) => {
  const afterCreate = (success?: boolean) => {
    done(success)
    execute()
  }
  createPeriodFormRef.value?.functions.submit({ done: afterCreate })
}

const createPeriod: InstanceType<
  typeof PeriodForm
>['$props']['onSubmit'] = async ({ data, done }) => {
  try {
    await createPeriodMutation(data)
    done(true)
    await execute()
  } catch (e) {
    done(false)
  }
}

const updatePeriodDialogRef = ref<typeof ResponsiveDialog>()
const updatePeriodFormRef = ref<typeof PeriodForm>()

const openUpdatePeriodDialog = ({ data }: { data: Period }) => {
  updatePeriodDialogRef.value?.functions.open()
  nextTick(() => {
    updatePeriodFormRef.value?.functions.setValue(data)
  })
}

const update: InstanceType<
  typeof ResponsiveDialog
>['$props']['onSubmit'] = async ({ done }) => {
  const afterUpdate = (success?: boolean) => {
    done(success)
    execute()
  }
  updatePeriodFormRef.value?.functions.submit({ done: afterUpdate })
}

const updatePeriod: InstanceType<
  typeof PeriodForm
>['$props']['onSubmit'] = async ({ data, done }) => {
  try {
    await updatePeriodMutation(data)
    done(true)
    await execute()
  } catch (e) {
    done(false)
  }
}

const openDeletePeriodDialog = ({ data }: { data: Period }) => {
  $q.dialog({
    html: true,
    cancel: true,
    message: `${lang.value.period.messages.verifyDeletion}<br />
    ${lang.value.period.fields.startDate}: ${data.startDate}<br />
    ${lang.value.period.fields.endDate}: ${data.endDate}
    `
  }).onOk(async () => {
    try {
      await deletePeriodMutation({ id: data.id })
      await execute()
    } catch (e) {}
  })
}

onMounted(async () => {
  execute()
})
</script>

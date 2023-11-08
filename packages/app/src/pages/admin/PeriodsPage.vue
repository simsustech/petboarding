<template>
  <resource-page type="create" @create="openCreateDialog">
    <template #header>
      {{ lang.configuration.periods }}
    </template>
    <periods-list
      v-if="periods"
      :model-value="periods"
      show-edit-button
      show-delete-button
      @update="openUpdatePeriodDialog"
      @delete="openDeletePeriodDialog"
    />
  </resource-page>
  <responsive-dialog ref="createPeriodDialogRef" persistent @submit="create">
    <period-form ref="createPeriodFormRef" @submit="createPeriod" />
  </responsive-dialog>
  <responsive-dialog ref="updatePeriodDialogRef" persistent @submit="update">
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
import { useLang } from '../../lang/index.js'
import { ResponsiveDialog, ResourcePage } from '@simsustech/quasar-components'
import { createUseTrpc } from '../../trpc.js'
import { Period } from '@petboarding/api/zod'
import PeriodForm from '../../components/period/PeriodForm.vue'
import PeriodsList from '../../components/period/PeriodsList.vue'
import { useQuasar } from 'quasar'
const { useQuery, useMutation } = await createUseTrpc()

const { data: periods, execute } = useQuery('configuration.getPeriods', {})

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
  const result = useMutation('configuration.createPeriod', {
    args: data,
    immediate: true
  })

  await result.immediatePromise

  if (done) done(!result.error.value)
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
  const result = useMutation('configuration.updatePeriod', {
    args: data,
    immediate: true
  })

  await result.immediatePromise

  if (done) done(!result.error.value)
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
    const result = useMutation('configuration.deletePeriod', {
      args: data.id,
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

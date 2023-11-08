<template>
  <resource-page type="create" @create="openCreateDialog">
    <template #header>
      {{ lang.configuration.openingTimes }}
    </template>

    <opening-times-list
      v-if="openingTimes"
      :model-value="openingTimes"
      show-edit-button
      show-delete-button
      @update="openUpdateOpeningTimeDialog"
      @delete="openDeleteOpeningTimeDialog"
    />
  </resource-page>
  <responsive-dialog
    ref="createOpeningTimeDialogRef"
    persistent
    @submit="create"
  >
    <opening-time-form
      ref="createOpeningTimeFormRef"
      :unavailable-holidays-options="unavailableHolidaysOptions"
      @submit="createOpeningTime"
    />
  </responsive-dialog>
  <responsive-dialog
    ref="updateOpeningTimeDialogRef"
    persistent
    @submit="update"
  >
    <opening-time-form
      ref="updateOpeningTimeFormRef"
      :unavailable-holidays-options="unavailableHolidaysOptions"
      @submit="updateOpeningTime"
    />
  </responsive-dialog>
</template>

<script lang="ts">
export default {
  name: 'AdminOpeningTimesPage'
}
</script>

<script setup lang="ts">
import { nextTick, onMounted, ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useLang } from '../../../lang/index.js'
import { ResponsiveDialog, ResourcePage } from '@simsustech/quasar-components'
import { createUseTrpc } from '../../../trpc.js'
import { OpeningTime } from '@petboarding/api/zod'
import OpeningTimeForm from '../../../components/booking/OpeningTimeForm.vue'
import OpeningTimesList from '../../../components/openingTime/OpeningTimesList.vue'
import { useConfiguration } from '../../../configuration.js'
const { useQuery, useMutation } = await createUseTrpc()
const $q = useQuasar()
const configuration = useConfiguration()

const { data: openingTimes, execute } = useQuery(
  'configuration.getOpeningTimes',
  {}
)

const { data: holidays, execute: executeHolidays } = useQuery(
  'configuration.getHolidays',
  {
    args: {
      country: configuration.value.COUNTRY,
      language: $q.lang.isoName.substring(0, 2)
    }
  }
)

const unavailableHolidaysOptions = computed(() => {
  return holidays.value?.map((v, i) => ({
    label: v.name,
    value: v.rule
  }))
})

const lang = useLang()

const createOpeningTimeDialogRef = ref<InstanceType<typeof ResponsiveDialog>>()
const createOpeningTimeFormRef = ref<InstanceType<typeof OpeningTimeForm>>()
const openCreateDialog: InstanceType<
  typeof ResourcePage
>['$props']['onCreate'] = () => {
  createOpeningTimeDialogRef.value?.functions.open()
}

const create: InstanceType<
  typeof ResponsiveDialog
>['$props']['onSubmit'] = async ({ done }) => {
  const afterCreate = (success?: boolean) => {
    done(success)
    execute()
  }
  createOpeningTimeFormRef.value?.functions.submit({ done: afterCreate })
}

const createOpeningTime: InstanceType<
  typeof OpeningTimeForm
>['$props']['onSubmit'] = async ({ data, done }) => {
  const result = useMutation('configuration.createOpeningTime', {
    args: data,
    immediate: true
  })

  await result.immediatePromise

  if (done) done(!result.error.value)
}

const updateOpeningTimeDialogRef = ref<typeof ResponsiveDialog>()
const updateOpeningTimeFormRef = ref<typeof OpeningTimeForm>()

const openUpdateOpeningTimeDialog = ({ data }: { data: OpeningTime }) => {
  updateOpeningTimeDialogRef.value?.functions.open()
  nextTick(() => {
    updateOpeningTimeFormRef.value?.functions.setValue(data)
  })
}

const update: InstanceType<
  typeof ResponsiveDialog
>['$props']['onSubmit'] = async ({ done }) => {
  const afterUpdate = (success?: boolean) => {
    done(success)
    execute()
  }
  updateOpeningTimeFormRef.value?.functions.submit({ done: afterUpdate })
}

const updateOpeningTime: InstanceType<
  typeof OpeningTimeForm
>['$props']['onSubmit'] = async ({ data, done }) => {
  const result = useMutation('configuration.updateOpeningTime', {
    args: data,
    immediate: true
  })

  await result.immediatePromise

  if (done) done(!result.error.value)
}

const openDeleteOpeningTimeDialog = ({ data }: { data: OpeningTime }) => {
  $q.dialog({
    html: true,
    cancel: true,
    message: `${lang.value.openingTime.messages.verifyDeletion}<br />
    ${lang.value.openingTime.fields.startTime}: ${data.startTime}<br />
    ${lang.value.openingTime.fields.endTime}: ${data.endTime}
    `
  }).onOk(async () => {
    const result = useMutation('configuration.deleteOpeningTime', {
      args: data.id,
      immediate: true
    })

    await result.immediatePromise
    if (!result.error.value) await execute()
  })
}
onMounted(async () => {
  execute()
  executeHolidays()
})
</script>

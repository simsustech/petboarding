<template>
  <q-page padding @create="openCreateDialog">
    <opening-times-list
      v-if="openingTimes"
      :model-value="openingTimes"
      show-edit-button
      show-delete-button
      @update="openUpdateOpeningTimeDialog"
      @delete="openDeleteOpeningTimeDialog"
    />
  </q-page>
  <responsive-dialog
    ref="createOpeningTimeDialogRef"
    padding
    :icons="{ close: 'i-mdi-close' }"
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
    padding
    :icons="{ close: 'i-mdi-close' }"
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
import { useLang } from '../../../../lang/index.js'
import { ResponsiveDialog, ResourcePage } from '@simsustech/quasar-components'
import { OpeningTime } from '@petboarding/api/zod'
import OpeningTimeForm from '../../../../components/booking/OpeningTimeForm.vue'
import OpeningTimesList from '../../../../components/openingTime/OpeningTimesList.vue'
import { EventBus } from 'quasar'
import { inject } from 'vue'
import {
  useConfigurationGetHolidaysQuery,
  useConfigurationGetOpeningTimesQuery
} from '../../../../queries/configuration/openingTime.js'
import {
  useConfigurationCreateOpeningTimeMutation,
  useConfigurationDeleteOpeningTimeMutation,
  useConfigurationUpdateOpeningTimeMutation
} from '../../../../mutations/configuration/openingTime.js'

const bus = inject<EventBus>('bus')!
bus.on('administrator-configuration-open-opening-times-create-dialog', () => {
  if (openCreateDialog)
    openCreateDialog({
      done: () => {}
    })
})
const $q = useQuasar()

const { holidays, refetch: executeHolidays } =
  useConfigurationGetHolidaysQuery()

const { openingTimes, refetch: execute } =
  useConfigurationGetOpeningTimesQuery()

const { mutateAsync: createOpeningTimeMutation } =
  useConfigurationCreateOpeningTimeMutation()
const { mutateAsync: updateOpeningTimeMutation } =
  useConfigurationUpdateOpeningTimeMutation()
const { mutateAsync: deleteOpeningTimeMutation } =
  useConfigurationDeleteOpeningTimeMutation()

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
  try {
    await createOpeningTimeMutation(data)
    done(true)
    await execute()
  } catch (e) {
    done(false)
  }
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
  try {
    await updateOpeningTimeMutation(data)
    done(true)
    await execute()
  } catch (e) {
    done(false)
  }
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
    try {
      await deleteOpeningTimeMutation({ id: data.id })
      await execute()
    } catch (e) {}
  })
}
onMounted(async () => {
  execute()
  executeHolidays()
})
</script>

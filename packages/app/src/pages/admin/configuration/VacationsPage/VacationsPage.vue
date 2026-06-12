<template>
  <q-page padding>
    <vacations-list
      v-if="vacations"
      :model-value="vacations"
      show-edit-button
      show-delete-button
      @update="openUpdateVacationDialog"
      @delete="openDeleteVacationDialog"
    />
  </q-page>
  <responsive-dialog
    ref="createVacationDialogRef"
    padding
    :icons="{ close: 'i-mdi-close' }"
    persistent
    @submit="create"
  >
    <vacation-form ref="createVacationFormRef" @submit="createVacation" />
  </responsive-dialog>
  <responsive-dialog
    ref="updateVacationDialogRef"
    padding
    :icons="{ close: 'i-mdi-close' }"
    persistent
    @submit="update"
  >
    <vacation-form ref="updateVacationFormRef" @submit="updateVacation" />
  </responsive-dialog>
</template>

<script lang="ts">
export default {
  name: 'AdminVacationsPage'
}
</script>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { useLang } from '../../../../lang/index.js'
import { ResponsiveDialog } from '@simsustech/quasar-components'
import VacationForm from '../../../../components/vacation/VacationForm.vue'
import VacationsList from '../../../../components/vacation/VacationsList.vue'
import { useQuasar } from 'quasar'

import { EventBus } from 'quasar'
import { inject } from 'vue'
import { useConfigurationGetVacationsQuery } from '../../../../queries/configuration/vacation.js'
import {
  useConfigurationCreateVacationMutation,
  useConfigurationDeleteVacationMutation,
  useConfigurationUpdateVacationMutation
} from 'src/mutations/configuration/vacation.js'

const bus = inject<EventBus>('bus')!
bus.on('administrator-open-vacations-create-dialog', () => {
  createVacationDialogRef.value?.functions.open()
})

const { vacations, refetch: execute } = useConfigurationGetVacationsQuery()
const { mutateAsync: createVacationMutation } =
  useConfigurationCreateVacationMutation()
const { mutateAsync: updateVacationMutation } =
  useConfigurationUpdateVacationMutation()
const { mutateAsync: deleteVacationMutation } =
  useConfigurationDeleteVacationMutation()

interface VacationData {
  id?: number
  name: string
  startDate: string
  endDate: string
}

const lang = useLang()
const $q = useQuasar()
const createVacationDialogRef = ref<InstanceType<typeof ResponsiveDialog>>()
const createVacationFormRef = ref<InstanceType<typeof VacationForm>>()

const create: InstanceType<
  typeof ResponsiveDialog
>['$props']['onSubmit'] = async ({ done }) => {
  const afterCreate = (success?: boolean) => {
    done(success)
    execute()
  }
  createVacationFormRef.value?.functions.submit({ done: afterCreate })
}

const createVacation: InstanceType<
  typeof VacationForm
>['$props']['onSubmit'] = async ({ data, done }) => {
  try {
    await createVacationMutation(data)
    done(true)
    await execute()
  } catch (e) {
    done(false)
  }
}

const updateVacationDialogRef = ref<typeof ResponsiveDialog>()
const updateVacationFormRef = ref<typeof VacationForm>()

const openUpdateVacationDialog = ({ data }: { data: VacationData }) => {
  updateVacationDialogRef.value?.functions.open()
  nextTick(() => {
    updateVacationFormRef.value?.functions.setValue(data)
  })
}

const update: InstanceType<
  typeof ResponsiveDialog
>['$props']['onSubmit'] = async ({ done }) => {
  const afterUpdate = (success?: boolean) => {
    done(success)
    execute()
  }
  updateVacationFormRef.value?.functions.submit({ done: afterUpdate })
}

const updateVacation: InstanceType<
  typeof VacationForm
>['$props']['onSubmit'] = async ({ data, done }) => {
  try {
    await updateVacationMutation(data)
    done(true)
    await execute()
  } catch (e) {
    done(false)
  }
}

const openDeleteVacationDialog = ({ data }: { data: VacationData }) => {
  $q.dialog({
    html: true,
    cancel: true,
    message: `${lang.value.vacation.messages.verifyDeletion}<br />
    ${data.name}: ${data.startDate} - ${data.endDate}`
  }).onOk(async () => {
    try {
      await deleteVacationMutation({ id: data.id! })
      await execute()
    } catch (e) {}
  })
}

onMounted(async () => {
  execute()
})
</script>

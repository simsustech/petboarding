<template>
  <q-page padding @create="openCreateDialog">
    <buildings-list
      v-if="buildings"
      :model-value="buildings"
      show-edit-button
      show-delete-button
      @update="openUpdateBuildingDialog"
      @delete="openDeleteBuildingDialog"
    />
  </q-page>
  <responsive-dialog
    ref="createBuildingDialogRef"
    padding
    :icons="{ close: 'i-mdi-close' }"
    persistent
    @submit="create"
  >
    <building-form ref="createBuildingFormRef" @submit="createBuilding" />
  </responsive-dialog>
  <responsive-dialog
    ref="updateBuildingDialogRef"
    padding
    :icons="{ close: 'i-mdi-close' }"
    persistent
    @submit="update"
  >
    <building-form ref="updateBuildingFormRef" @submit="updateBuilding" />
  </responsive-dialog>
</template>

<script lang="ts">
export default {
  name: 'AdminBuildingsPage'
}
</script>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { useLang } from '../../../../lang/index.js'
import { ResponsiveDialog, ResourcePage } from '@simsustech/quasar-components'
import { Building } from '@petboarding/api/zod'
import BuildingForm from '../../../../components/building/BuildingForm.vue'
import BuildingsList from '../../../../components/building/BuildingsList.vue'
import { useQuasar } from 'quasar'
import { EventBus } from 'quasar'
import { inject } from 'vue'
import {
  useConfigurationCreateBuildingMutation,
  useConfigurationDeleteBuildingMutation,
  useConfigurationUpdateBuildingMutation
} from 'src/mutations/configuration/building.js'
import { useConfigurationGetBuildingsQuery } from 'src/queries/configuration/building.js'

const bus = inject<EventBus>('bus')!
bus.on('administrator-configuration-open-buildings-create-dialog', () => {
  if (openCreateDialog)
    openCreateDialog({
      done: () => {}
    })
})

const { buildings, refetch: execute } = useConfigurationGetBuildingsQuery()

const { mutateAsync: createBuildingMutation } =
  useConfigurationCreateBuildingMutation()
const { mutateAsync: updateBuildingMutation } =
  useConfigurationUpdateBuildingMutation()
const { mutateAsync: deleteBuildingMutation } =
  useConfigurationDeleteBuildingMutation()

const lang = useLang()
const $q = useQuasar()

const createBuildingDialogRef = ref<InstanceType<typeof ResponsiveDialog>>()
const createBuildingFormRef = ref<InstanceType<typeof BuildingForm>>()
const openCreateDialog: InstanceType<
  typeof ResourcePage
>['$props']['onCreate'] = () => {
  createBuildingDialogRef.value?.functions.open()
}

const create: InstanceType<
  typeof ResponsiveDialog
>['$props']['onSubmit'] = async ({ done }) => {
  const afterCreate = (success?: boolean) => {
    done(success)
    execute()
  }
  createBuildingFormRef.value?.functions.submit({ done: afterCreate })
}

const createBuilding: InstanceType<
  typeof BuildingForm
>['$props']['onSubmit'] = async ({ data, done }) => {
  try {
    await createBuildingMutation(data)
    done(true)
    await execute()
  } catch (e) {
    done(false)
  }
}

const updateBuildingDialogRef = ref<typeof ResponsiveDialog>()
const updateBuildingFormRef = ref<typeof BuildingForm>()

const openUpdateBuildingDialog = ({ data }: { data: Building }) => {
  updateBuildingDialogRef.value?.functions.open()
  nextTick(() => {
    updateBuildingFormRef.value?.functions.setValue(data)
  })
}

const update: InstanceType<
  typeof ResponsiveDialog
>['$props']['onSubmit'] = async ({ done }) => {
  const afterUpdate = (success?: boolean) => {
    done(success)
    execute()
  }
  updateBuildingFormRef.value?.functions.submit({ done: afterUpdate })
}

const updateBuilding: InstanceType<
  typeof BuildingForm
>['$props']['onSubmit'] = async ({ data, done }) => {
  try {
    await updateBuildingMutation(data)
    done(true)
    await execute()
  } catch (e) {
    done(false)
  }
}

const openDeleteBuildingDialog = ({ data }: { data: Building }) => {
  $q.dialog({
    html: true,
    cancel: true,
    message: `${lang.value.building.messages.verifyDeletion}<br />
    ${lang.value.building.fields.name}: ${data.name}<br />
    ${lang.value.building.fields.location}: ${data.location}
    `
  }).onOk(async () => {
    try {
      await deleteBuildingMutation({ id: data.id })
      await execute()
    } catch (e) {}
  })
}

onMounted(async () => {
  execute()
})
</script>

<template>
  <resource-page
    padding
    :icons="{ add: 'i-mdi-add', edit: 'i-mdi-edit' }"
    type="create"
    @create="openCreateDialog"
  >
    <template #header>
      {{ lang.building.title }}
    </template>
    <buildings-list
      v-if="buildings"
      :model-value="buildings"
      show-edit-button
      show-delete-button
      @update="openUpdateBuildingDialog"
      @delete="openDeleteBuildingDialog"
    />
  </resource-page>
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
import { useLang } from '../../../lang/index.js'
import { ResponsiveDialog, ResourcePage } from '@simsustech/quasar-components'
import { createUseTrpc } from '../../../trpc.js'
import { Building } from '@petboarding/api/zod'
import BuildingForm from '../../../components/building/BuildingForm.vue'
import BuildingsList from '../../../components/building/BuildingsList.vue'
import { useQuasar } from 'quasar'
const { useQuery, useMutation } = await createUseTrpc()

const { data: buildings, execute } = useQuery('configuration.getBuildings', {})

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
  const result = useMutation('configuration.createBuilding', {
    args: data,
    immediate: true
  })

  await result.immediatePromise

  if (done) done(!result.error.value)
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
  const result = useMutation('configuration.updateBuilding', {
    args: data,
    immediate: true
  })

  await result.immediatePromise

  if (done) done(!result.error.value)
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
    const result = useMutation('configuration.deleteBuilding', {
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

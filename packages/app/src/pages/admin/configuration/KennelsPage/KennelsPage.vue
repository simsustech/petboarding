<template>
  <q-page padding @create="openCreateDialog">
    <kennels-list
      v-if="kennels"
      :model-value="kennels"
      show-edit-button
      show-delete-button
      @update="openUpdateKennelDialog"
      @delete="openDeleteKennelDialog"
    />
  </q-page>
  <responsive-dialog
    ref="createKennelDialogRef"
    padding
    :icons="{ close: 'i-mdi-close' }"
    persistent
    @submit="create"
  >
    <kennel-form
      ref="createKennelFormRef"
      :buildings="buildings"
      @submit="createKennel"
    />
  </responsive-dialog>
  <responsive-dialog
    ref="updateKennelDialogRef"
    padding
    :icons="{ close: 'i-mdi-close' }"
    persistent
    @submit="update"
  >
    <kennel-form
      ref="updateKennelFormRef"
      :buildings="buildings"
      @submit="updateKennel"
    />
  </responsive-dialog>
</template>

<script lang="ts">
export default {
  name: 'AdminKennelsPage'
}
</script>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { useLang } from '../../../../lang/index.js'
import { ResponsiveDialog, ResourcePage } from '@simsustech/quasar-components'
import { Kennel } from '@petboarding/api/zod'
import KennelForm from '../../../../components/kennel/KennelForm.vue'
import KennelsList from '../../../../components/kennel/KennelsList.vue'
import { useQuasar } from 'quasar'

import { EventBus } from 'quasar'
import { inject } from 'vue'
import { useConfigurationGetBuildingsQuery } from 'src/queries/configuration/building.js'
import { useConfigurationGetKennelsQuery } from 'src/queries/configuration/kennel.js'
import {
  useConfigurationCreateKennelMutation,
  useConfigurationDeleteKennelMutation,
  useConfigurationUpdateKennelMutation
} from 'src/mutations/configuration/kennel.js'

const bus = inject<EventBus>('bus')!
bus.on('administrator-configuration-open-kennels-create-dialog', () => {
  if (openCreateDialog)
    openCreateDialog({
      done: () => {}
    })
})

const { buildings, refetch: executeBuildings } =
  useConfigurationGetBuildingsQuery()

const { kennels, refetch: execute } = useConfigurationGetKennelsQuery()

const { mutateAsync: createKennelMutation } =
  useConfigurationCreateKennelMutation()
const { mutateAsync: updateKennelMutation } =
  useConfigurationUpdateKennelMutation()
const { mutateAsync: deleteKennelMutation } =
  useConfigurationDeleteKennelMutation()

const lang = useLang()
const $q = useQuasar()

const createKennelDialogRef = ref<InstanceType<typeof ResponsiveDialog>>()
const createKennelFormRef = ref<InstanceType<typeof KennelForm>>()
const openCreateDialog: InstanceType<
  typeof ResourcePage
>['$props']['onCreate'] = () => {
  createKennelDialogRef.value?.functions.open()
}

const create: InstanceType<
  typeof ResponsiveDialog
>['$props']['onSubmit'] = async ({ done }) => {
  const afterCreate = (success?: boolean) => {
    done(success)
    execute()
  }
  createKennelFormRef.value?.functions.submit({ done: afterCreate })
}

const createKennel: InstanceType<
  typeof KennelForm
>['$props']['onSubmit'] = async ({ data, done }) => {
  try {
    await createKennelMutation(data)
    done(true)
    await execute()
  } catch (e) {
    done(false)
  }
}

const updateKennelDialogRef = ref<typeof ResponsiveDialog>()
const updateKennelFormRef = ref<typeof KennelForm>()

const openUpdateKennelDialog = ({ data }: { data: Kennel }) => {
  updateKennelDialogRef.value?.functions.open()
  nextTick(() => {
    updateKennelFormRef.value?.functions.setValue(data)
  })
}

const update: InstanceType<
  typeof ResponsiveDialog
>['$props']['onSubmit'] = async ({ done }) => {
  const afterUpdate = (success?: boolean) => {
    done(success)
    execute()
  }
  updateKennelFormRef.value?.functions.submit({ done: afterUpdate })
}

const updateKennel: InstanceType<
  typeof KennelForm
>['$props']['onSubmit'] = async ({ data, done }) => {
  try {
    await updateKennelMutation(data)
    done(true)
    await execute()
  } catch (e) {
    done(false)
  }
}

const openDeleteKennelDialog = ({ data }: { data: Kennel }) => {
  $q.dialog({
    html: true,
    cancel: true,
    message: `${lang.value.kennel.messages.verifyDeletion}<br />
    ${lang.value.kennel.fields.name}: ${data.name}<br />
    ${lang.value.kennel.fields.building}: ${data.building?.name}
    `
  }).onOk(async () => {
    try {
      await deleteKennelMutation({ id: data.id })
      await execute()
    } catch (e) {}
  })
}

onMounted(async () => {
  execute()
  executeBuildings()
})
</script>

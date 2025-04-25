<template>
  <resource-page
    padding
    :icons="{ add: 'i-mdi-add', edit: 'i-mdi-edit' }"
    type="create"
    @create="openCreateDialog"
  >
    <template #header>
      {{ lang.kennel.title }}
    </template>
    <kennels-list
      v-if="kennels"
      :model-value="kennels"
      show-edit-button
      show-delete-button
      @update="openUpdateKennelDialog"
      @delete="openDeleteKennelDialog"
    />
  </resource-page>
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
import { useLang } from '../../../lang/index.js'
import { ResponsiveDialog, ResourcePage } from '@simsustech/quasar-components'
import { createUseTrpc } from '../../../trpc.js'
import { Kennel } from '@petboarding/api/zod'
import KennelForm from '../../../components/kennel/KennelForm.vue'
import KennelsList from '../../../components/kennel/KennelsList.vue'
import { useQuasar } from 'quasar'
const { useQuery, useMutation } = await createUseTrpc()

const { data: kennels, execute } = useQuery('configuration.getKennels', {})
const { data: buildings, execute: executeBuildings } = useQuery(
  'configuration.getBuildings'
)
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
  const result = useMutation('configuration.createKennel', {
    args: data,
    immediate: true
  })

  await result.immediatePromise

  if (done) done(!result.error.value)
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
  const result = useMutation('configuration.updateKennel', {
    args: data,
    immediate: true
  })

  await result.immediatePromise

  if (done) done(!result.error.value)
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
    const result = useMutation('configuration.deleteKennel', {
      args: data.id,
      immediate: true
    })

    await result.immediatePromise
    if (!result.error.value) await execute()
  })
}

onMounted(async () => {
  execute()
  executeBuildings()
})
</script>

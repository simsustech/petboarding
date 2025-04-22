<template>
  <resource-page
    padding
    :icons="{ add: 'i-mdi-add', edit: 'i-mdi-edit' }"
    type="create"
    @create="openCreateDialog"
  >
    <template #header>
      {{ lang.service.title }}
    </template>
    <services-list
      v-if="services"
      :model-value="services"
      show-edit-button
      show-delete-button
      @update="openUpdateServiceDialog"
      @delete="openDeleteServiceDialog"
    />
  </resource-page>
  <responsive-dialog
    padding
    :icons="{ close: 'i-mdi-close' }"
    ref="createServiceDialogRef"
    persistent
    @submit="create"
  >
    <service-form ref="createServiceFormRef" @submit="createService" />
  </responsive-dialog>
  <responsive-dialog
    padding
    :icons="{ close: 'i-mdi-close' }"
    ref="updateServiceDialogRef"
    persistent
    @submit="update"
  >
    <service-form ref="updateServiceFormRef" @submit="updateService" />
  </responsive-dialog>
</template>

<script lang="ts">
export default {
  name: 'AdminServicesPage'
}
</script>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { useLang } from '../../../lang/index.js'
import { ResponsiveDialog, ResourcePage } from '@simsustech/quasar-components'
import { createUseTrpc } from '../../../trpc.js'
import { Service } from '@petboarding/api/zod'
import { useQuasar } from 'quasar'
import ServicesList from '../../../components/service/ServicesList.vue'
import ServiceForm from '../../../components/service/ServiceForm.vue'
const { useQuery, useMutation } = await createUseTrpc()

const { data: services, execute } = useQuery('configuration.getServices', {})

const lang = useLang()
const $q = useQuasar()

const createServiceDialogRef = ref<InstanceType<typeof ResponsiveDialog>>()
const createServiceFormRef = ref<InstanceType<typeof ServiceForm>>()
const openCreateDialog: InstanceType<
  typeof ResourcePage
>['$props']['onCreate'] = () => {
  createServiceDialogRef.value?.functions.open()
}

const create: InstanceType<
  typeof ResponsiveDialog
>['$props']['onSubmit'] = async ({ done }) => {
  const afterCreate = (success?: boolean) => {
    done(success)
    execute()
  }
  createServiceFormRef.value?.functions.submit({ done: afterCreate })
}

const createService: InstanceType<
  typeof ServiceForm
>['$props']['onSubmit'] = async ({ data, done }) => {
  const result = useMutation('configuration.createService', {
    args: data,
    immediate: true
  })

  await result.immediatePromise

  if (done) done(!result.error.value)
}

const updateServiceDialogRef = ref<typeof ResponsiveDialog>()
const updateServiceFormRef = ref<typeof ServiceForm>()

const openUpdateServiceDialog = ({ data }: { data: Service }) => {
  updateServiceDialogRef.value?.functions.open()
  nextTick(() => {
    updateServiceFormRef.value?.functions.setValue(data)
  })
}

const update: InstanceType<
  typeof ResponsiveDialog
>['$props']['onSubmit'] = async ({ done }) => {
  const afterUpdate = async (success?: boolean) => {
    done(success)
    await execute()
  }
  updateServiceFormRef.value?.functions.submit({ done: afterUpdate })
}

const updateService: InstanceType<
  typeof ServiceForm
>['$props']['onSubmit'] = async ({ data, done }) => {
  const result = useMutation('configuration.updateService', {
    args: data,
    immediate: true
  })

  await result.immediatePromise

  if (done) done(!result.error.value)
}

const openDeleteServiceDialog = ({ data }: { data: Service }) => {
  $q.dialog({
    html: true,
    cancel: true,
    message: `${lang.value.service.messages.verifyDeletion}<br />
    ${lang.value.service.fields.name}: ${data.name}<br />
    `
  }).onOk(async () => {
    const result = useMutation('configuration.deleteService', {
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

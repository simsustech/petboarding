<template>
  <q-page padding @create="openCreateDialog">
    <services-list
      v-if="services"
      :model-value="services"
      show-edit-button
      show-delete-button
      @update="openUpdateServiceDialog"
      @delete="openDeleteServiceDialog"
    />
  </q-page>
  <responsive-dialog
    ref="createServiceDialogRef"
    padding
    :icons="{ close: 'i-mdi-close' }"
    persistent
    @submit="create"
  >
    <service-form ref="createServiceFormRef" @submit="createService" />
  </responsive-dialog>
  <responsive-dialog
    ref="updateServiceDialogRef"
    padding
    :icons="{ close: 'i-mdi-close' }"
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
import { useLang } from '../../../../lang/index.js'
import { ResponsiveDialog, ResourcePage } from '@simsustech/quasar-components'
import { Service } from '@petboarding/api/zod'
import { useQuasar } from 'quasar'
import ServicesList from '../../../../components/service/ServicesList.vue'
import ServiceForm from '../../../../components/service/ServiceForm.vue'
import { EventBus } from 'quasar'
import { inject } from 'vue'
import { useConfigurationGetServicesQuery } from 'src/queries/configuration/service.js'
import {
  useConfigurationCreateServiceMutation,
  useConfigurationDeleteServiceMutation,
  useConfigurationUpdateServiceMutation
} from 'src/mutations/configuration/service.js'

const bus = inject<EventBus>('bus')!
bus.on('administrator-configuration-open-services-create-dialog', () => {
  if (openCreateDialog)
    openCreateDialog({
      done: () => {}
    })
})

const { services, refetch: execute } = useConfigurationGetServicesQuery()

const { mutateAsync: createServiceMutation } =
  useConfigurationCreateServiceMutation()
const { mutateAsync: updateServiceMutation } =
  useConfigurationUpdateServiceMutation()
const { mutateAsync: deleteServiceMutation } =
  useConfigurationDeleteServiceMutation()

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
  try {
    await createServiceMutation(data)
    done(true)
    await execute()
  } catch (e) {
    done(false)
  }
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
  try {
    await updateServiceMutation(data)
    done(true)
    await execute()
  } catch (e) {
    done(false)
  }
}

const openDeleteServiceDialog = ({ data }: { data: Service }) => {
  $q.dialog({
    html: true,
    cancel: true,
    message: `${lang.value.service.messages.verifyDeletion}<br />
    ${lang.value.service.fields.name}: ${data.name}<br />
    `
  }).onOk(async () => {
    try {
      await deleteServiceMutation({ id: data.id })
      await execute()
    } catch (e) {}
  })
}

onMounted(async () => {
  execute()
})
</script>

<template>
  <q-page padding>
    <announcements-list
      v-if="announcements"
      :model-value="announcements"
      show-edit-button
      show-delete-button
      @update="openUpdateAnnouncementDialog"
      @delete="openDeleteAnnouncementDialog"
    />
  </q-page>
  <responsive-dialog
    ref="createAnnouncementDialogRef"
    padding
    :icons="{ close: 'i-mdi-close' }"
    persistent
    @submit="create"
  >
    <announcement-form
      ref="createAnnouncementFormRef"
      @submit="createAnnouncement"
    />
  </responsive-dialog>
  <responsive-dialog
    ref="updateAnnouncementDialogRef"
    padding
    :icons="{ close: 'i-mdi-close' }"
    persistent
    @submit="update"
  >
    <announcement-form
      ref="updateAnnouncementFormRef"
      @submit="updateAnnouncement"
    />
  </responsive-dialog>
</template>

<script lang="ts">
export default {
  name: 'AdminAnnouncementsPage'
}
</script>

<script setup lang="ts">
import { inject, nextTick, onMounted, ref } from 'vue'
import { useLang } from '../../../lang/index.js'
import { ResponsiveDialog, ResourcePage } from '@simsustech/quasar-components'
import { Announcement } from '@petboarding/api/zod'
import AnnouncementForm from '../../../components/announcement/AnnouncementForm.vue'
import AnnouncementsList from '../../../components/announcement/AnnouncementsList.vue'
import { useQuasar } from 'quasar'
import { EventBus } from 'quasar'
import { useConfigurationGetAnnouncementsQuery } from 'src/queries/configuration/announcement.js'
import {
  useConfigurationCreateAnnouncementMutation,
  useConfigurationDeleteAnnouncementMutation,
  useConfigurationUpdateAnnouncementMutation
} from 'src/mutations/configuration/announcement.js'

const bus = inject<EventBus>('bus')!
bus.on('administrator-open-announcements-create-dialog', () => {
  if (openCreateDialog)
    openCreateDialog({
      done: () => {}
    })
})

const { announcements, refetch: execute } =
  useConfigurationGetAnnouncementsQuery()

const { mutateAsync: createAnnouncementMutation } =
  useConfigurationCreateAnnouncementMutation()
const { mutateAsync: updateAnnouncementMutation } =
  useConfigurationUpdateAnnouncementMutation()
const { mutateAsync: deleteAnnouncementMutation } =
  useConfigurationDeleteAnnouncementMutation()

const lang = useLang()
const $q = useQuasar()

const createAnnouncementDialogRef = ref<InstanceType<typeof ResponsiveDialog>>()
const createAnnouncementFormRef = ref<InstanceType<typeof AnnouncementForm>>()
const openCreateDialog: InstanceType<
  typeof ResourcePage
>['$props']['onCreate'] = () => {
  createAnnouncementDialogRef.value?.functions.open()
}

const create: InstanceType<
  typeof ResponsiveDialog
>['$props']['onSubmit'] = async ({ done }) => {
  const afterCreate = (success?: boolean) => {
    done(success)
    execute()
  }
  createAnnouncementFormRef.value?.functions.submit({ done: afterCreate })
}

const createAnnouncement: InstanceType<
  typeof AnnouncementForm
>['$props']['onSubmit'] = async ({ data, done }) => {
  try {
    await createAnnouncementMutation(data)
    done(true)
    await execute()
  } catch (e) {}
}

const updateAnnouncementDialogRef = ref<typeof ResponsiveDialog>()
const updateAnnouncementFormRef = ref<typeof AnnouncementForm>()

const openUpdateAnnouncementDialog = ({ data }: { data: Announcement }) => {
  updateAnnouncementDialogRef.value?.functions.open()
  nextTick(() => {
    updateAnnouncementFormRef.value?.functions.setValue(data)
  })
}

const update: InstanceType<
  typeof ResponsiveDialog
>['$props']['onSubmit'] = async ({ done }) => {
  const afterUpdate = (success?: boolean) => {
    done(success)
    execute()
  }
  updateAnnouncementFormRef.value?.functions.submit({ done: afterUpdate })
}

const updateAnnouncement: InstanceType<
  typeof AnnouncementForm
>['$props']['onSubmit'] = async ({ data, done }) => {
  try {
    await updateAnnouncementMutation(data)
    done(true)
    await execute()
  } catch (e) {}
}

const openDeleteAnnouncementDialog = ({ data }: { data: Announcement }) => {
  $q.dialog({
    html: true,
    cancel: true,
    message: `${lang.value.announcement.messages.verifyDeletion}<br />
    ${lang.value.announcement.fields.title}: ${data.title}<br />
    ${lang.value.announcement.fields.message}: ${data.message}
    `
  }).onOk(async () => {
    try {
      await deleteAnnouncementMutation({ id: data.id })
      await execute()
    } catch (e) {}
  })
}

onMounted(async () => {
  execute()
})
</script>

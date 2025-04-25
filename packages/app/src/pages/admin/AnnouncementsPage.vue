<template>
  <resource-page
    padding
    :icons="{ add: 'i-mdi-add', edit: 'i-mdi-edit' }"
    type="create"
    @create="openCreateDialog"
  >
    <template #header>
      {{ lang.announcement.title }}
    </template>
    <announcements-list
      v-if="announcements"
      :model-value="announcements"
      show-edit-button
      show-delete-button
      @update="openUpdateAnnouncementDialog"
      @delete="openDeleteAnnouncementDialog"
    />
  </resource-page>
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
import { nextTick, onMounted, ref } from 'vue'
import { useLang } from '../../lang/index.js'
import { ResponsiveDialog, ResourcePage } from '@simsustech/quasar-components'
import { createUseTrpc } from '../../trpc.js'
import { Announcement } from '@petboarding/api/zod'
import AnnouncementForm from '../../components/announcement/AnnouncementForm.vue'
import AnnouncementsList from '../../components/announcement/AnnouncementsList.vue'
import { useQuasar } from 'quasar'
const { useQuery, useMutation } = await createUseTrpc()

const { data: announcements, execute } = useQuery(
  'configuration.getAnnouncements',
  {}
)

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
  const result = useMutation('configuration.createAnnouncement', {
    args: data,
    immediate: true
  })

  await result.immediatePromise

  if (done) done(!result.error.value)
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
  const result = useMutation('configuration.updateAnnouncement', {
    args: data,
    immediate: true
  })

  await result.immediatePromise

  if (done) done(!result.error.value)
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
    const result = useMutation('configuration.deleteAnnouncement', {
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

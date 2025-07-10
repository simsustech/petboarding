<template>
  <q-list>
    <q-item v-for="reply in bookingEmailReplies" :key="reply.name">
      <q-item-section>
        <q-item-label>
          {{ lang.booking.replies[EMAIL_TEMPLATES[reply.name]] }}
        </q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-btn
          icon="i-mdi-edit"
          @click="openUpdateBookingEmailReplyDialog({ data: reply })"
        />
      </q-item-section>
    </q-item>
  </q-list>

  <responsive-dialog
    ref="updateBookingEmailDialogRef"
    padding
    :icons="{ close: 'i-mdi-close' }"
    persistent
    @submit="update"
  >
    <booking-email-reply-form
      ref="updateBookingEmailReplyFormRef"
      @submit="updateBookingEmailReply"
    />
  </responsive-dialog>
</template>

<script lang="ts">
export default {
  name: 'AdminBookingEmailRepliesPage'
}
</script>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { useLang } from '../../../lang/index.js'
import { ResponsiveDialog } from '@simsustech/quasar-components'
import BookingEmailReplyForm from '../../../components/booking/BookingEmailReplyForm.vue'
import { createUseTrpc } from '../../../trpc.js'
import { EmailTemplate } from '@petboarding/api/zod'
const EMAIL_TEMPLATES = {
  approveBooking: 'approve',
  rejectBooking: 'reject',
  standbyBooking: 'standby',
  replyBooking: 'reply'
} as const

const { useQuery, useMutation } = await createUseTrpc()

const { data: bookingEmailReplies, execute } = useQuery(
  'configuration.getBookingEmailReplies',
  {}
)

const lang = useLang()

const updateBookingEmailDialogRef = ref<typeof ResponsiveDialog>()
const updateBookingEmailReplyFormRef = ref<typeof BookingEmailReplyForm>()

const openUpdateBookingEmailReplyDialog = ({
  data
}: {
  data: EmailTemplate
}) => {
  updateBookingEmailDialogRef.value?.functions.open()
  nextTick(() => {
    updateBookingEmailReplyFormRef.value?.functions.setValue(data)
  })
}

const update: InstanceType<
  typeof ResponsiveDialog
>['$props']['onSubmit'] = async ({ done }) => {
  const afterUpdate = (success?: boolean) => {
    done(success)
    execute()
  }
  updateBookingEmailReplyFormRef.value?.functions.submit({ done: afterUpdate })
}

const updateBookingEmailReply: InstanceType<
  typeof BookingEmailReplyForm
>['$props']['onSubmit'] = async ({ data, done }) => {
  const result = useMutation('configuration.updateBookingEmailReply', {
    args: data,
    immediate: true
  })

  await result.immediatePromise

  if (done) done(!result.error.value)
}

onMounted(async () => {
  execute()
})
</script>

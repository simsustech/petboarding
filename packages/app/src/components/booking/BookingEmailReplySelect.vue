<template>
  <q-select
    :model-value="modelValue"
    :options="options"
    @update:model-value="$emit('update:model-value', $event)"
  />
</template>

<script lang="ts">
export default {
  name: 'BookingEmailReplySelect'
}
</script>

<script setup lang="ts">
import { ref } from 'vue'
import { useLang } from '../../lang/index.js'

export interface Props {
  modelValue: string
}
defineProps<Props>()

const lang = useLang()

const options = ref([
  {
    label: lang.value.booking.replies.approve,
    value: 'approveBooking'
  },
  {
    label: lang.value.booking.replies.reject,
    value: 'rejectBooking'
  },
  {
    label: lang.value.booking.replies.reply,
    value: 'replyBooking'
  },
  {
    label: lang.value.booking.replies.cancel,
    value: 'cancelBooking'
  }
])
</script>

<template>
  <q-select
    :model-value="modelValue"
    :options="options"
    :label="lang.booking.fields.status"
    map-options
    emit-value
    @update:model-value="($event) => emit('update:modelValue', $event)"
  />
</template>

<script lang="ts">
export default {
  name: 'BookingStatusSelect'
}
</script>

<script setup lang="ts">
import { BOOKING_STATUS } from '@petboarding/api/zod'
import { QSelect } from 'quasar'
import { useLang } from '../../lang/index.js'
import { computed } from 'vue'

export interface Props {
  modelValue: string
}
defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
const lang = useLang()
const options = computed(() => [
  {
    label: lang.value.booking.status[BOOKING_STATUS.PENDING],
    value: BOOKING_STATUS.PENDING
  },
  {
    label: lang.value.booking.status[BOOKING_STATUS.APPROVED],
    value: BOOKING_STATUS.APPROVED
  },
  {
    label: lang.value.booking.status[BOOKING_STATUS.REJECTED],
    value: BOOKING_STATUS.REJECTED
  },
  {
    label: lang.value.booking.status[BOOKING_STATUS.STANDBY],
    value: BOOKING_STATUS.STANDBY
  },
  {
    label: lang.value.booking.status[BOOKING_STATUS.CANCELED],
    value: BOOKING_STATUS.CANCELED
  },
  {
    label: lang.value.booking.status[BOOKING_STATUS.CANCELED_OUTSIDE_PERIOD],
    value: BOOKING_STATUS.CANCELED_OUTSIDE_PERIOD
  }
])
</script>

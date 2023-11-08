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
  name: 'PeriodTypeSelect'
}
</script>
<script setup lang="ts">
import { PERIOD_TYPE } from '@petboarding/api/zod'
import { QSelect } from 'quasar'
import { useLang } from '../../lang/index.js'

export interface Props {
  modelValue: string
}
defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
const lang = useLang()
const options = [
  {
    label: lang.value.period.type[PERIOD_TYPE.UNAVAILABLE_FOR_ALL],
    value: PERIOD_TYPE.UNAVAILABLE_FOR_ALL
  },
  {
    label: lang.value.period.type[PERIOD_TYPE.UNAVAILABLE_FOR_BOOKINGS],
    value: PERIOD_TYPE.UNAVAILABLE_FOR_BOOKINGS
  },
  {
    label: lang.value.period.type[PERIOD_TYPE.UNAVAILABLE_FOR_DAYCARE],
    value: PERIOD_TYPE.UNAVAILABLE_FOR_DAYCARE
  }
]
</script>

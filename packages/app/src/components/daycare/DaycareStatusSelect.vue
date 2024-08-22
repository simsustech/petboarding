<template>
  <q-select
    :model-value="modelValue"
    :options="options"
    :label="lang.daycare.fields.status"
    map-options
    emit-value
    @update:model-value="($event) => emit('update:modelValue', $event)"
  />
</template>

<script lang="ts">
export default {
  name: 'DaycareStatusSelect'
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { useLang } from '../../lang/index.js'
import { DAYCARE_DATE_STATUS } from '@petboarding/api/zod'

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
    label: lang.value.daycare.status[DAYCARE_DATE_STATUS.PENDING],
    value: DAYCARE_DATE_STATUS.PENDING
  },
  {
    label: lang.value.daycare.status[DAYCARE_DATE_STATUS.APPROVED],
    value: DAYCARE_DATE_STATUS.APPROVED
  },
  {
    label: lang.value.daycare.status[DAYCARE_DATE_STATUS.REJECTED],
    value: DAYCARE_DATE_STATUS.REJECTED
  },
  {
    label: lang.value.daycare.status[DAYCARE_DATE_STATUS.STANDBY],
    value: DAYCARE_DATE_STATUS.STANDBY
  },
  {
    label: lang.value.daycare.status[DAYCARE_DATE_STATUS.CANCELED],
    value: DAYCARE_DATE_STATUS.CANCELED
  }
])
</script>

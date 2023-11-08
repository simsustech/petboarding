<template>
  <q-select
    :model-value="modelValue"
    :options="options"
    :label="lang.service.fields.type"
    map-options
    emit-value
    @update:model-value="($event) => emit('update:modelValue', $event)"
  />
</template>

<script lang="ts">
export default {
  name: 'ServiceTypeSelect'
}
</script>

<script setup lang="ts">
import { SERVICE_TYPE } from '@petboarding/api/zod'
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
    label: lang.value.service.type[SERVICE_TYPE.APPOINTMENT],
    value: SERVICE_TYPE.APPOINTMENT
  },
  {
    label: lang.value.service.type[SERVICE_TYPE.SURCHARGE],
    value: SERVICE_TYPE.SURCHARGE
  }
]
</script>

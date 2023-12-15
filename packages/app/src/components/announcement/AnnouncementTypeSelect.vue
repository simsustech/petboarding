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
  name: 'AnnouncementTypeSelect'
}
</script>

<script setup lang="ts">
import { ANNOUNCEMENT_TYPE } from '@petboarding/api/zod'
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
    label: lang.value.announcement.type[ANNOUNCEMENT_TYPE.GENERAL],
    value: ANNOUNCEMENT_TYPE.GENERAL
  },
  {
    label: lang.value.announcement.type[ANNOUNCEMENT_TYPE.IMPORTANT],
    value: ANNOUNCEMENT_TYPE.IMPORTANT
  },
  {
    label: lang.value.announcement.type[ANNOUNCEMENT_TYPE.PRIORITY],
    value: ANNOUNCEMENT_TYPE.PRIORITY
  }
]
</script>

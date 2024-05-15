<template>
  <q-select
    :model-value="modelValue"
    :options="options"
    :label="`${lang.openingTime.fields.type}${required ? '*' : ''}`"
    map-options
    emit-value
    @update:model-value="($event) => $emit('update:model-value', $event)"
  ></q-select>
</template>

<script setup lang="ts">
import { OPENING_TIME_TYPE } from '@petboarding/api/zod'
import { QSelect } from 'quasar'
import { computed } from 'vue'
import { useLang } from '../../lang/index.js'

export interface Props {
  modelValue: OPENING_TIME_TYPE
  required?: boolean
}
defineProps<Props>()

const lang = useLang()
const options = computed(() => [
  {
    label: lang.value.openingTime.type[OPENING_TIME_TYPE.ALL],
    value: OPENING_TIME_TYPE.ALL
  },
  {
    label: lang.value.openingTime.type[OPENING_TIME_TYPE.ARRIVAL],
    value: OPENING_TIME_TYPE.ARRIVAL
  },
  {
    label: lang.value.openingTime.type[OPENING_TIME_TYPE.DEPARTURE],
    value: OPENING_TIME_TYPE.DEPARTURE
  }
])
</script>

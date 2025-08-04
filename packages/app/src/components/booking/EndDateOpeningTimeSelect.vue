<template>
  <opening-time-select
    v-bind="$attrs"
    :model-value="modelValue"
    :required="required"
    :label="label"
    :options="openingTimes"
    @update:model-value="(e) => $emit('update:model-value', e)"
  />
</template>

<script lang="ts">
export default {
  name: 'EndDateOpeningTimeSelect'
}
</script>

<script setup lang="ts">
import { toRefs, watch } from 'vue'
import OpeningTimeSelect from './OpeningTimeSelect.vue'
import { OPENING_TIME_TYPE } from '@petboarding/api/zod'
import { usePublicGetEndDateOpeningTimesQuery } from 'src/queries/public'

export interface Props {
  modelValue?: string | number
  required?: boolean
  label: string
  date: string
  type?: OPENING_TIME_TYPE
}
const props = defineProps<Props>()

const { date } = toRefs(props)

const { openingTimes, date: openingTimesDate } =
  usePublicGetEndDateOpeningTimesQuery()

watch(date, (newVal) => {
  openingTimesDate.value = newVal
})
</script>

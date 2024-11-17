<template>
  <filtered-model-select
    v-bind="attrs"
    :label="lang.building.building"
    :filtered-options="filteredOptions"
    label-key="name"
    :label-function="labelFunction"
    :extra-fields="['rating']"
  >
    <template v-for="(_, slot) in $slots" #[slot]="scope">
      <slot :name="slot" v-bind="scope || {}" />
    </template>
  </filtered-model-select>
</template>

<script lang="ts">
export default {
  name: 'BuildingSelect'
}
</script>

<script setup lang="ts">
import { FilteredModelSelect } from '@simsustech/quasar-components/form'
import { ref, useAttrs } from 'vue'
import { useLang } from '../../lang/index.js'
import { Building } from '@petboarding/api/zod'

export interface Props {
  filteredOptions: { id: number; [key: string]: unknown }[]
}
defineProps<Props>()

const attrs = useAttrs()
const lang = useLang()

const labelFunction = ref(
  (option: Building) => `${option.name} - ${option.location}`
)
</script>

<template>
  <filtered-model-select
    v-bind="attrs"
    :label="lang.customer.customer"
    :filtered-options="filteredOptions"
    label-key="name"
    :label-function="labelFunction"
    :extra-fields="['rating']"
  >
    <template #option="{ itemProps, opt }">
      <q-item v-bind="itemProps">
        <q-item-section>
          <q-item-label>
            {{ opt.label }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-rating
            v-if="opt.extraFields.rating"
            :model-value="opt.extraFields.rating"
            icon="i-mdi-star-border"
            icon-selected="star"
            icon-half="star_half"
          />
        </q-item-section>
      </q-item>
    </template>
    <template v-for="(_, slot) in $slots" #[slot]="scope">
      <slot :name="slot" v-bind="scope || {}" />
    </template>
  </filtered-model-select>
</template>

<script lang="ts">
export default {
  name: 'CustomerSelect'
}
</script>

<script setup lang="ts">
import { FilteredModelSelect } from '@simsustech/quasar-components/form'
import { ref, useAttrs } from 'vue'
import { useLang } from '../../lang/index.js'
import { Customer } from '@petboarding/api/zod'

export interface Props {
  filteredOptions: { id: number; [key: string]: unknown }[]
}
defineProps<Props>()

const attrs = useAttrs()
const lang = useLang()

const labelFunction = ref(
  (option: Customer) =>
    `${option.firstName} ${option.lastName} - ${option.address} - ${option.city}`
)
</script>

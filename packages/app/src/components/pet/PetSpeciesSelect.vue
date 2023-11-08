<template>
  <q-select
    v-bind="attrs"
    :model-value="modelValue"
    :options="options"
    :label="`${lang.pet.fields.species}${required ? '*' : ''}`"
    emit-value
    map-options
    @update:model-value="$emit('update:model-value', $event)"
  ></q-select>
</template>

<script lang="ts">
export default {
  name: 'PetSpeciesSelect'
}
</script>

<script setup lang="ts">
import { PET_SPECIES } from '@petboarding/api/zod'
import { useAttrs } from 'vue'
import { QSelect } from 'quasar'
import { useLang } from '../../lang/index.js'
import { useConfiguration } from '../../configuration.js'

const configuration = useConfiguration()

export interface Props {
  modelValue: string
  required?: boolean
}

defineProps<Props>()
const attrs = useAttrs()

const lang = useLang()
const options = (configuration.value.ALLOWED_SPECIES || PET_SPECIES).map(
  (val) => {
    return {
      label: lang.value.pet.species[val],
      value: val
    }
  }
)
</script>

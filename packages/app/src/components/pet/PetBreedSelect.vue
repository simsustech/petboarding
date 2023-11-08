<template>
  <q-select
    v-bind="attrs"
    :model-value="modelValue"
    :options="options"
    :label="`${lang.pet.fields.breed}${required ? '*' : ''}`"
    emit-value
    map-options
    fill-input
    use-input
    input-debounce="0"
    hide-selected
    @filter="filterFn"
    @input-value="$emit('update:model-value', $event)"
    @update:model-value="$emit('update:model-value', $event)"
  ></q-select>
</template>

<script lang="ts">
export default {
  name: 'PetBreedSelect'
}
</script>
<script setup lang="ts">
import { PET_SPECIES } from '@petboarding/api/zod'
import speciesList from '../../assets/breeds.js'
import { ref, toRefs, useAttrs, watch } from 'vue'
import { QSelect, useQuasar } from 'quasar'
import { useLang } from '../../lang/index.js'

export interface Props {
  modelValue: string
  species: (typeof PET_SPECIES)[number]
  required?: boolean
}

const props = defineProps<Props>()
const attrs = useAttrs()

const { species } = toRefs(props)

const lang = useLang()
const $q = useQuasar()
const options = ref<string[]>([])
watch(
  () => species.value,
  (val) => {
    options.value = speciesList[val][$q.lang.isoName]
  }
)
const filterFn = (val, update) => {
  update(() => {
    const needle = val.toLowerCase()
    if (needle.length > 5) {
      options.value = speciesList[species.value][$q.lang.isoName].filter(
        (v) => v.toLowerCase().indexOf(needle) > -1
      )
    } else {
      options.value = []
    }
  })
}
</script>

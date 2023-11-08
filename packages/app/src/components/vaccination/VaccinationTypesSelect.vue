<template>
  <q-btn-group v-if="species === 'dog'" push>
    <q-btn
      push
      :label="lang.pet.vaccination.dog.smallCocktail"
      @click="setSmallCocktail"
    />
    <q-btn
      push
      :label="lang.pet.vaccination.dog.largeCocktail"
      @click="setLargeCocktail"
    />
  </q-btn-group>
  <q-select
    v-bind="attrs"
    :model-value="modelValue"
    :options="options"
    :label="`${lang.pet.vaccination.title}${required ? '*' : ''}`"
    emit-value
    map-options
    multiple
    @update:model-value="$emit('update:model-value', $event)"
  ></q-select>
</template>

<script lang="ts">
export default {
  name: 'VaccinationTypeSelect'
}
</script>

<script setup lang="ts">
import { VACCINATION_TYPES } from '@petboarding/api/zod'
import { toRefs, useAttrs } from 'vue'
import { QSelect } from 'quasar'
import { useLang } from '../../lang/index.js'
import { PET_SPECIES } from '@petboarding/api/zod'

export interface Props {
  modelValue: string[]
  species: (typeof PET_SPECIES)[number]
  required?: boolean
}

const props = defineProps<Props>()
const attrs = useAttrs()
const emit = defineEmits<{
  (e: 'update:model-value', data: string[]): void
}>()
const lang = useLang()

const { species } = toRefs(props)
const options = VACCINATION_TYPES[species.value].map((val) => {
  return {
    label: lang.value.pet.vaccination.types[val],
    value: val
  }
})

const setSmallCocktail = () => {
  emit('update:model-value', ['leptospirosis'])
}

const setLargeCocktail = () => {
  emit('update:model-value', [
    'leptospirosis',
    'distemper',
    'hepatitis',
    'parvo'
  ])
}
</script>

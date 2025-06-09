<template>
  <div class="grid grid-cols-12 gap-3">
    <q-btn-group
      v-if="species === 'dog'"
      push
      spread
      class="col-span-12 md:col-span-6"
    >
      <q-btn
        push
        :label="lang.pet.vaccination.dog.cocktail"
        @click="setCocktail"
      />
      <q-btn
        push
        :label="lang.pet.vaccination.types.kennelcough"
        @click="setKennelcough"
      />
      <q-btn
        push
        :label="`${lang.pet.vaccination.dog.cocktail} + ${lang.pet.vaccination.types.kennelcough}`"
        @click="setCocktailKennelcough"
      />
    </q-btn-group>
    <q-select
      v-bind="attrs"
      class="col-span-12 md:col-span-6"
      :model-value="modelValue"
      :options="options"
      :label="`${lang.pet.vaccination.title}${required ? '*' : ''}`"
      emit-value
      map-options
      multiple
      @update:model-value="$emit('update:model-value', $event)"
    >
    </q-select>
  </div>
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

const { modelValue, species } = toRefs(props)
const options = VACCINATION_TYPES[species.value].map((val) => {
  return {
    label: lang.value.pet.vaccination.types[val],
    value: val
  }
})

const setCocktail = () => {
  const cocktail = ['leptospirosis', 'distemper', 'hepatitis', 'parvo']
  const newValue = modelValue.value.some((vaccination) =>
    cocktail.includes(vaccination)
  )
    ? modelValue.value.filter((vaccination) => !cocktail.includes(vaccination))
    : [...modelValue.value, ...cocktail]
  emit('update:model-value', newValue)
}

const setKennelcough = () => {
  const newValue = modelValue.value.includes('kennelcough')
    ? modelValue.value.filter((vaccination) => vaccination !== 'kennelcough')
    : [...modelValue.value, 'kennelcough']
  emit('update:model-value', newValue)
}

const setCocktailKennelcough = () => {
  const cocktailKennelcough = [
    'leptospirosis',
    'distemper',
    'hepatitis',
    'parvo',
    'kennelcough'
  ]
  const newValue = modelValue.value.some((vaccination) =>
    cocktailKennelcough.includes(vaccination)
  )
    ? modelValue.value.filter(
        (vaccination) => !cocktailKennelcough.includes(vaccination)
      )
    : [...modelValue.value, ...cocktailKennelcough]
  emit('update:model-value', newValue)
}
</script>

<template>
  <q-item v-bind="attrs">
    <q-item-section>
      <q-item-label overline>
        {{ lang.pet.fields.category }}
      </q-item-label>
      <q-item-label>
        {{ modelValue ? categories[species][modelValue].name : '-' }}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script lang="ts">
export default {
  name: 'PetCategoryItem'
}
</script>

<script setup lang="ts">
import { useAttrs } from 'vue'

import { useLang } from '../../lang/index.js'
import type { Category, Pet } from '@petboarding/api/zod'

export interface Props {
  modelValue?: number
  species: Pet['species']
  categories: Record<Pet['species'], Record<number, Category>>
}
defineProps<Props>()

const attrs = useAttrs()

const lang = useLang()
</script>

<template>
  <q-select
    v-bind="attrs"
    :model-value="modelValue"
    :options="options"
    :label="`${lang.pet.fields.category}${required ? '*' : ''}`"
    :rules="validations"
    lazy-rules
    emit-value
    map-options
    @update:model-value="$emit('update:model-value', $event)"
  ></q-select>
</template>

<script lang="ts">
export default {
  name: 'PetCategorySelect'
}
</script>

<script setup lang="ts">
import { watch, useAttrs, ref, toRefs } from 'vue'
import { ValidationRule, useQuasar } from 'quasar'
import { useLang, loadLang } from '../../lang/index.js'
import { Category, Pet } from '@petboarding/api/zod'

export interface Props {
  modelValue?: number
  required?: boolean
  species: Pet['species']
  categories: Record<Pet['species'], Record<number, Category>>
}
const props = defineProps<Props>()

const attrs = useAttrs()

const lang = useLang()

const $q = useQuasar()
if (lang.value.isoName !== $q.lang.isoName) loadLang($q.lang.isoName)
watch($q.lang, () => {
  loadLang($q.lang.isoName)
})

const { categories, species } = toRefs(props)

const options = ref(
  Object.values(categories.value[species.value])?.map((category) => ({
    label: category.name,
    value: category.id
  }))
)
watch(
  () => species.value,
  (val) => {
    return Object.values(categories.value[val])?.map((category) => ({
      label: category.name,
      value: category.id
    }))
  }
)

const validations = ref<ValidationRule[]>([])

if (props.required)
  validations.value.push(
    (val: string) => !!val || lang.value.pet.validations.fieldRequired
  )
</script>

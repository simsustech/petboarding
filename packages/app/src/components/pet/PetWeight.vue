<template>
  <q-input
    :model-value="modelValue"
    :label="lang.pet.fields.weight"
    :suffix="unit"
    type="number"
    step="0.1"
    name="weight"
    @update:model-value="
      (val) =>
        $emit(
          'update:model-value',
          typeof val === 'string'
            ? (Math.round(Number(val) * 10) / 10).toString()
            : Math.round((val || 0) * 10) / 10
        )
    "
  />
</template>

<script setup lang="ts">
import { useLang } from '../../lang/index.js'

interface Props {
  modelValue?: number | string | null
  unit?: 'kg' | 'lbs'
}

withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  unit: 'kg'
})

defineEmits<{
  (e: 'update:model-value', value: number | string): void
}>()

const lang = useLang()
</script>

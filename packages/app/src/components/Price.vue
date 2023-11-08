<template>
  {{
    modelValue
      ? configuration.CURRENCY + Number(modelValue / 100).toFixed(2)
      : lang.tbd
  }}
</template>

<script lang="ts">
export default {
  name: 'PriceComponent'
}
</script>

<script setup lang="ts">
import { ref } from 'vue'
import { useLang } from '../lang/index.js'
import { useConfiguration } from '../configuration.js'
export interface Props {
  modelValue?: number | null
}
defineProps<Props>()
const configuration = useConfiguration()
const lang = useLang()

const variables = ref({
  // header: lang.value.some.nested.prop
})
const functions = ref({
  // submit
})
defineExpose({
  variables,
  functions
})
</script>

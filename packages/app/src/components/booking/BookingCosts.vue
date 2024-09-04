<template>
  <invoice-line-row
    v-for="(line, index) in modelValue.lines"
    :key="index"
    :model-value="line"
    :currency="currency"
    disable
  />
  {{ lang.pricesSubjectToChange }}
</template>

<script lang="ts">
export default {
  name: 'BookingCosts'
}
</script>

<script setup lang="ts">
import { BookingCosts } from '@petboarding/api'
import { InvoiceLineRow } from '@modular-api/quasar-components/checkout'
import { ref } from 'vue'
import { useLang } from '../../lang/index.js'
export interface Props {
  modelValue: BookingCosts
}
defineProps<Props>()

const lang = useLang()
const currency = ref('EUR' as const)
</script>

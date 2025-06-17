<template>
  <invoice-line-item
    v-for="(line, index) in modelValue.lines"
    :key="index"
    :model-value="line"
    :locale="locale"
    :currency="currency"
    disable
  />
  <q-item-label header>
    {{ lang.pricesSubjectToChange }}
  </q-item-label>
</template>

<script lang="ts">
export default {
  name: 'BookingCosts'
}
</script>

<script setup lang="ts">
import { BookingCosts } from '@petboarding/api'
import { InvoiceLineItem } from '@modular-api/quasar-components/checkout'
import { computed, ref } from 'vue'
import { useLang } from '../../lang/index.js'
import { useConfiguration } from '../../configuration.js'
export interface Props {
  modelValue: BookingCosts
}
defineProps<Props>()

const lang = useLang()
const currency = ref('EUR' as const)
const configuration = useConfiguration()

const locale = computed(() => configuration.value.LANG)
</script>

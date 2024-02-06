<template>
  <order-line-item
    v-for="orderLine in modelValue.orderLines"
    :key="orderLine.id"
    :model-value="orderLine"
    disable
  />
</template>

<script lang="ts">
export default {
  name: 'BookingCosts'
}
</script>

<script setup lang="ts">
// import { useLang } from '../../lang/index.js'
// import { useConfiguration } from '../../configuration.js'
import { OrderLineItem } from '@modular-api/quasar-components/cart'
import { BookingCosts } from '@petboarding/api'
import { toRefs } from 'vue'

export interface Props {
  modelValue: BookingCosts
}
const props = defineProps<Props>()

const { modelValue } = toRefs(props)
</script>

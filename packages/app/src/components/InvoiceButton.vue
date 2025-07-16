<template>
  <q-btn
    :dense="$q.screen.lt.sm"
    class="q-pa-none max-w-62px max-h-80px"
    :href="`https://${configuration.INTEGRATIONS?.slimfact.host}/invoice/${modelValue.uuid}`"
    target="_blank"
    outline
    :rounded="false"
    :class="classes"
  >
    <div class="column items-center">
      <q-avatar class="col-12">
        <q-icon name="i-mdi-invoice-text" :class="classes" size="md" />
      </q-avatar>
      <q-icon
        v-if="
          modelValue.amountDue !== void 0 &&
          modelValue.amountDue !== null &&
          modelValue.amountDue <= 0
        "
        style="position: absolute; right: 20px; bottom: 20px"
        name="i-mdi-check"
        :class="{
          'text-green': true
        }"
        size="xs"
      />
      <q-icon
        v-if="
          modelValue.amountDue !== void 0 &&
          modelValue.amountDue !== null &&
          modelValue.amountDue < 0
        "
        style="position: absolute; right: 20px; bottom: 20px"
        name="i-mdi-exclamation"
        :class="{
          'text-red': true
        }"
        size="xs"
      />
    </div>
    <div class="col-12 text-caption">
      <price
        :model-value="modelValue.totalIncludingTax || 0"
        :currency="modelValue.currency"
      />
    </div>
    <q-tooltip>
      {{ lang.booking.messages.openInvoice }}
    </q-tooltip>
  </q-btn>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'
import { useLang } from '../lang/index.js'
import { useQuasar } from 'quasar'
import { type Invoice } from '@modular-api/fastify-checkout'
import { useConfiguration } from '../configuration.js'
interface Props {
  modelValue: Invoice
}
const props = defineProps<Props>()

const { modelValue } = toRefs(props)
const $q = useQuasar()
const lang = useLang()
const configuration = useConfiguration()

const classes = computed(() => {
  if (
    modelValue.value.amountDue !== void 0 &&
    modelValue.value.amountDue !== null
  ) {
    if (modelValue.value.amountDue <= 0) return 'text-green'
    if (
      modelValue.value.amountPaid &&
      modelValue.value.requiredDownPaymentAmount
    ) {
      if (
        modelValue.value.amountPaid >=
        modelValue.value.requiredDownPaymentAmount
      )
        return 'text-orange'
    }
  }
  return 'text-grey'
})
</script>

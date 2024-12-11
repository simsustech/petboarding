<template>
  <q-btn
    :dense="$q.screen.lt.sm"
    class="q-pa-none"
    :href="`https://${configuration.INTEGRATIONS?.slimfact.hostname}/invoice/${modelValue.uuid}`"
    target="_blank"
    :text-color="invoiceTextColor"
  >
    <div class="column">
      <q-avatar class="col-12">
        <q-icon name="receipt" size="md" />
      </q-avatar>
      <q-icon
        v-if="
          modelValue.amountDue !== void 0 &&
          modelValue.amountDue !== null &&
          modelValue.amountDue <= 0
        "
        style="
          position: relative;
          width: 0;
          height: 0;
          right: -30px;
          bottom: 3px;
        "
        name="check"
        color="green"
        size="xs"
      />
      <q-icon
        v-if="
          modelValue.amountDue !== void 0 &&
          modelValue.amountDue !== null &&
          modelValue.amountDue < 0
        "
        style="position: relative; width: 0; height: 0; bottom: 3px"
        name="priority_high"
        color="red"
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

const invoiceTextColor = computed(() => {
  if (
    modelValue.value.amountDue !== void 0 &&
    modelValue.value.amountDue !== null
  ) {
    if (modelValue.value.amountDue <= 0) return 'green'
    if (
      modelValue.value.amountPaid &&
      modelValue.value.requiredDownPaymentAmount
    ) {
      if (
        modelValue.value.amountPaid >=
        modelValue.value.requiredDownPaymentAmount
      )
        return 'orange'
    }
  }
  return 'grey'
})
</script>

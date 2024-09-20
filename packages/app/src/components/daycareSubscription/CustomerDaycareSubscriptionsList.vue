<template>
  <q-list>
    <q-item-label header>
      {{ lang.customerDaycareSubscription.title }}
    </q-item-label>
    <q-item
      v-for="(customerDaycareSubscription, index) in modelValue"
      :key="index"
    >
      <q-item-section>
        <q-item-label overline>
          {{
            `${formatDate(customerDaycareSubscription.effectiveDate)} ${lang.booking.until} ${formatDate(customerDaycareSubscription.expirationDate)}`
          }}
        </q-item-label>
        <q-item-label>
          {{ customerDaycareSubscription.daycareSubscription?.description }}
        </q-item-label>
        <q-item-label caption>
          {{
            `${customerDaycareSubscription.numberOfDaysUsed} / ${customerDaycareSubscription.daycareSubscription?.numberOfDays}`
          }}
        </q-item-label>
      </q-item-section>
      <q-item-section side>
        <invoice-button
          v-if="customerDaycareSubscription.invoice"
          :model-value="customerDaycareSubscription.invoice"
        />
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script lang="ts">
export default {
  name: 'CustomerDaycareSubscriptionsList'
}
</script>

<script setup lang="ts">
import { useLang } from '../../lang/index.js'
import { CustomerDaycareSubscription } from '@petboarding/api/zod'
// import { useConfiguration } from '../../configuration.js'
import { useQuasar } from 'quasar'
import InvoiceButton from '../InvoiceButton.vue'

export interface Props {
  modelValue: CustomerDaycareSubscription[]
}
defineProps<Props>()

const lang = useLang()
// const configuration = useConfiguration()
const $q = useQuasar()

const dateFormatter = (date: Date, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeZone: 'UTC'
  }).format(date)

const formatDate = (date: string) => {
  return `${dateFormatter(new Date(date), $q.lang.isoName)}`
}
</script>

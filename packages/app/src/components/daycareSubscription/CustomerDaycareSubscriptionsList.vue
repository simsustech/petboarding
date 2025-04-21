<template>
  <q-list>
    <q-item-label header>
      <div class="row items-center justify-between">
        <div>
          {{ lang.customerDaycareSubscription.title }}
        </div>
        <q-toggle
          v-model="showAll"
          :label="lang.customerDaycareSubscription.labels.showAll"
        />
      </div>
    </q-item-label>
    <q-expansion-item
      v-for="(
        customerDaycareSubscription, index
      ) in filteredCustomerDaycareSubscriptions"
      :key="index"
      :class="{ 'bg-grey-3': !customerDaycareSubscription.isActive }"
      :content-inset-level="1"
    >
      <template #header>
        <q-item-section avatar>
          <q-icon
            v-if="
              customerDaycareSubscription.status ===
              CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS.PAID
            "
            name="i-mdi-paid"
            color="green"
          />
        </q-item-section>
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
      </template>
      <q-item>
        <q-item-section>
          <q-item-label>
            {{
              customerDaycareSubscription.daycareDates
                ?.map((daycareDate) => formatDate(daycareDate.date))
                .join(', ')
            }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-expansion-item>
  </q-list>
</template>

<script lang="ts">
export default {
  name: 'CustomerDaycareSubscriptionsList'
}
</script>

<script setup lang="ts">
import { useLang } from '../../lang/index.js'
import {
  CustomerDaycareSubscription,
  CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS
} from '@petboarding/api/zod'
// import { useConfiguration } from '../../configuration.js'
import { useQuasar } from 'quasar'
import InvoiceButton from '../InvoiceButton.vue'
import { computed, ref, toRefs } from 'vue'

export interface Props {
  modelValue: CustomerDaycareSubscription[]
}
const props = defineProps<Props>()

const { modelValue } = toRefs(props)

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

const showAll = ref(false)
const filteredCustomerDaycareSubscriptions = computed(() =>
  modelValue.value.filter((customerDaycareSubscription) => {
    if (showAll.value === false) {
      return (
        customerDaycareSubscription.expirationDate &&
        customerDaycareSubscription.expirationDate >
          new Date().toISOString().slice(0, 10) &&
        customerDaycareSubscription.numberOfDaysRemaining
      )
    }
    return true
  })
)
</script>

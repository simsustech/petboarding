<template>
  <q-list>
    <q-item-label header>
      {{ lang.daycareSubscription.title }}
    </q-item-label>
    <q-item v-for="(daycareSubscription, index) in modelValue" :key="index">
      <q-item-section>
        <q-item-label overline>
          {{ daycareSubscription.description }}
        </q-item-label>
        <q-item-label>
          <price
            :model-value="daycareSubscription.listPrice"
            :currency="configuration.CURRENCY"
          />
        </q-item-label>
        <q-item-label caption>
          {{
            `${daycareSubscription.numberOfDays} ${lang.daycareSubscription.labels.days.toLowerCase()}`
          }}
          <br />
          {{ formatValidityPeriod(daycareSubscription.validityPeriod) }}
        </q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-btn
          v-if="showEditButton"
          icon="i-mdi-edit"
          data-testid="edit-button"
          @click="emit('update', { data: daycareSubscription, done: () => {} })"
        />
        <q-btn
          v-if="showDeleteButton"
          icon="i-mdi-delete"
          color="red"
          data-testid="delete-button"
          @click="emit('delete', { data: daycareSubscription, done: () => {} })"
        />
        <q-btn
          v-if="showPurchaseButton"
          icon="i-mdi-add-shopping-cart"
          :label="lang.customerDaycareSubscription.labels.purchase"
          @click="
            emit('purchase', { data: daycareSubscription, done: () => {} })
          "
        />
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script lang="ts">
export default {
  name: 'DaycareSubscriptionsList'
}
</script>

<script setup lang="ts">
import { useLang } from '../../lang/index.js'
import { DaycareSubscription } from '@petboarding/api/zod'
import Price from '../Price.vue'
import { useConfiguration } from '../../configuration.js'

export interface Props {
  modelValue: DaycareSubscription[]
  showEditButton?: boolean
  showDeleteButton?: boolean
  showPurchaseButton?: boolean
}
defineProps<Props>()

const emit = defineEmits<{
  (
    e: 'update',
    {
      data,
      done
    }: {
      data: DaycareSubscription
      done?: (success?: boolean) => void
    }
  ): void
  (
    e: 'delete',
    {
      data,
      done
    }: {
      data: DaycareSubscription
      done?: (success?: boolean) => void
    }
  ): void
  (
    e: 'purchase',
    {
      data,
      done
    }: {
      data: DaycareSubscription
      done?: (success?: boolean) => void
    }
  ): void
}>()

const lang = useLang()
const configuration = useConfiguration()

const formatValidityPeriod = (
  validityPeriod: DaycareSubscription['validityPeriod']
) => {
  return `${lang.value.customerDaycareSubscription.fields.validityPeriod}:
  ${validityPeriod.years ? `${validityPeriod.years} ${lang.value.daycareSubscription.labels.years}` : ''}
  ${validityPeriod.months ? `${validityPeriod.months} ${lang.value.daycareSubscription.labels.months}` : ''}
  ${validityPeriod.days ? `${validityPeriod.days} ${lang.value.daycareSubscription.labels.days}` : ''}
  `
}
</script>

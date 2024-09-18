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
      </q-item-section>
      <q-item-section side>
        <q-btn
          v-if="showEditButton"
          icon="edit"
          @click="emit('update', { data: daycareSubscription })"
        />
        <q-btn
          v-if="showDeleteButton"
          icon="delete"
          color="red"
          @click="emit('delete', { data: daycareSubscription })"
        />
        <q-btn
          v-if="showPurchaseButton"
          icon="add_shopping_cart"
          :label="lang.customerDaycareSubscription.labels.purchase"
          @click="emit('purchase', { data: daycareSubscription })"
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
</script>

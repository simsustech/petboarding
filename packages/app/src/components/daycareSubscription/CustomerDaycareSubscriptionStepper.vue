<template>
  <q-stepper v-model="step" ref="stepper" color="primary" animated>
    <q-step :name="1" :title="lang.daycareSubscription.title" :done="step > 1">
      <daycare-subscriptions-list
        :model-value="daycareSubscriptions"
        show-purchase-button
        @purchase="purchaseDaycareSubscription"
      />
    </q-step>

    <q-step
      :name="2"
      :title="lang.customerDaycareSubscription.fields.effectiveDate"
      :done="step > 2"
    >
      <date-input
        v-if="customerDaycareSubscription"
        v-model="customerDaycareSubscription.effectiveDate"
        :label="lang.customerDaycareSubscription.fields.effectiveDate"
        format="DD-MM-YYYY"
        required
        clearable
        class="col-md-6 col-12"
        :date="{
          noUnset: true,
          firstDayOfWeek: '1'
        }"
      />
    </q-step>

    <q-step
      :name="3"
      :title="lang.customerDaycareSubscription.labels.overview"
      :done="step > 3"
    >
      <q-list>
        <q-item>
          <q-item-section>
            <q-item-label overline>
              {{ lang.daycareSubscription.fields.description }}
            </q-item-label>
            <q-item-label>
              {{ daycareSubscription?.description }}
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label overline>
              {{ lang.daycareSubscription.fields.listPrice }}
            </q-item-label>
            <q-item-label>
              <price
                :model-value="daycareSubscription?.listPrice"
                :currency="configuration.CURRENCY"
              />
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="customerDaycareSubscription">
          <q-item-section>
            <q-item-label overline>
              {{ lang.customerDaycareSubscription.fields.effectiveDate }}
            </q-item-label>
            <q-item-label>
              {{ formatDate(customerDaycareSubscription?.effectiveDate) }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-step>

    <template #navigation>
      <q-stepper-navigation class="text-right">
        <q-btn
          v-if="step === 2"
          flat
          color="primary"
          :label="lang.previous"
          class="q-ml-sm"
          @click="stepper?.previous()"
        />
        <q-btn
          v-if="step === 2"
          color="primary"
          :label="lang.next"
          @click="stepper?.next()"
        />
        <q-btn
          v-if="step === 3 && customerDaycareSubscription"
          color="primary"
          :label="lang.customerDaycareSubscription.labels.purchase"
          @click="
            emit('purchaseCustomerDaycareSubscription', {
              data: customerDaycareSubscription
            })
          "
        />
      </q-stepper-navigation>
    </template>
  </q-stepper>
</template>

<script setup lang="ts">
import { ref, computed, toRefs } from 'vue'
import {
  DaycareSubscription,
  CustomerDaycareSubscription
} from '@petboarding/api/zod'
import { useLang } from '../../lang/index.js'
import { QStepper } from 'quasar'
import DaycareSubscriptionsList from './DaycareSubscriptionsList.vue'
import { DateInput } from '@simsustech/quasar-components/form'
import Price from '../Price.vue'
import { useConfiguration } from '../../configuration.js'
import { useQuasar } from 'quasar'

interface Props {
  daycareSubscriptions: DaycareSubscription[]
}

const props = defineProps<Props>()
const lang = useLang()
const configuration = useConfiguration()
const $q = useQuasar()

const emit = defineEmits<{
  (
    e: 'purchaseCustomerDaycareSubscription',
    {
      data,
      done
    }: {
      data: CustomerDaycareSubscription
      done: (success?: boolean) => void
    }
  ): void
}>()

const step = ref<number>(1)
const stepper = ref<QStepper>()

const { daycareSubscriptions } = toRefs(props)
const daycareSubscription = computed(() =>
  daycareSubscriptions.value.find(
    (val) => val.id === customerDaycareSubscription.value?.daycareSubscriptionId
  )
)
const customerDaycareSubscription = ref<CustomerDaycareSubscription>()
const purchaseDaycareSubscription: InstanceType<
  typeof DaycareSubscriptionsList
>['$props']['onPurchase'] = ({ data, done }) => {
  if (data.id) {
    customerDaycareSubscription.value = {
      daycareSubscriptionId: data.id,
      effectiveDate: new Date().toISOString().slice(0, 10)
    }
    if (done) done()
    stepper.value?.next()
  }
}

const dateFormatter = (date: Date, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    dateStyle: 'long',
    timeZone: 'UTC'
  }).format(date)
const formatDate = (date: string | null) => {
  if (date) return dateFormatter(new Date(date), $q.lang.isoName)
  return '-'
}
</script>

<template>
  <q-page padding>
    <div v-if="ready">
      <div v-if="petsData?.length">
        <div class="grid grid-cols-12 gap-3">
          <q-card class="col-span-12">
            <q-card-section>
              <customer-daycare-subscriptions-list
                v-if="customerDaycareSubscriptions?.length"
                :model-value="customerDaycareSubscriptions"
              />
              <q-banner
                v-if="daycareSubscriptions.length"
                :class="{
                  'q-mb-md': true,
                  'bg-warning': !customerDaycareSubscriptions?.length
                }"
                rounded
              >
                <template #avatar>
                  <q-icon
                    v-if="!customerDaycareSubscriptions?.length"
                    name="i-mdi-warning"
                    color="red"
                  />
                </template>
                <template #action>
                  <q-btn
                    v-if="allowPurchase"
                    :label="
                      lang.customerDaycareSubscription.labels
                        .purchaseSubscription
                    "
                    icon="i-mdi-shopping-cart"
                    @click="
                      purchaseCustomerDaycareSubscriptionDialogRef?.functions.open()
                    "
                  />
                </template>
                <a
                  v-if="
                    daycareSubscriptions?.length &&
                    !customerDaycareSubscriptions?.length
                  "
                >
                  {{
                    lang.customerDaycareSubscription.messages
                      .daycareSubscriptionRequired
                  }}
                </a>
              </q-banner>
            </q-card-section>
          </q-card>

          <q-card class="col-span-12">
            <q-card-section class="text-right">
              <q-btn
                outline
                icon="i-mdi-add"
                :label="lang.add"
                @click="openCreateDialog"
              />
            </q-card-section>
            <q-card-section>
              <daycare-legend />
              <daycare-calendar-month
                :events="events"
                :selected-events="selectedEvents"
                :disabled-weekdays="configuration.DAYCARE_DISABLED_WEEKDAYS"
                :focusable="false"
                :hoverable="false"
                @click:event="onClickEvent"
                @change-date="onChangeDate"
              >
                <template #head-day-button-tooltip>
                  {{ lang.daycare.messages.addDaycareDates }}
                </template>
              </daycare-calendar-month>
              <div class="row justify-center">
                <q-btn
                  v-if="selectedEvents.length"
                  :label="lang.daycare.messages.cancelSelected"
                  color="red"
                  @click="cancelDaycareDates"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
      <div v-else>
        <router-link to="/account/pets">{{
          lang.daycare.messages.addPets
        }}</router-link>
      </div>
    </div>
  </q-page>

  <responsive-dialog
    ref="createDialogRef"
    padding
    :icons="{ close: 'i-mdi-close' }"
    persistent
    @submit="create"
  >
    <daycare-form
      ref="createDaycareFormRef"
      :pets="petsData"
      :terms-and-conditions-url="termsAndConditionsUrl"
      :customer-daycare-subscriptions="
        paidAndActiveCustomerDaycareSubscriptions
      "
      :use-customer-daycare-subscriptions="!!daycareSubscriptions.length"
      :current-daycare-dates="data"
      :disabled-dates="disabledDates"
      @submit="createDaycare"
      @change-date="onChangeDate"
    ></daycare-form>
  </responsive-dialog>
  <responsive-dialog
    ref="purchaseCustomerDaycareSubscriptionDialogRef"
    padding
    :icons="{ close: 'i-mdi-close' }"
    persistent
    display
  >
    <customer-daycare-subscription-stepper
      :daycare-subscriptions="daycareSubscriptions"
      @purchase-customer-daycare-subscription="
        onPurchaseCustomerDaycareSubscription
      "
    />
  </responsive-dialog>
</template>

<script lang="ts">
export default {
  name: 'AccountDaycarePage'
}
</script>

<script setup lang="ts">
import { ref, onMounted, computed, reactive, inject } from 'vue'
import { createUseTrpc } from '../../../trpc.js'
import { ResourcePage, ResponsiveDialog } from '@simsustech/quasar-components'
import DaycareForm from '../../../components/daycare/DaycareForm.vue'
import DaycareCalendarMonth, {
  QCalendarEvent
} from '../../../components/daycare/DaycareCalendarMonth.vue'
import { useLang } from '../../../lang/index.js'
import { useQuasar } from 'quasar'
import DaycareLegend from '../../../components/daycare/DaycareLegend.vue'
import {
  DAYCARE_DATE_COLORS,
  DAYCARE_DATE_ICONS,
  useConfiguration
} from '../../../configuration.js'
import {
  type CustomerDaycareSubscription,
  CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS
} from '@petboarding/api/zod'
import customerDaycareSubscriptionStepper from '../../../components/daycareSubscription/CustomerDaycareSubscriptionStepper.vue'
import customerDaycareSubscriptionsList from '../../../components/daycareSubscription/CustomerDaycareSubscriptionsList.vue'

import { EventBus } from 'quasar'

const bus = inject<EventBus>('bus')!
bus.on('account-open-daycare-create-dialog', () => {
  if (openCreateDialog)
    openCreateDialog({
      done: () => {}
    })
})

const $q = useQuasar()
const { useQuery, useMutation } = await createUseTrpc()

const lang = useLang()
const configuration = useConfiguration()

const startDate = ref('')
const endDate = ref('')

const { data: petsData, execute: executeCustomer } = useQuery('user.getPets', {
  // immediate: true
})

const { data, execute } = useQuery('user.getDaycareDates', {
  args: reactive({ from: startDate, until: endDate }),
  reactive: {
    args: true
  }
  // immediate: true
})

const { data: daycareSubscriptions, execute: executeDaycareSubscriptions } =
  useQuery('public.getDaycareSubscriptions', {})

const {
  data: customerDaycareSubscriptions,
  execute: executeCustomerDaycareSubscriptions
} = useQuery('user.getCustomerDaycareSubscriptions', {
  reactive: {
    args: true
  }
  // immediate: true
})

const { data: disabledDates, execute: executeDisabledDates } = useQuery(
  'public.getUnavailableDaycareDates',
  {}
)

const createDaycareFormRef = ref<typeof DaycareForm>()
const createDialogRef = ref<typeof ResponsiveDialog>()

const openCreateDialog: InstanceType<
  typeof ResourcePage
>['$props']['onCreate'] = () => {
  createDialogRef.value?.functions.open()
}

// const update: InstanceType<
//   typeof ResponsiveDialog
// >['$props']['onSubmit'] = async ({ done }) => {
//   const afterUpdate = (success?: boolean) => {
//     done(success)
//     execute()
//   }
//   updateDaycareFormRef.value?.functions.submit({ done: afterUpdate })
// }

const create: InstanceType<
  typeof ResponsiveDialog
>['$props']['onSubmit'] = async ({ done }) => {
  const afterCreate = (success?: boolean) => {
    done(success)
  }
  createDaycareFormRef.value?.functions.submit({ done: afterCreate })
}

// const updateDaycare: InstanceType<
//   typeof DaycareForm
// >['$props']['onSubmit'] = async () => {}

const createDaycare: InstanceType<
  typeof DaycareForm
>['$props']['onSubmit'] = async ({ data, done }) => {
  const result = useMutation('user.createDaycareDates', {
    args: data,
    immediate: true
  })

  await result.immediatePromise

  if (!result.error.value) {
    $q.dialog({
      message: lang.value.daycare.messages.submitted
    })
    await execute()
    await executeCustomerDaycareSubscriptions()
  }
  done(!result.error.value)
}

const dateFormatter = (date: Date, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    dateStyle: 'long',
    timeZone: 'UTC'
  }).format(date)

const cancelDaycareDates = async () => {
  $q.dialog({
    html: true,
    cancel: true,
    message: `${
      lang.value.daycare.messages.verifyCancelation
    } <br /> <b>${events.value
      ?.filter((ev) => selectedEvents.value.includes(ev.id))
      .map((event) => {
        return dateFormatter(new Date(event.date), $q.lang.isoName)
      })
      .join('<br />')}</b>`
  }).onOk(async () => {
    const result = useMutation('user.cancelDaycareDates', {
      args: selectedEvents.value,
      immediate: true
    })
    await result.immediatePromise

    if (!result.error.value) {
      selectedEvents.value = []
      execute()
    }
  })
}

const events = computed(() => {
  if (data?.value) {
    return data.value.map((daycareDate) => ({
      id: daycareDate.id,
      bgcolor: DAYCARE_DATE_COLORS[daycareDate.status],
      title: daycareDate.pets.map((pet) => pet.name).join(', '),
      petNames: daycareDate.pets.map((pet) => pet.name),
      date: daycareDate.date,
      // details: lang.value.daycare.status[daycareDate.status],
      icon: DAYCARE_DATE_ICONS[daycareDate.status]
    }))
  }
  return []
})
const selectedEvents = ref<number[]>([])
const onClickEvent = (event: QCalendarEvent) => {
  if (selectedEvents.value.includes(event.id)) {
    const index = selectedEvents.value.findIndex((id) => id === event.id)
    if (index !== -1) selectedEvents.value.splice(index, 1)
  } else {
    selectedEvents.value.push(event.id)
  }
}

const termsAndConditionsUrl = computed(
  () =>
    configuration.value.TERMS_AND_CONDITIONS_URL || '/termsandconditions.pdf'
)

const onChangeDate: InstanceType<
  typeof DaycareCalendarMonth
>['$props']['onChangeDate'] = (data) => {
  startDate.value = data.start
  endDate.value = data.end
}

const onPurchaseCustomerDaycareSubscription = async ({
  data,
  done
}: {
  data: CustomerDaycareSubscription
  done: (success?: boolean) => void
}) => {
  const result = useMutation('user.createCustomerDaycareSubscription', {
    args: data,
    immediate: true
  })

  await result.immediatePromise

  if (!result.error.value) {
  }

  if (result.data.value?.checkoutUrl)
    window.location.href = result.data.value.checkoutUrl

  done(!result.error.value)
}

const purchaseCustomerDaycareSubscriptionDialogRef =
  ref<typeof ResponsiveDialog>()

const paidAndActiveCustomerDaycareSubscriptions = computed(() =>
  customerDaycareSubscriptions.value?.filter(
    (customerDaycareSubscription) =>
      customerDaycareSubscription.status ===
        CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS.PAID &&
      customerDaycareSubscription.isActive
  )
)

const allowPurchase = computed(() => {
  const currentSubscriptions =
    customerDaycareSubscriptions.value?.filter(
      (customerDaycareSubscription) =>
        customerDaycareSubscription.status ===
          CUSTOMER_DAYCARE_SUBSCRIPTION_STATUS.PAID &&
        customerDaycareSubscription.expirationDate >=
          new Date().toISOString().slice(0, 10) &&
        (customerDaycareSubscription.numberOfDaysRemaining || 0) >= 5
    ) || []

  return currentSubscriptions.length < 1
})

const ready = ref<boolean>(false)
onMounted(async () => {
  await executeCustomer()
  await executeDaycareSubscriptions()
  await executeCustomerDaycareSubscriptions()
  await executeDisabledDates()
  // await execute()
  ready.value = true
})
</script>

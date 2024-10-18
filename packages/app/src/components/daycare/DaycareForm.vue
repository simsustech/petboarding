<template>
  <q-form v-bind="attrs" ref="formRef" class="row justtify-center">
    <div class="col-12 col-md-6">
      <q-select
        :model-value="modelValue.petIds"
        :options="petOptions"
        :label="`${lang.booking.fields.pets}*`"
        :rules="validations['pets']"
        use-chips
        emit-value
        map-options
        multiple
        @update:model-value="updateSelectedPets"
      />
      <terms-and-conditions-checkbox
        v-model="termsAndConditions"
        :terms-and-conditions-url="termsAndConditionsUrl"
        :ignore-terms-and-conditions="ignoreTermsAndConditions"
      />
    </div>
  </q-form>
  <daycare-calendar-month
    v-show="modelValue.petIds.length"
    :selected-dates="selectedDates"
    :disabled-weekdays="configuration.DAYCARE_DISABLED_WEEKDAYS"
    :max-number-of-selected-dates="maxNumberOfSelectedDates"
    :current-daycare-dates="currentDaycareDates"
    @update:selected-dates="($event) => (selectedDates = $event)"
    @change-date="onChangeDate"
  ></daycare-calendar-month>
  <div
    v-if="modelValue.petIds.length && useCustomerDaycareSubscriptions"
    class="row justify-center"
  >
    <a>
      {{ lang.customerDaycareSubscription.messages.remainingDays }}:
      {{ remainingDays }}
    </a>
  </div>
  <div
    v-if="
      modelValue.petIds.length &&
      useCustomerDaycareSubscriptions &&
      remainingDays === 0
    "
    class="row justify-center text-red"
  >
    {{ lang.customerDaycareSubscription.messages.noRemainingDays }}
  </div>
</template>

<script lang="ts">
export default {
  name: 'DaycareForm',
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import {
  Pet,
  DaycareDate,
  CustomerDaycareSubscription
} from '@petboarding/api/zod'
import { ref, useAttrs, computed, toRefs } from 'vue'
import DaycareCalendarMonth from './DaycareCalendarMonth.vue'
import { useLang } from '../../lang/index.js'
import { ResponsiveDialog } from '@simsustech/quasar-components'
import { QForm, QSelect } from 'quasar'
import { useConfiguration } from '../../configuration.js'
import TermsAndConditionsCheckbox from '../TermsAndConditionsCheckbox.vue'
import { Timestamp } from '@quasar/quasar-ui-qcalendar'
export interface Props {
  pets: Pet[]
  termsAndConditionsUrl?: string
  ignoreTermsAndConditions?: boolean
  useCustomerDaycareSubscriptions?: boolean
  customerDaycareSubscriptions?: CustomerDaycareSubscription[]
  currentDaycareDates?: DaycareDate[]
}

const props = defineProps<Props>()
const attrs = useAttrs()

const lang = useLang()
const configuration = useConfiguration()

const emit = defineEmits<{
  (
    e: 'submit',
    {
      data,
      done
    }: {
      data: DaycareDate[]
      done: (success?: boolean) => void
    }
  ): void
  (
    e: 'changeDate',
    {
      start,
      end,
      days
    }: {
      start: string
      end: string
      days: Timestamp[]
    }
  ): void
}>()

const formRef = ref<QForm>()
const validations = computed<
  Record<string, ((val: string) => boolean | string)[]>
>(() => ({
  comments: [(val) => !!val || lang.value.booking.validations.fieldRequired],
  pets: [(val) => !!val.length || lang.value.booking.validations.fieldRequired]
}))

const { pets, customerDaycareSubscriptions } = toRefs(props)
const selectedDates = ref<string[]>([])
const modelValue = ref({
  petIds: []
})

const petOptions = computed(() =>
  pets.value.map((pet) => ({
    label: pet.name,
    value: pet.id
  }))
)

const termsAndConditions = ref(false)

const setValue = (newValue: DaycareDate) => {
  //
}

const submit: InstanceType<typeof ResponsiveDialog>['$props']['onSubmit'] = ({
  done
}) => {
  formRef.value?.validate().then((success) => {
    if (success) {
      const data: DaycareDate[] = selectedDates.value.map((date) => ({
        petIds: modelValue.value.petIds,
        date
      }))
      return emit('submit', {
        data,
        done
      })
    }
  })
  done(false)
}

const maxNumberOfSelectedDates = computed(() => {
  return Math.floor(
    customerDaycareSubscriptions.value?.reduce((acc, cur) => {
      acc += (cur.numberOfDaysRemaining || 0) / modelValue.value.petIds.length
      return acc
    }, 0) || 0
  )
})

const remainingDays = computed(() => {
  if (maxNumberOfSelectedDates.value) {
    const remainingDays =
      maxNumberOfSelectedDates.value - selectedDates.value.length
    if (remainingDays > 0) return remainingDays
  }
  return 0
})

const updateSelectedPets: QSelect['$props']['onUpdate:modelValue'] = (
  value
) => {
  modelValue.value.petIds = value
  selectedDates.value.splice(maxNumberOfSelectedDates.value || 0)
}

const onChangeDate: InstanceType<
  typeof DaycareCalendarMonth
>['$props']['onChangeDate'] = (data) => {
  emit('changeDate', data)
}

const variables = ref({
  // header: lang.value.some.nested.prop
})
const functions = ref({
  submit,
  setValue
})
defineExpose({
  variables,
  functions
})
</script>

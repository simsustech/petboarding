<template>
  <q-form v-bind="attrs" ref="formRef" class="row justtify-center">
    <div class="col-12 col-md-6">
      <q-select
        v-model="modelValue.petIds"
        :options="petOptions"
        :label="lang.booking.fields.pets"
        :rules="validations['pets']"
        use-chips
        emit-value
        map-options
        multiple
      />
      <terms-and-conditions-checkbox
        v-model="termsAndConditions"
        :terms-and-conditions-url="termsAndConditionsUrl"
        :ignore-terms-and-conditions="ignoreTermsAndConditions"
      />
    </div>
  </q-form>
  <daycare-calendar-month
    :selected-dates="selectedDates"
    :disabled-weekdays="configuration.DAYCARE_DISABLED_WEEKDAYS"
    :max-number-of-selected-dates="maxNumberOfSelectedDates"
    @update:selected-dates="($event) => (selectedDates = $event)"
  ></daycare-calendar-month>
  <div v-if="useCustomerDaycareSubscriptions" class="row justify-center">
    Remaining days: {{ remainingDays }}
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
import { QForm } from 'quasar'
import { useConfiguration } from '../../configuration.js'
import TermsAndConditionsCheckbox from '../TermsAndConditionsCheckbox.vue'
export interface Props {
  pets: Pet[]
  termsAndConditionsUrl?: string
  ignoreTermsAndConditions?: boolean
  useCustomerDaycareSubscriptions?: boolean
  customerDaycareSubscriptions?: CustomerDaycareSubscription[]
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
  return customerDaycareSubscriptions.value?.reduce((acc, cur) => {
    acc += cur.numberOfDaysRemaining || 0
    return acc
  }, 0)
})

const remainingDays = computed(() => {
  if (maxNumberOfSelectedDates.value) {
    return maxNumberOfSelectedDates.value - selectedDates.value.length
  }
  return 0
})

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

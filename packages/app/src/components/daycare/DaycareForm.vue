<template>
  <q-form
    v-bind="attrs"
    ref="formRef"
    class="row justtify-center"
    @submit.prevent="submit"
  >
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

    <!-- Primary submit. Deliberately INSIDE the form: outside it `type="submit"`
         is inert and Enter never submits, which made the commit action
         mouse-only. The class is real, not the phantom `sticky-bottom-buttons`
         that had no stylesheet definition. -->
    <div class="col-12 row justify-center q-mt-lg q-gutter-sm">
      <q-btn
        type="submit"
        color="primary"
        size="lg"
        icon="i-mdi-calendar-plus"
        :label="lang.daycare.labels.addDaycare"
        :loading="submitting"
        :disable="!selectedDates.length"
      >
        <q-tooltip v-if="!selectedDates.length">
          {{ lang.daycare.messages.clickDateToSelect }}
        </q-tooltip>
        <span v-if="selectedDates.length" class="q-ml-sm text-caption">
          ({{ selectedDates.length }})
        </span>
      </q-btn>
    </div>
  </q-form>
  <!-- The calendar is only meaningful once a pet is chosen. `v-if`, not
       `v-show`: the scroll-area inside keeps its last measured height, so a
       hidden calendar reserved ~600px of empty dialog and the create dialog
       opened as a mostly-blank panel. -->
  <div v-if="modelValue.petIds.length" class="row justify-center">
    <span class="text-caption q-mb-xs">
      {{ lang.daycare.messages.selectDaysHint }}
    </span>
  </div>
  <daycare-calendar-month
    v-if="modelValue.petIds.length"
    :selected-dates="selectedDates"
    :disabled-weekdays="configuration.DAYCARE_DISABLED_WEEKDAYS"
    :max-number-of-selected-dates="maxNumberOfSelectedDates"
    :current-daycare-dates="currentDaycareDates"
    :allow-past-dates="allowPastDates"
    :disabled-dates="disabledDates"
    @update:selected-dates="($event) => (selectedDates = $event)"
    @change-date="onChangeDate"
  ></daycare-calendar-month>

  <!-- Instead of an empty void: say what the first step is. -->
  <div
    v-else
    class="column items-center justify-center text-center q-py-xl text-grey-7"
  >
    <q-icon name="i-mdi-paw" size="3em" class="q-mb-md text-grey-5" />
    <div class="text-body-1">
      {{ lang.daycare.messages.selectPetToStart }}
    </div>
  </div>

  <!-- 1d: live date counter -->
  <div v-if="modelValue.petIds.length" class="row justify-center q-mt-md">
    <q-chip
      v-if="selectedDates.length"
      color="primary"
      text-color="white"
      icon="i-mdi-calendar-check"
      class="text-body-1 q-py-sm q-px-md"
    >
      {{ lang.daycare.messages.selectedDatesCount(selectedDates.length) }}
    </q-chip>
    <q-chip
      v-else
      color="grey-3"
      text-color="grey-7"
      icon="i-mdi-help-circle-outline"
    >
      {{ lang.daycare.messages.clickDateToSelect }}
    </q-chip>
  </div>

  <div
    v-if="selectedDates.length"
    class="row items-center justify-center q-gutter-xs q-mt-sm"
  >
    <span class="text-body2">{{ lang.daycare.labels.selectedDates }}:</span>
    <q-chip
      v-for="date in sortedSelectedDates"
      :key="date"
      removable
      dense
      size="sm"
      color="primary"
      text-color="white"
      @remove="removeSelectedDate(date)"
    >
      {{ formatSelectedDate(date) }}
    </q-chip>
  </div>
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
import type {
  Pet,
  DaycareDate,
  CustomerDaycareSubscription
} from '@petboarding/api/zod'
import { ref, useAttrs, computed, toRefs } from 'vue'
import DaycareCalendarMonth from './DaycareCalendarMonth.vue'
import { useLang } from '../../lang/index.js'
import { ResponsiveDialog } from '@simsustech/quasar-components'
import { QForm, QSelect, date as dateUtil } from 'quasar'
import { useConfiguration } from '../../configuration.js'
import TermsAndConditionsCheckbox from '../TermsAndConditionsCheckbox.vue'
import { Timestamp } from '@timestamp-js/core'

export interface Props {
  pets: Pet[]
  termsAndConditionsUrl?: string
  ignoreTermsAndConditions?: boolean
  useCustomerDaycareSubscriptions?: boolean
  customerDaycareSubscriptions?: CustomerDaycareSubscription[]
  currentDaycareDates?: DaycareDate[]
  allowPastDates?: boolean
  disabledDates?: string[]
  submitting?: boolean
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

const { pets, customerDaycareSubscriptions, useCustomerDaycareSubscriptions } =
  toRefs(props)
const selectedDates = ref<string[]>([])
const modelValue = ref({
  petIds: [] as number[]
})

const petOptions = computed(() =>
  pets.value
    .filter(
      (pet) =>
        pet.deceased === false ||
        (pet.id && modelValue.value.petIds.includes(pet.id))
    )
    .map((pet) => ({
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
    done(false)
  })
}

const maxNumberOfSelectedDates = computed(() => {
  if (useCustomerDaycareSubscriptions.value) {
    return customerDaycareSubscriptions.value?.reduce((acc, cur) => {
      acc += Math.floor(
        (cur.numberOfDaysRemaining || 0) / modelValue.value.petIds.length
      )
      return acc
    }, 0)
  }
  return null as number | null
})

const remainingDays = computed(() => {
  if (maxNumberOfSelectedDates.value) {
    const remainingDays =
      maxNumberOfSelectedDates.value - selectedDates.value.length
    if (remainingDays > 0) return remainingDays
  }
  return 0
})

const sortedSelectedDates = computed(() => [...selectedDates.value].sort())

const formatSelectedDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return value
  return dateUtil.formatDate(new Date(year, month - 1, day), 'ddd D MMM')
}

const removeSelectedDate = (value: string) => {
  const index = selectedDates.value.indexOf(value)
  if (index !== -1) selectedDates.value.splice(index, 1)
}

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

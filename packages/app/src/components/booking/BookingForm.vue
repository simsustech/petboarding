<template>
  <q-form ref="formRef" class="justtify-center">
    <div class="row q-col-gutter-md">
      <q-date
        v-model="dateRange"
        class="col-md-5 col-12"
        first-day-of-week="1"
        range
        :options="limitDateOptionsFn"
        @update:model-value="removeDates"
        @range-end="setDates"
      />
      <div class="col-md-6 col-12">
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

        <opening-time-select
          v-model="modelValue.startTimeId"
          :label="lang.booking.fields.startTime"
          :date="modelValue.startDate"
          :disable="!modelValue.startDate"
          :type="OPENING_TIME_TYPE.ARRIVAL"
          required
        />

        <opening-time-select
          v-model="modelValue.endTimeId"
          :label="lang.booking.fields.endTime"
          :date="modelValue.endDate"
          :disable="!modelValue.endDate"
          :type="OPENING_TIME_TYPE.DEPARTURE"
          required
        />

        <div v-if="services">
          <booking-services-select
            v-model="modelValue.serviceIds"
            :services="services"
            :allow-hidden="allowHiddenServices"
          />
        </div>

        <q-input
          v-bind="input"
          id="comments"
          v-model="modelValue.comments"
          class="col-12"
          name="comments"
          :label="lang.customer.fields.comments"
          bottom-slots
          type="textarea"
          rows="3"
        />

        <terms-and-conditions-checkbox
          v-model="termsAndConditions"
          :terms-and-conditions-url="termsAndConditionsUrl"
          :ignore-terms-and-conditions="ignoreTermsAndConditions"
        />

        <approved-after-down-payment-checkbox
          v-model="approvedAfterDownPayment"
          :hide-approved-after-down-payment="hideApprovedAfterDownPayment"
        />
      </div>
    </div>
  </q-form>
</template>

<script lang="ts">
export default {
  name: 'BookingForm'
}
</script>

<script setup lang="ts">
import { ref, watch, computed, toRefs } from 'vue'
import {
  QForm,
  QFormProps,
  QInputProps,
  useQuasar,
  extend,
  date as dateUtil,
  QDate
} from 'quasar'
import { useLang, loadLang } from '../../lang/index.js'
import { ResponsiveDialog } from '@simsustech/quasar-components'
import OpeningTimeSelect from './OpeningTimeSelect.vue'
import BookingServicesSelect from './BookingServicesSelect.vue'
import TermsAndConditionsCheckbox from '../TermsAndConditionsCheckbox.vue'
import { OPENING_TIME_TYPE } from '@petboarding/api/zod'

import type { Booking, Pet, Service } from '@petboarding/api/zod'
export interface Props {
  form?: QFormProps & Partial<HTMLFormElement> & Partial<HTMLDivElement>
  input?: Omit<
    QInputProps,
    | 'id'
    | 'name'
    | 'modelValue'
    | 'label'
    | 'rules'
    | 'type'
    | 'lazy-rules'
    | 'autofocus'
    | ('label' & { style?: Partial<CSSStyleDeclaration> })
  >
  termsAndConditionsUrl?: string
  ignoreTermsAndConditions?: boolean
  hideApprovedAfterDownPayment?: boolean
  pets: Pet[]
  services?: Service[]
  allowHiddenServices?: boolean
  allowPastDates?: boolean
  useOrder?: boolean
}
const props = defineProps<Props>()

const emit = defineEmits<{
  (
    e: 'submit',
    {
      data,
      done
    }: {
      data: Booking
      done: (success?: boolean) => void
    }
  ): void
}>()

const validations = computed<
  Record<string, ((val: string) => boolean | string)[]>
>(() => ({
  comments: [(val) => !!val || lang.value.booking.validations.fieldRequired],
  pets: [(val) => !!val.length || lang.value.booking.validations.fieldRequired]
}))

const initialValue: Booking = {
  startDate: '',
  endDate: '',
  startTimeId: null,
  endTimeId: null,
  petIds: [],
  comments: ''
}

const modelValue = ref<Booking>(initialValue)
const { ignoreTermsAndConditions } = toRefs(props)

const $q = useQuasar()
const lang = useLang()
if (lang.value.isoName !== $q.lang.isoName) loadLang($q.lang.isoName)
watch($q.lang, (val) => {
  loadLang($q.lang.isoName)
})

const formRef = ref<QForm>()
const initialStartDate = ref<string | null>('')
const setValue = (newValue: Booking) => {
  modelValue.value = extend({}, initialValue, {
    ...newValue,
    startDate: newValue.startDate.replaceAll('-', '/'),
    endDate: newValue.endDate.replaceAll('-', '/'),
    startTimeId: newValue.startTimeId || newValue.startTime?.id,
    endTimeId: newValue.endTimeId || newValue.endTime?.id,
    petIds: newValue.petIds?.length
      ? newValue.petIds
      : newValue.pets?.map((pet) => pet.id),
    serviceIds: newValue.serviceIds?.length
      ? newValue.serviceIds
      : newValue.services?.map((bookingService) => bookingService.serviceId)
  })
  dateRange.value = {
    from: newValue.startDate.replaceAll('-', '/'),
    to: newValue.endDate.replaceAll('-', '/')
  }
  initialStartDate.value = newValue.startDate
}

const submit: InstanceType<typeof ResponsiveDialog>['$props']['onSubmit'] = ({
  done
}) => {
  formRef.value?.validate().then((success) => {
    if (success) {
      return emit('submit', {
        data: modelValue.value,
        done
      })
    }
  })
  done(false)
}

const { pets, allowPastDates } = toRefs(props)
const dateRange = ref({
  from: '',
  to: ''
})
const termsAndConditions = ref(false)
const approvedAfterDownPayment = ref(false)

const limitDateOptionsFn = (date: string) => {
  return (
    date >
      dateUtil.formatDate(
        dateUtil.subtractFromDate(
          initialStartDate.value &&
            initialStartDate.value < new Date().toISOString().slice(0, 10)
            ? dateUtil.extractDate(initialStartDate.value, 'YYYY-MM-DD')
            : new Date(),
          {
            days: allowPastDates?.value ? 14 : 2
          }
        ),
        'YYYY/MM/DD'
      ) &&
    date <
      dateUtil.formatDate(
        dateUtil.addToDate(new Date(), { days: 366 }),
        'YYYY/MM/DD'
      )
  )
}
const setDates: InstanceType<typeof QDate>['$props']['onRangeEnd'] = ({
  from,
  to
}) => {
  const startDate = `${from.year}/${from.month}/${from.day}`
  const endDate = `${to.year}/${to.month}/${to.day}`
  if (startDate !== endDate) {
    modelValue.value.startDate = startDate
    modelValue.value.endDate = endDate
  } else {
    dateRange.value = {
      from: '',
      to: ''
    }
  }
}

const removeDates: InstanceType<
  typeof QDate
>['$props']['onUpdate:modelValue'] = (value, reason, details) => {
  if (reason === 'remove-range') {
    modelValue.value.startDate = ''
    modelValue.value.endDate = ''
  }
  if (reason === 'add-range') {
    delete modelValue.value.startTimeId
    delete modelValue.value.endTimeId
  }
}

const petOptions = computed(() =>
  pets.value.map((pet) => ({
    label: pet.name,
    value: pet.id
  }))
)

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

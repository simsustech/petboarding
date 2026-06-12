<template>
  <q-form ref="formRef">
    <div class="row q-col-gutter-sm">
      <form-input
        v-bind="input"
        id="name"
        v-model="modelValue.name"
        class="col-12 col-md-6"
        name="name"
        :label="lang.vacation.fields.name"
        :rules="[(val) => (val && val.length > 0) || 'Required']"
        lazy-rules
      />
      <!-- <form-input
        v-bind="input"
        id="surchargePerDay"
        v-model="modelValue.surchargePerDay"
        class="col-6"
        name="surchargePerDay"
        type="number"
        :label="lang.vacation.fields.surchargePerDay"
      /> -->
      <q-input
        id="surchargePerDay"
        :model-value="
          modelValue.surchargePerDay ? modelValue.surchargePerDay / 100 : 0
        "
        :label="lang.vacation.fields.surchargePerDay"
        class="col-12 col-md-6"
        :prefix="currencySymbols[configuration.CURRENCY]"
        :lang="$q.lang.isoName"
        type="number"
        step="0.01"
        name="surchargePerDay"
        @update:model-value="
          ($event) =>
            (modelValue.surchargePerDay = Math.round(Number($event) * 100))
        "
      />
      <q-date
        v-model="dateRange"
        class="col-md-5 col-12"
        first-day-of-week="1"
        range
        :options="limitDateOptionsFn"
        @update:model-value="removeDates"
        @range-end="setDates"
      />
    </div>
  </q-form>
</template>

<script lang="ts">
export default {
  name: 'VacationForm'
}
</script>

<script setup lang="ts">
import { ref } from 'vue'
import { extend, QDate, QForm, date as dateUtil } from 'quasar'
import { useLang } from '../../lang/index.js'
import { ResponsiveDialog } from '@simsustech/quasar-components'
import { FormInput } from '@simsustech/quasar-components/form'
import { configuration, currencySymbols } from '../../configuration.js'
import type { QFormProps, QInputProps } from 'quasar'

interface VacationData {
  id?: number
  name: string
  startDate: string
  endDate: string
}

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
}
defineProps<Props>()

const emit = defineEmits<{
  (
    e: 'submit',
    {
      data,
      done
    }: {
      data: VacationData
      done: (success?: boolean) => void
    }
  ): void
}>()

const lang = useLang()
const formRef = ref<QForm>()

const initialValue: VacationData = {
  name: '',
  startDate: '',
  endDate: '',
  surchargePerDay: 0
}
const modelValue = ref<VacationData>(extend({}, initialValue))

const setValue = (newValue: VacationData) => {
  modelValue.value = extend({}, initialValue, newValue)
  dateRange.value = {
    from: newValue.startDate.replaceAll('-', '/'),
    to: newValue.endDate.replaceAll('-', '/')
  }
}

const dateRange = ref({
  from: '',
  to: ''
})

const setDates: InstanceType<typeof QDate>['$props']['onRangeEnd'] = ({
  from,
  to
}) => {
  const startDate = `${from.year}/${from.month}/${from.day}`
  const endDate = `${to.year}/${to.month}/${to.day}`
  modelValue.value.startDate = startDate
  modelValue.value.endDate = endDate
}

const removeDates: InstanceType<
  typeof QDate
>['$props']['onUpdate:modelValue'] = (value, reason) => {
  if (reason === 'remove-range') {
    modelValue.value.startDate = ''
    modelValue.value.endDate = ''
  }
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
    done(false)
  })
}

const limitDateOptionsFn = (date: string) => {
  return (
    date >=
      dateUtil.formatDate(
        dateUtil.subtractFromDate(new Date(), {
          years: 1
        }),
        'YYYY/MM/DD'
      ) &&
    date <=
      dateUtil.formatDate(
        dateUtil.addToDate(new Date(), { years: 6 }),
        'YYYY/MM/DD'
      )
  )
}

const variables = ref({})
const functions = ref({
  submit,
  setValue
})
defineExpose({
  variables,
  functions
})
</script>

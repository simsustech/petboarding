<template>
  <q-form ref="formRef">
    <div class="row q-col-gutter-sm">
      <q-date
        v-model="dateRange"
        class="col-md-5 col-12"
        first-day-of-week="1"
        range
        :options="limitDateOptionsFn"
        @update:model-value="removeDates"
        @range-end="setDates"
      />
      <div class="col col-md-6 col-12">
        <period-type-select
          v-model="modelValue.type"
          :label="lang.period.fields.type"
        />
        <form-input
          v-bind="input"
          id="comments"
          v-model="modelValue.comments"
          class="col-12"
          name="comments"
          :label="lang.period.fields.comments"
          bottom-slots
          lazy-rules
          type="textarea"
          rows="3"
        />
        <div v-show="false" class="col-12">
          <div class="row">
            {{ lang.period.fields.minimumRatingForException }}
          </div>
          <div class="row">
            <q-rating
              v-if="modelValue.minimumRatingForException !== void 0"
              :model-value="modelValue.minimumRatingForException || 0"
              size="3em"
              icon="star_border"
              icon-selected="star"
              icon-half="star_half"
              @update:model-value="
                ($event) => (modelValue.minimumRatingForException = $event)
              "
            />
          </div>
        </div>
      </div>
    </div>
  </q-form>
</template>

<script lang="ts">
export default {
  name: 'PeriodForm'
}
</script>

<script setup lang="ts">
import { ref } from 'vue'
import { extend, QDate, QForm, date as dateUtil } from 'quasar'
import { useLang } from '../../lang/index.js'
import { ResponsiveDialog } from '@simsustech/quasar-components'
import { FormInput } from '@simsustech/quasar-components/form'
import { Period, PERIOD_TYPE } from '@petboarding/api/zod'
import PeriodTypeSelect from './PeriodTypeSelect.vue'
import type { QFormProps, QInputProps } from 'quasar'

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
      data: Period
      done: (success?: boolean) => void
    }
  ): void
}>()

const lang = useLang()

const formRef = ref<QForm>()

const initialValue = {
  name: '',
  startDate: '',
  endDate: '',
  type: PERIOD_TYPE.UNAVAILABLE_FOR_ALL,
  comments: '',
  minimumRatingForException: null
}
const modelValue = ref<Period>(initialValue)

const setValue = (newValue: Period) => {
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
    date >
      dateUtil.formatDate(
        dateUtil.subtractFromDate(new Date(), {
          days: 2
        }),
        'YYYY/MM/DD'
      ) &&
    date <
      dateUtil.formatDate(
        dateUtil.addToDate(new Date(), { days: 366 }),
        'YYYY/MM/DD'
      )
  )
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

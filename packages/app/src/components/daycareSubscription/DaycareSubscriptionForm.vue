<template>
  <q-form ref="formRef">
    <div class="row q-col-gutter-sm">
      <form-input
        v-bind="input"
        id="title"
        v-model="modelValue.description"
        required
        class="col-12 col-md-6"
        name="title"
        :label="lang.daycareSubscription.fields.description"
        bottom-slots
        lazy-rules
      />

      <q-input
        v-model.number="modelValue.numberOfDays"
        class="col-12 col-md-3"
        :label="lang.daycareSubscription.fields.numberOfDays"
        :step="1"
      />

      <q-field
        :label="lang.daycareSubscription.fields.validityPeriod"
        class="col-12 col-md-3"
        stack-label
        bottom-slots
      >
        <div class="row justify-between">
          <q-input
            v-model.number="modelValue.validityPeriod.years"
            class="col q-mr-md"
            :placeholder="lang.daycareSubscription.labels.years"
            :step="1"
            style="width: 8ch; margin-top: -2em; margin-bottom: -0.5em"
            :suffix="lang.daycareSubscription.labels.years"
          />
          <q-input
            v-model.number="modelValue.validityPeriod.months"
            class="col q-mr-md"
            :placeholder="lang.daycareSubscription.labels.months"
            :step="1"
            style="width: 8ch; margin-top: -2em; margin-bottom: -0.5em"
            :suffix="lang.daycareSubscription.labels.months"
          />
          <q-input
            v-model.number="modelValue.validityPeriod.days"
            class="col"
            :placeholder="lang.daycareSubscription.labels.days"
            :step="1"
            style="width: 8ch; margin-top: -2em; margin-bottom: -0.5em"
            :suffix="lang.daycareSubscription.labels.days"
          />
        </div>
      </q-field>
      <q-input
        :model-value="modelValue.listPrice / 100"
        :label="lang.daycareSubscription.fields.listPrice"
        class="col-12 col-md-3"
        :prefix="currencySymbols[configuration.CURRENCY]"
        type="number"
        step="0.01"
        @update:model-value="
          modelValue.listPrice = Math.round(Number($event) * 100)
        "
      />
    </div>
  </q-form>
</template>

<script lang="ts">
export default {
  name: 'DaycareSubscriptionForm'
}
</script>

<script setup lang="ts">
import { ref } from 'vue'
import { extend, QForm } from 'quasar'
import { useLang } from '../../lang/index.js'
import { ResponsiveDialog } from '@simsustech/quasar-components'
import { FormInput } from '@simsustech/quasar-components/form'
import { DaycareSubscription } from '@petboarding/api/zod'
import { useConfiguration } from '../../configuration.js'
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
      data: DaycareSubscription
      done: (success?: boolean) => void
    }
  ): void
}>()

const lang = useLang()
const configuration = useConfiguration()

const currencySymbols = ref({
  EUR: '€',
  USD: '$'
})

const formRef = ref<QForm>()

const initialValue = {
  description: '',
  numberOfDays: 0,
  validityPeriod: {
    years: 1,
    months: 0,
    days: 0
  },
  listPrice: 0
}
const modelValue = ref<DaycareSubscription>(initialValue)

const setValue = (newValue: DaycareSubscription) => {
  modelValue.value = extend({}, initialValue, newValue)
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

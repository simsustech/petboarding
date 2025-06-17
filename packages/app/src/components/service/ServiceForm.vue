<template>
  <q-form ref="formRef">
    <div class="grid grid-cols-12 gap-3">
      <form-input
        v-bind="input"
        v-model="modelValue.name"
        class="col-span-12 md:col-span-3"
        required
        field="name"
        bottom-slots
        lazy-rules
        name="name"
      />

      <form-input
        v-bind="input"
        v-model="modelValue.description"
        class="col-span-12 md:cols-span-3"
        required
        :label="lang.service.fields.description"
        bottom-slots
        lazy-rules
        name="description"
      />

      <service-type-select
        v-model="modelValue.type"
        class="col-span-12 md:col-span-3"
      />

      <q-input
        v-model.number="modelValue.listPrice"
        class="col-span-12"
        :label="lang.service.fields.listPrice"
        :prefix="configuration.CURRENCY"
        :hint="lang.service.helpers.priceHint"
        mask="#.##"
        fill-mask="0"
        unmasked-value
        reverse-fill-mask
      />

      <boolean-select
        v-model="modelValue.hidden"
        :label="lang.service.fields.hidden"
        class="col-span-12 md:col-span-4"
        required
        name="sterilized"
      />

      <boolean-select
        v-model="modelValue.disabled"
        :label="lang.service.fields.disabled"
        class="col-span-12 md:col-span-4"
        required
        name="sterilized"
      />
    </div>
  </q-form>
</template>

<script lang="ts">
export default {
  name: 'ServiceForm'
}
</script>

<script setup lang="ts">
import { ref } from 'vue'
import { extend, QForm } from 'quasar'
import { useLang } from '../../lang/index.js'
import { ResponsiveDialog } from '@simsustech/quasar-components'
import { BooleanSelect, FormInput } from '@simsustech/quasar-components/form'
import { Service, SERVICE_TYPE } from '@petboarding/api/zod'
import { useConfiguration } from '../../configuration.js'
import ServiceTypeSelect from './ServiceTypeSelect.vue'
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
      data: Service
      done: (success?: boolean) => void
    }
  ): void
}>()

const lang = useLang()
const configuration = useConfiguration()

const formRef = ref<QForm>()

const initialValue = {
  name: '',
  description: '',
  type: SERVICE_TYPE.APPOINTMENT,
  listPrice: null,
  hidden: false,
  disabled: false
}
const modelValue = ref<Service>(initialValue)

const setValue = (newValue: Service) => {
  modelValue.value = extend({}, initialValue, newValue)
}

const submit: InstanceType<typeof ResponsiveDialog>['$props']['onSubmit'] = ({
  done
}) => {
  formRef.value?.validate().then((success) => {
    if (success) {
      return emit('submit', {
        data: {
          ...modelValue.value,
          listPrice: Number.isInteger(modelValue.value.listPrice)
            ? modelValue.value.listPrice
            : null
        },
        done
      })
    }
    done(false)
  })
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

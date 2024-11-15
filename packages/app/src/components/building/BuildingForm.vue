<template>
  <q-form ref="formRef">
    <div class="row q-col-gutter-sm">
      <form-input
        v-bind="input"
        id="name"
        v-model="modelValue.name"
        required
        class="col-12 col-md-6"
        name="name"
        :label="lang.building.fields.name"
        bottom-slots
        lazy-rules
      />
      <form-input
        v-bind="input"
        id="location"
        v-model="modelValue.location"
        required
        class="col-12 col-md-6"
        name="location"
        :label="lang.building.fields.location"
        bottom-slots
        lazy-rules
      />
      <form-input
        v-bind="input"
        id="description"
        v-model="modelValue.description"
        required
        class="col-12 col-md-6"
        name="description"
        :label="lang.building.fields.description"
        bottom-slots
        lazy-rules
      />

      <q-input
        v-bind="input"
        v-model.number="modelValue.order"
        class="col-md-3 col-12"
        required
        field="order"
        bottom-slots
        lazy-rules
        name="order"
        type="number"
        :hint="lang.building.helpers.orderHint"
        :label="lang.building.fields.order"
      />
    </div>
  </q-form>
</template>

<script lang="ts">
export default {
  name: 'BuildingForm'
}
</script>

<script setup lang="ts">
import { ref } from 'vue'
import { extend, QForm } from 'quasar'
import { useLang } from '../../lang/index.js'
import { ResponsiveDialog } from '@simsustech/quasar-components'
import { FormInput } from '@simsustech/quasar-components/form'
import { Building, ANNOUNCEMENT_TYPE } from '@petboarding/api/zod'
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
      data: Building
      done: (success?: boolean) => void
    }
  ): void
}>()

const lang = useLang()

const formRef = ref<QForm>()

const initialValue = {
  title: '',
  message: '',
  expirationDate: '',
  type: ANNOUNCEMENT_TYPE.GENERAL,
  comments: ''
}
const modelValue = ref<Building>(initialValue)

const setValue = (newValue: Building) => {
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

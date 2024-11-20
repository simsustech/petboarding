<template>
  <q-form ref="formRef">
    <div class="row q-col-gutter-sm">
      <building-select
        v-model="modelValue.buildingId"
        class="col-12 col-md-6"
        required
        :filtered-options="buildings"
      />
      <form-input
        v-bind="input"
        id="name"
        v-model="modelValue.name"
        required
        class="col-12 col-md-6"
        name="name"
        :label="lang.kennel.fields.name"
        bottom-slots
        lazy-rules
      />
      <form-input
        v-bind="input"
        id="description"
        v-model="modelValue.description"
        class="col-12 col-md-6"
        name="description"
        :label="lang.kennel.fields.description"
        bottom-slots
        lazy-rules
      />

      <q-input
        v-bind="input"
        v-model.number="modelValue.capacity"
        class="col-md-3 col-12"
        required
        field="capacity"
        bottom-slots
        lazy-rules
        name="capacity"
        type="number"
        :label="lang.kennel.fields.capacity"
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
        :hint="lang.kennel.helpers.orderHint"
        :label="lang.kennel.fields.order"
      />
    </div>
  </q-form>
</template>

<script lang="ts">
export default {
  name: 'KennelForm'
}
</script>

<script setup lang="ts">
import { ref } from 'vue'
import { extend, QForm } from 'quasar'
import { useLang } from '../../lang/index.js'
import { ResponsiveDialog } from '@simsustech/quasar-components'
import { FormInput } from '@simsustech/quasar-components/form'
import { Kennel, Building } from '@petboarding/api/zod'
import BuildingSelect from '../building/BuildingSelect.vue'
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
  buildings: Building[]
}
defineProps<Props>()

const emit = defineEmits<{
  (
    e: 'submit',
    {
      data,
      done
    }: {
      data: Kennel
      done: (success?: boolean) => void
    }
  ): void
}>()

const lang = useLang()

const formRef = ref<QForm>()

const initialValue = {
  buildingId: NaN,
  name: '',
  description: '',
  capacity: null,
  order: null
}
const modelValue = ref<Kennel>(initialValue)

const setValue = (newValue: Kennel) => {
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

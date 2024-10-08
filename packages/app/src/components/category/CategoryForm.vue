<template>
  <q-form ref="formRef">
    <div class="row q-col-gutter-sm">
      <pet-species-select
        v-bind="input"
        v-model="modelValue.species"
        class="col-md-2 col-12"
        required
        bottom-slots
        lazy-rules
        name="speies"
      />

      <form-input
        v-bind="input"
        v-model="modelValue.name"
        class="col-md-3 col-12"
        required
        field="name"
        bottom-slots
        lazy-rules
        name="name"
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
        :hint="lang.category.helpers.orderHint"
        :label="lang.category.fields.order"
      />

      <!-- <q-input
        v-model.number="modelValue.price"
        class="col-12"
        :label="lang.category.fields.price"
        :prefix="configuration.CURRENCY"
        mask="#.##"
        fill-mask="0"
        unmasked-value
        reverse-fill-mask
      /> -->
    </div>
  </q-form>
</template>

<script lang="ts">
export default {
  name: 'CategoryForm'
}
</script>

<script setup lang="ts">
import { ref } from 'vue'
import { extend, QForm } from 'quasar'
import { useLang } from '../../lang/index.js'
import { ResponsiveDialog } from '@simsustech/quasar-components'
import { Category } from '@petboarding/api/zod'
// import { useConfiguration } from '../../configuration.js'
import PetSpeciesSelect from '../pet/PetSpeciesSelect.vue'
import { FormInput } from '@simsustech/quasar-components/form'
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
      data: Category
      done: (success?: boolean) => void
    }
  ): void
}>()

const lang = useLang()
// const configuration = useConfiguration()

const formRef = ref<QForm>()

const initialValue = {
  name: '',
  species: 'dog',
  order: 0,
  price: null,
  productId: null
}
const modelValue = ref<Category>(initialValue)

const setValue = (newValue: Category) => {
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

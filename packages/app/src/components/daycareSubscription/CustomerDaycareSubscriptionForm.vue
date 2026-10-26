<template>
  <q-form ref="formRef" class="grid grid-cols-12 gap-3">
    <q-input
      v-bind="input"
      v-model="modelValue.expirationDate"
      class="col-span-12"
      type="date"
      required
      label="Expiration date"
      name="expirationDate"
    />
  </q-form>
</template>

<script lang="ts">
export default {
  name: 'CustomerDaycareSubscriptionForm'
}
</script>

<script setup lang="ts">
import { ref } from 'vue'
import { QForm, QFormProps, QInputProps, extend } from 'quasar'
import { ResponsiveDialog } from '@simsustech/quasar-components'

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
const props = defineProps<Props>()

const emit = defineEmits<{
  (
    e: 'submit',
    {
      data,
      done
    }: {
      data: { id: number; expirationDate: string }
      done: (success?: boolean) => void
    }
  ): void
}>()

const initialValue = {
  expirationDate: ''
}

const modelValue = ref<{
  id: number
  expirationDate: string
}>({
  id: 0,
  ...initialValue
})

const formRef = ref<QForm>()

const setValue = (newValue: { id: number; expirationDate: string }) => {
  modelValue.value = extend(
    {},
    { ...modelValue.value, ...initialValue },
    newValue
  )
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

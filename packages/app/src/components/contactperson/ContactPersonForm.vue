<template>
  <q-form :key="updateCounter" ref="formRef">
    <div class="grid grid-cols-12 grid-flow-row gap-3">
      <form-input
        v-bind="input"
        v-model="modelValue.firstName"
        class="col-span-12 md:col-span-4"
        required
        field="firstName"
        bottom-slots
        lazy-rules
        name="firstName"
      />
      <form-input
        v-bind="input"
        v-model="modelValue.lastName"
        class="col-span-12 md:col-span-4"
        required
        field="lastName"
        bottom-slots
        lazy-rules
        name="lastName"
      />

      <telephone-number-input
        v-bind="input"
        v-model="modelValue.telephoneNumber"
        class="col-span-12 md:col-span-4"
        required
        bottom-slots
        lazy-rules
        type="tel"
        name="telephonenumber"
      />
    </div>
  </q-form>
</template>

<script lang="ts">
export default {
  name: 'ContactPersonForm'
}
</script>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { QForm, QFormProps, QInputProps, useQuasar, extend } from 'quasar'
import { useLang, loadLang } from '../../lang/index.js'
import { ResponsiveDialog } from '@simsustech/quasar-components'
import {
  FormInput,
  TelephoneNumberInput
} from '@simsustech/quasar-components/form'
import type { ContactPerson } from '@petboarding/api/zod'
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
// const attrs = useAttrs();
const emit = defineEmits<{
  (
    e: 'submit',
    {
      contactPerson,
      done
    }: {
      contactPerson: ContactPerson
      done: (success?: boolean) => void
    }
  ): void
}>()

const initialValue: ContactPerson = {
  firstName: '',
  lastName: '',
  telephoneNumber: ''
}

const modelValue = ref<ContactPerson>(initialValue)
const updateCounter = ref(1)

const $q = useQuasar()
const lang = useLang()
if (lang.value.isoName !== $q.lang.isoName) loadLang($q.lang.isoName)
watch($q.lang, (val) => {
  loadLang($q.lang.isoName)
})

const formRef = ref<QForm>()

const setValue = (newValue: ContactPerson) => {
  modelValue.value = extend({}, initialValue, newValue)
}

const submit: InstanceType<typeof ResponsiveDialog>['$props']['onSubmit'] = ({
  done
}) => {
  formRef.value?.validate().then((success) => {
    if (success) {
      return emit('submit', {
        contactPerson: modelValue.value,
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

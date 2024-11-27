<template>
  <q-form ref="formRef" class="row justtify-center">
    <gender-select
      v-bind="input"
      id="gender"
      v-model="modelValue.gender"
      class="col-md-4 col-12"
      name="gender"
      bottom-slots
      required
      :rules="validations['gender']"
      lazy-rules
    />

    <form-input
      v-bind="input"
      v-model="modelValue.firstName"
      class="col-md-4 col-12"
      required
      field="firstName"
      bottom-slots
      lazy-rules
      autocomplete="given-name"
      name="fname"
    />
    <form-input
      v-bind="input"
      v-model="modelValue.lastName"
      class="col-md-4 col-12"
      required
      field="lastName"
      bottom-slots
      lazy-rules
      autocomplete="family-name"
      name="lname"
    />
    <form-input
      v-bind="input"
      v-model="modelValue.address"
      class="col-md-4 col-12"
      required
      field="address"
      bottom-slots
      lazy-rules
      autocomplete="street-address"
      name="address"
    />
    <form-input
      v-bind="input"
      v-model="modelValue.city"
      class="col-md-4 col-12"
      required
      field="city"
      bottom-slots
      lazy-rules
      autocomplete="address-level2"
      name="city"
    />

    <postal-code-input
      v-bind="input"
      id="postalCode"
      v-model="modelValue.postalCode"
      :country="configuration.COUNTRY"
      required
      class="col-md-4 col-12"
      name="zip"
      bottom-slots
      lazy-rules
      autocomplete="postal-code"
    />

    <telephone-number-input
      v-bind="input"
      v-model="modelValue.telephoneNumber"
      class="col-md-4 col-12"
      required
      bottom-slots
      lazy-rules
      type="tel"
      name="telephonenumber"
    />

    <form-input
      v-bind="input"
      id="veterinarian"
      v-model="modelValue.veterinarian"
      class="col-md-8 col-12"
      name="veterinarian"
      :label="lang.customer.fields.veterinarian"
      bottom-slots
      required
      lazy-rules
    />
    <q-input
      v-if="useComments"
      v-bind="input"
      id="comments"
      v-model="modelValue.comments"
      class="col-12"
      name="comments"
      :label="lang.customer.fields.comments"
      bottom-slots
      :rules="validations['comments']"
      lazy-rules
      type="textarea"
      rows="3"
    />
    <div class="col-12 text-center">
      <q-rating
        v-if="useRating && modelValue.rating !== void 0"
        :model-value="modelValue.rating || 0"
        size="3em"
        icon="star_border"
        icon-selected="star"
        icon-half="star_half"
        @update:model-value="($event) => (modelValue.rating = $event)"
      />
    </div>
  </q-form>
</template>

<script lang="ts">
export default {
  name: 'CustomerForm'
}
</script>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { QForm, QFormProps, QInputProps, useQuasar, extend } from 'quasar'
import { useLang, loadLang } from '../../lang/index.js'
import { ResponsiveDialog } from '@simsustech/quasar-components'
import {
  GenderSelect,
  PostalCodeInput,
  FormInput,
  TelephoneNumberInput
} from '@simsustech/quasar-components/form'
import type { Customer } from '@petboarding/api/zod'
import { useConfiguration } from '../../configuration.js'

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
  useComments?: boolean
  useRating?: boolean
}
const props = defineProps<Props>()
// const attrs = useAttrs();
const emit = defineEmits<{
  (
    e: 'submit',
    {
      customer,
      done
    }: {
      customer: Customer
      done: (success?: boolean) => void
    }
  ): void
}>()

const configuration = useConfiguration()

const validations = computed<
  Record<string, ((val: string) => boolean | string)[]>
>(() => ({
  firstName: [(val) => !!val || lang.value.customer.validations.fieldRequired]
}))

const initialValue: Customer = {
  gender: null,
  firstName: '',
  lastName: '',
  address: '',
  postalCode: '',
  city: '',
  telephoneNumber: '',
  veterinarian: ''
}
if (props.useComments) initialValue.comments = ''
if (props.useRating) initialValue.rating = 0

const modelValue = ref<Customer>(initialValue)

const $q = useQuasar()
const lang = useLang()
if (lang.value.isoName !== $q.lang.isoName) loadLang($q.lang.isoName)
watch($q.lang, (val) => {
  loadLang($q.lang.isoName)
})

const formRef = ref<QForm>()

const setValue = (newValue: Customer) => {
  modelValue.value = extend({}, initialValue, newValue)
}

const submit: InstanceType<typeof ResponsiveDialog>['$props']['onSubmit'] = ({
  done
}) => {
  formRef.value?.validate().then((success) => {
    if (success) {
      return emit('submit', {
        customer: modelValue.value,
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

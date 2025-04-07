<template>
  <q-form ref="formRef" class="row justtify-center">
    <div class="row q-gutter-md">
      <q-input
        :model-value="modelValue.price ? modelValue.price / 100 : 0"
        :label="lang.service.fields.price"
        class="col-12"
        :prefix="currencySymbols[configuration.CURRENCY]"
        :lang="$q.lang.isoName"
        type="number"
        step="0.01"
        @update:model-value="
          ($event) => (modelValue.price = Math.round(Number($event) * 100))
        "
      />
      <!-- <q-input
        v-model.number="modelValue.price"
        class="col-12"
        :label="lang.service.fields.price"
        :prefix="currencySymbols[configuration.CURRENCY]"
        mask="#.##"
        fill-mask="0"
        unmasked-value
        reverse-fill-mask
      /> -->
    </div>
    <q-input
      v-bind="input"
      id="comments"
      v-model="modelValue.comments"
      class="col-12"
      name="comments"
      :label="lang.service.fields.comments"
      bottom-slots
      type="textarea"
      rows="3"
    />
  </q-form>
</template>

<script lang="ts">
export default {
  name: 'BookingServiceForm'
}
</script>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { QForm, QFormProps, QInputProps, useQuasar } from 'quasar'
import { useLang, loadLang } from '../../lang/index.js'
import { ResponsiveDialog } from '@simsustech/quasar-components'
import { useConfiguration } from '../../configuration.js'
import type { BookingService } from '@petboarding/api/zod'
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

const currencySymbols = ref({
  EUR: '€',
  USD: '$'
})

const configuration = useConfiguration()
defineProps<Props>()

const emit = defineEmits<{
  (
    e: 'submit',
    {
      data,
      done
    }: {
      data: BookingService
      done?: (success?: boolean) => void
    }
  ): void
}>()

const initialValue: BookingService = {
  bookingId: null,
  serviceId: null,
  comments: '',
  price: null
}

const modelValue = ref<BookingService>(initialValue)

const $q = useQuasar()
const lang = useLang()
if (lang.value.isoName !== $q.lang.isoName) loadLang($q.lang.isoName)
watch($q.lang, (val) => {
  loadLang($q.lang.isoName)
})

const formRef = ref<QForm>()

const setValue = (newValue: BookingService) => {
  modelValue.value = {
    id: newValue.id,
    bookingId: newValue.bookingId,
    serviceId: newValue.serviceId,
    comments: newValue.comments || '',
    price: newValue.price || 0
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

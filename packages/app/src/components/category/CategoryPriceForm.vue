<template>
  <q-form ref="formRef">
    <div class="row q-col-gutter-sm">
      <date-input
        v-model="modelValue.date"
        :label="lang.categoryPrice.fields.date"
        format="DD-MM-YYYY"
        required
        clearable
        class="col-md-6 col-12"
        :date="{
          noUnset: true,
          firstDayOfWeek: '1'
        }"
      />
      <q-input
        :model-value="modelValue.listPrice ? modelValue.listPrice / 100 : 0"
        :label="lang.categoryPrice.fields.listPrice"
        class="col-12 col-md-6"
        :prefix="currencySymbols[configuration.CURRENCY]"
        :lang="$q.lang.isoName"
        type="number"
        step="0.01"
        @update:model-value="
          ($event) => (modelValue.listPrice = Math.round(Number($event) * 100))
        "
      />
    </div>
  </q-form>
</template>

<script lang="ts">
export default {
  name: 'CategoryPriceForm'
}
</script>

<script setup lang="ts">
import { ref } from 'vue'
import { extend, QForm, useQuasar } from 'quasar'
import { useLang } from '../../lang/index.js'
import { ResponsiveDialog } from '@simsustech/quasar-components'
import { DateInput } from '@simsustech/quasar-components/form'
import { CategoryPrice } from '@petboarding/api/zod'
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
      data: CategoryPrice
      done: (success?: boolean) => void
    }
  ): void
}>()

const lang = useLang()
const configuration = useConfiguration()
const $q = useQuasar()

const currencySymbols = ref({
  EUR: '€',
  USD: '$'
})

const formRef = ref<QForm>()

const initialValue = {
  categoryId: NaN,
  date: new Date().toISOString().slice(0, 10),
  listPrice: 0
}
const modelValue = ref<CategoryPrice>(initialValue)

const setValue = (newValue: CategoryPrice) => {
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

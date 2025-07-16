<template>
  <q-form ref="formRef">
    <div class="grid grid-cols-12 gap-3">
      <form-input
        v-bind="input"
        id="title"
        v-model="modelValue.title"
        required
        class="col-span-12 md:col-span-6"
        name="title"
        :label="lang.announcement.fields.title"
        bottom-slots
        lazy-rules
      />

      <announcement-type-select
        v-model="modelValue.type"
        class="col-span-12 md:col-span-6"
        :label="lang.announcement.fields.type"
      />

      <form-input
        v-bind="input"
        id="message"
        v-model="modelValue.message"
        required
        class="col-span-12"
        name="message"
        :label="lang.announcement.fields.message"
        bottom-slots
        lazy-rules
        type="textarea"
        rows="3"
      />
      <date-input
        v-model="modelValue.expirationDate"
        :label="lang.announcement.fields.expirationDate"
        format="DD-MM-YYYY"
        required
        clearable
        class="col-span-12 md:col-span-6"
        :date="{
          noUnset: true,
          firstDayOfWeek: '1'
        }"
        :icons="{
          event: 'i-mdi-event',
          clear: 'i-mdi-clear'
        }"
      />
    </div>
  </q-form>
</template>

<script lang="ts">
export default {
  name: 'AnnouncementForm'
}
</script>

<script setup lang="ts">
import { ref } from 'vue'
import { extend, QForm } from 'quasar'
import { useLang } from '../../lang/index.js'
import { ResponsiveDialog } from '@simsustech/quasar-components'
import { DateInput, FormInput } from '@simsustech/quasar-components/form'
import { Announcement, ANNOUNCEMENT_TYPE } from '@petboarding/api/zod'
import AnnouncementTypeSelect from './AnnouncementTypeSelect.vue'
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
      data: Announcement
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
const modelValue = ref<Announcement>(initialValue)

const setValue = (newValue: Announcement) => {
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

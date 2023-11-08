<template>
  <q-form ref="formRef">
    <email-input
      v-model:subject="modelValue.subject"
      v-model:body="modelValue.body"
    />
  </q-form>
</template>

<script lang="ts">
export default {
  name: 'BookingEmailReplyForm'
}
</script>

<script setup lang="ts">
import { ref } from 'vue'
import { extend, QForm } from 'quasar'
import { EmailInput } from '@simsustech/quasar-components/form'
import { ResponsiveDialog } from '@simsustech/quasar-components'
import { EmailTemplate } from '@petboarding/api/zod'

const emit = defineEmits<{
  (
    e: 'submit',
    {
      data,
      done
    }: {
      data: EmailTemplate
      done: (success?: boolean) => void
    }
  ): void
}>()

const formRef = ref<QForm>()

const modelValue = ref<EmailTemplate>({
  name: 'approveBooking',
  subject: '',
  body: ''
})

const setValue = (newValue: EmailTemplate) => {
  modelValue.value = extend(
    {},
    {
      name: '',
      subject: '',
      body: ''
    },
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
  })
  done(false)
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

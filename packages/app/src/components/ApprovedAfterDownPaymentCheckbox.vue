<template>
  <div v-show="!hideApprovedAfterDownPayment">
    <q-field
      :rules="rules"
      :model-value="modelValue"
      borderless
      :error-message="lang.booking.validations.approvedAfterDownPayment"
    >
      <q-checkbox
        ref="approvedAfterDownPaymentRef"
        :model-value="modelValue"
        color="primary"
        @update:model-value="(evt) => $emit('update:model-value', evt)"
      >
        <template #default>
          {{ lang.booking.messages.approvedAfterDownPayment }}
        </template>
      </q-checkbox>
    </q-field>
  </div>
</template>

<script lang="ts">
export default {
  name: 'TermsAndConditionsCheckbox'
}
</script>

<script setup lang="ts">
import { ref, toRefs } from 'vue'
import { useLang } from '../lang/index.js'

export interface Props {
  modelValue: boolean
  hideApprovedAfterDownPayment?: boolean
}
const props = defineProps<Props>()
const lang = useLang()

const { hideApprovedAfterDownPayment } = toRefs(props)

const rules = ref([
  (val: boolean) => {
    return !!val || !!hideApprovedAfterDownPayment.value
  }
])
</script>

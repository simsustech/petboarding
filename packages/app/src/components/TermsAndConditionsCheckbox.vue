<template>
  <q-field
    v-show="!ignoreTermsAndConditions"
    :rules="rules"
    :model-value="modelValue"
    borderless
    hide-bottom-space
    :error-message="lang.booking.validations.termsAndConditions"
  >
    <q-checkbox
      ref="termsAndConditionsRef"
      :model-value="modelValue"
      color="primary"
      @update:model-value="(evt) => $emit('update:model-value', evt)"
    >
      <template #default>
        {{ lang.booking.messages.termsAndConditions }}
      </template>
    </q-checkbox>
    <template #hint>
      <a
        :href="termsAndConditionsUrl"
        target="_blank"
        class="col-12"
        @click.stop
      >
        {{ lang.booking.messages.viewTermsAndConditions }}
      </a>
    </template>
  </q-field>
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
  termsAndConditionsUrl?: string
  ignoreTermsAndConditions?: boolean
}
const props = defineProps<Props>()
const lang = useLang()

const { ignoreTermsAndConditions } = toRefs(props)

const rules = ref([
  (val: boolean) => {
    return !!val || !!ignoreTermsAndConditions.value
  }
])
</script>

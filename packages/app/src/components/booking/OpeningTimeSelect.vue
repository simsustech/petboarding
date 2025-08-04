<template>
  <q-select
    :label="`${label}${required ? '*' : ''}`"
    v-bind="attrs"
    :rules="validations"
    :model-value="modelValue"
    :options="openingTimeOptions"
    emit-value
    map-options
    lazy-rules
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #no-option>
      <q-item>
        <q-item-section class="text-italic text-grey">
          {{ lang.openingTime.messages.noOpeningTimesOnSelectedDate }}
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script lang="ts">
export default {
  name: 'OpeningTimeSelect'
}
</script>

<script setup lang="ts">
import { useAttrs, ref, toRefs, computed } from 'vue'
import { QSelect, ValidationRule } from 'quasar'
import { useLang } from '../../lang/index.js'
import { OpeningTime } from '@petboarding/api/zod'

export interface Props {
  modelValue?: string | number
  required?: boolean
  label: string
  options: OpeningTime[]
}
const props = defineProps<Props>()

const { options } = toRefs(props)

const attrs = useAttrs()
defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()
const lang = useLang()

const validations = ref<ValidationRule[]>([])

if (props.required)
  validations.value.push(
    (val: unknown) => !!val || lang.value.booking.validations.fieldRequired
  )

const openingTimeOptions = computed(() => {
  return (
    options.value.map((openingTime) => ({
      label: openingTime.name,
      value: openingTime.id
    })) || []
  )
})
</script>

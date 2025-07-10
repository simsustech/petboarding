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
import { watch, useAttrs, ref, toRefs, computed } from 'vue'
import { QSelect, useQuasar, ValidationRule } from 'quasar'
import { useLang, loadLang } from '../../lang/index.js'
import { OPENING_TIME_TYPE } from '@petboarding/api/zod'
import { useAccountGetOpeningTimesQuery } from 'src/queries/account/openingTime.js'

export interface Props {
  modelValue?: string | number
  required?: boolean
  label: string
  date: string
  type?: OPENING_TIME_TYPE
}
const props = defineProps<Props>()

const { date, type } = toRefs(props)

const { openingTimes: data, date: openingTimesDate } =
  useAccountGetOpeningTimesQuery()

watch(date, (newVal) => (openingTimesDate.value = newVal))

const attrs = useAttrs()
defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()
const lang = useLang()

const $q = useQuasar()
if (lang.value.isoName !== $q.lang.isoName) loadLang($q.lang.isoName)
watch($q.lang, () => {
  loadLang($q.lang.isoName)
})

const validations = ref<ValidationRule[]>([])

if (props.required)
  validations.value.push(
    (val: unknown) => !!val || lang.value.booking.validations.fieldRequired
  )

const openingTimeOptions = computed(() => {
  return (
    data.value
      ?.filter(
        (openingTime) =>
          openingTime.type === OPENING_TIME_TYPE.ALL ||
          openingTime.type === type.value
      )
      .map((openingTime) => ({
        label: openingTime.name,
        value: openingTime.id
      })) || []
  )
})
</script>

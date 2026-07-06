<template>
  <q-field :label="lang.pet.fields.food" stack-label class="pet-food-input">
    <template #control>
      <div
        class="row items-center no-wrap"
        style="gap: 4px; background: transparent; border: 0"
      >
        <div style="flex: 1; min-width: 0">
          <q-input
            :model-value="modelValue.timesADay"
            borderless
            :filled="false"
            :outlined="false"
            :standout="false"
            :rounded="false"
            type="number"
            step="1"
            inputmode="numeric"
            :placeholder="lang.pet.food.fields.timesADay"
            input-class="text-right"
            suffix="x"
            @update:model-value="
              updateKey('timesADay', Math.round(Number($event)))
            "
          >
          </q-input>
        </div>
        <div style="flex: 2; min-width: 0">
          <q-input
            :model-value="modelValue.amount"
            type="number"
            step="0.1"
            inputmode="numeric"
            :placeholder="lang.pet.food.fields.amount"
            input-class="text-right"
            @update:model-value="
              updateKey('amount', Math.round(Number($event) * 100) / 100)
            "
          />
        </div>
        <div style="flex: 2; min-width: 0">
          <q-select
            :model-value="modelValue.amountUnit"
            :placeholder="lang.pet.food.fields.amountUnit"
            map-options
            emit-value
            :options="amountUnitOptions"
            @update:model-value="updateKey('amountUnit', $event)"
          />
        </div>
        <div style="flex: 7; min-width: 0">
          <q-input
            :model-value="modelValue.kind"
            :placeholder="lang.pet.food.fields.kind"
            @update:model-value="updateKey('kind', $event)"
          />
        </div>
      </div>
    </template>
  </q-field>
</template>

<script setup lang="ts">
import type { Pet } from '@petboarding/api/zod'
import { computed, toRefs } from 'vue'
import { useLang } from '../../lang/index.js'
import { extend } from 'quasar'

interface Props {
  modelValue: Pet['food']
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (
    e: 'update:model-value',
    food: {
      timesADay: number
      amount: number
      amountUnit: 'gram' | 'pieces'
      kind: string
    }
  ): void
}>()

const lang = useLang()

const { modelValue } = toRefs(props)

const amountUnitOptions = computed(() => [
  {
    label: lang.value.pet.food.unit.gram,
    value: 'gram'
  },
  {
    label: lang.value.pet.food.unit.pieces,
    value: 'pieces'
  }
])

const updateKey = (key: string, value: unknown) =>
  emit(
    'update:model-value',
    extend(true, {}, modelValue.value, { [key]: value })
  )
</script>

<style scoped>
:deep(input[type='number']) {
  -moz-appearance: textfield;
}
:deep(input::-webkit-outer-spin-button),
:deep(input::-webkit-inner-spin-button) {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}

.pet-food-input.q-field--standard > .q-field__inner > .q-field__control::before,
.pet-food-input.q-field--standard > .q-field__inner > .q-field__control::after {
  display: none !important;
}

.pet-food-input.q-field--auto-height.q-field--labeled .q-field__native {
  padding-bottom: 0 !important;
}

/* Remove padding from inner QInput/QSelect controls */
.pet-food-input
  :deep(
    .row.items-center.no-wrap .q-field__control.relative-position.row.no-wrap
  ) {
  padding-inline: 0 !important;
}
.pet-food-input :deep(.row.items-center.no-wrap .q-field__native) {
  padding: 0 !important;
}

.pet-food-input :deep(.row.items-center.no-wrap .q-field__control-container) {
  padding-top: 0 !important;
}

.pet-food-input :deep(.row.items-center.no-wrap input.q-field__native) {
  padding: 0 !important;
  padding: 0 !important;
}
</style>

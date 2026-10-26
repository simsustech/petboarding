<template>
  <q-field :label="lang.pet.fields.food" stack-label class="pet-food-input">
    <template #control>
      <div class="pet-food-row">
        <div class="pet-food-cell" style="flex: 1; min-width: 0">
          <input
            :value="modelValue.timesADay"
            type="number"
            step="1"
            inputmode="numeric"
            :aria-label="lang.pet.food.fields.timesADay"
            :placeholder="lang.pet.food.fields.timesADay"
            class="pet-food-native pet-food-number"
            @input="onTimesPerDay"
          />
          <span class="pet-food-suffix">x</span>
        </div>
        <div class="pet-food-cell" style="flex: 2; min-width: 0">
          <input
            :value="modelValue.amount"
            type="number"
            step="0.1"
            inputmode="numeric"
            :aria-label="lang.pet.food.fields.amount"
            :placeholder="lang.pet.food.fields.amount"
            class="pet-food-native pet-food-number"
            @input="onAmount"
          />
        </div>
        <div class="pet-food-cell" style="flex: 2; min-width: 0">
          <select
            :value="modelValue.amountUnit"
            :aria-label="lang.pet.food.fields.amountUnit"
            class="pet-food-native"
            @change="onAmountUnit"
          >
            <option
              v-for="option in amountUnitOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>
        <div class="pet-food-cell" style="flex: 7; min-width: 0">
          <input
            :value="modelValue.kind"
            :aria-label="lang.pet.food.fields.kind"
            :placeholder="lang.pet.food.fields.kind"
            class="pet-food-native pet-food-kind"
            @input="onKind"
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

const onTimesPerDay = (event: Event) =>
  updateKey(
    'timesADay',
    Math.round(Number((event.target as HTMLInputElement).value))
  )

const onAmount = (event: Event) =>
  updateKey(
    'amount',
    Math.round(Number((event.target as HTMLInputElement).value) * 100) / 100
  )

const onAmountUnit = (event: Event) =>
  updateKey('amountUnit', (event.target as HTMLSelectElement).value)

const onKind = (event: Event) =>
  updateKey('kind', (event.target as HTMLInputElement).value)
</script>

<style scoped>
/* One component's compact inline number+select combo. The stacked-label band (22px)
   plus the row (34px) sums to 56px — the height of every sibling input — so the field
   needs no height override. The four controls are native inputs; nothing here restates
   a Quasar rule except the two geometry values that make the composite fit 56px. */
.pet-food-input :deep(.q-field__control-container) {
  padding-top: 22px;
}

.pet-food-input :deep(.q-field__native) {
  padding-top: 0;
  padding-bottom: 0;
}

.pet-food-row {
  display: flex;
  align-items: stretch;
  gap: 4px;
  height: 34px;
}

.pet-food-cell {
  min-width: 0;
  display: flex;
  align-items: center;
}

.pet-food-suffix {
  flex: none;
}

.pet-food-native {
  width: 100%;
  height: 100%;
  background: transparent;
  border: 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.24);
  color: inherit;
  font: inherit;
  padding: 2px 0;
}

.pet-food-number {
  text-align: right;
}

.pet-food-kind {
  text-align: left;
}

/* Hide the native number spinners; they overlap the suffix and the underline. */
.pet-food-number::-webkit-outer-spin-button,
.pet-food-number::-webkit-inner-spin-button {
  appearance: none;
  margin: 0;
}

.pet-food-number {
  -moz-appearance: textfield;
}
</style>

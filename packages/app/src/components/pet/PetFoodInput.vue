<template>
  <q-field :label="lang.pet.fields.food" stack-label>
    <template #control>
      <div class="row">
        <q-input
          :model-value="modelValue.timesADay"
          type="number"
          step="1"
          inputmode="numeric"
          class="col-1 q-mr-sm"
          :placeholder="lang.pet.food.fields.timesADay"
          :style="{
            'margin-top': '-2em',
            'margin-bottom': '-0.5em'
          }"
          input-class="text-right"
          suffix="x"
          @update:model-value="
            updateKey('timesADay', Math.round(Number($event)))
          "
        >
        </q-input>
        <q-input
          :model-value="modelValue.amount"
          type="number"
          step="0.1"
          inputmode="numeric"
          class="col-2 q-mr-sm"
          :placeholder="lang.pet.food.fields.amount"
          :style="{
            'margin-top': '-2em',
            'margin-bottom': '-0.5em'
          }"
          input-class="text-right"
          @update:model-value="
            updateKey('amount', Math.round(Number($event) * 100) / 100)
          "
        />
        <q-select
          :model-value="modelValue.amountUnit"
          :placeholder="lang.pet.food.fields.amountUnit"
          class="col-2"
          map-options
          emit-value
          :options="amountUnitOptions"
          :style="{
            'margin-top': '-2em',
            'margin-bottom': '-0.5em'
          }"
          @update:model-value="updateKey('amountUnit', $event)"
        />
        <q-input
          :model-value="modelValue.kind"
          class="col-6"
          :placeholder="lang.pet.food.fields.kind"
          :style="{
            'margin-top': '-2em',
            'margin-bottom': '-0.5em'
          }"
          @update:model-value="updateKey('kind', $event)"
        />
      </div>
    </template>
  </q-field>
</template>

<script setup lang="ts">
import { Pet } from '@petboarding/api/zod'
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
</style>

<template>
  <div
    class="text-h6 label"
    :style="{
      width: width + 'mm',
      height: height + 'mm'
    }"
  >
    <div class="grid grid-cols-24 gap-x-1 p-0.25em">
      <div
        class="col-span-24 grid grid-cols-subgrid text-12px mt--0.75em max-h-2em"
      >
        <span class="col-span-4">#{{ modelValue.id }}</span>
        <span class="col-span-20 text-right">
          <q-icon name="i-mdi-calendar-today" />
          {{ modelValue.birthDate }}</span
        >
      </div>
      <!-- The name owns a full-width row: a character limit cut names in code
           (audit: `name2 lastNam...`), CSS truncation keeps the box intact. -->
      <div class="col-span-24 text-h6 text-truncate" tabindex="0">
        {{ `${modelValue.name} ${modelValue.customer?.lastName}` }}
      </div>

      <div class="col-span-24 grid grid-cols-subgrid">
        <q-field
          :label="lang.pet.fields.gender"
          :filled="false"
          stack-label
          dense
          class="col-span-6"
        >
          <template #control>
            <div
              class="self-center text-subtitle2 text-truncate full-width no-outline q-ma-none"
              tabindex="0"
            >
              {{ lang.pet.genders[modelValue.gender] }}
            </div>
          </template>
        </q-field>

        <q-field
          :label="lang.pet.fields.breed"
          :filled="false"
          class="col-span-18"
          stack-label
          dense
        >
          <template #control>
            <div
              class="self-center text text-truncate text-h6 full-width no-outline q-ma-none"
              tabindex="0"
            >
              {{ modelValue.breed }}
            </div>
          </template>
        </q-field>

        <q-field
          :label="lang.pet.fields.color"
          stack-label
          :filled="false"
          class="col-span-8"
          dense
        >
          <template #control>
            <div
              class="self-center text-truncate full-width no-outline q-ma-none"
              tabindex="0"
            >
              {{ modelValue.color }}
            </div>
          </template>
        </q-field>

        <q-field
          :label="lang.pet.fields.medicines"
          stack-label
          :filled="false"
          class="col-span-16"
          dense
        >
          <template #control>
            <!-- The status is carried by text (colourblind-safe); a bare red ✕ for
                 "no medicines" read as an error (audit: employee-labels-pets.png). -->
            <div
              class="self-center full-width no-outline q-ma-none flex items-center gap-x-0.25em"
              tabindex="0"
            >
              <q-icon
                v-if="modelValue.medicines"
                size="sm"
                color="positive"
                name="i-mdi-check"
              />
              <span class="text-subtitle2 text-truncate full-width">
                {{
                  modelValue.medicines
                    ? lang.pet.messages.medicinesGiven
                    : lang.pet.messages.medicinesNone
                }}
              </span>
            </div>
          </template>
        </q-field>
      </div>
      <q-field
        :label="lang.pet.fields.food"
        stack-label
        :filled="false"
        class="col-span-24"
      >
        <template #control>
          <div
            class="self-center text-h6 full-width no-outline q-ma-none"
            tabindex="0"
          >
            {{
              `${modelValue.food?.timesADay ?? ''}x ${modelValue.food.amount || ''}
                    ${lang.pet.food.unit[modelValue.food?.amountUnit] ?? ''} ${modelValue.food?.kind}`
            }}
          </div>
        </template>
      </q-field>

      <q-field
        v-if="modelValue.particularities"
        :label="lang.pet.fields.particularities"
        stack-label
        :filled="false"
        class="col-span-24"
      >
        <template #control>
          <div
            class="self-center text-h6 full-width no-outline q-ma-none"
            style="line-height: 80%"
            tabindex="0"
          >
            {{ modelValue.particularities }}
          </div>
        </template>
      </q-field>
    </div>
    <div class="col-span-12 align-center">
      <div
        id="qrcode"
        style="width: 2.5cm; height: 2.5cm; margin: auto"
        v-html="qrSvg"
      ></div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'PetLabel'
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

import { useLang } from '../../lang/index.js'
import type { Pet } from '@petboarding/api/zod'
import { renderSVG } from 'uqr'

export interface Props {
  modelValue: Pet
  width?: number
  height?: number
}

const {
  modelValue,
  width = (import.meta.env.VITE_LABEL_WIDTH || 62) - 4,
  height = (import.meta.env.VITE_LABEL_HEIGHT || 100) - 4
} = defineProps<Props>()

const lang = useLang()

const variables = ref({
  // header: lang.value.some.nested.prop
})
const functions = ref({
  // submit
})
defineExpose({
  variables,
  functions
})

const qrSvg = ref(
  renderSVG(`${window.location.origin}/employee/pets/${modelValue.id}`)
)
</script>

<style scoped>
/* A display variant this app chose (transparent standard-field control), not a
   Quasar defect — making standard controls transparent by default would change every
   consumer of the preset. */
:deep(.q-field--standard) .q-field__control {
  background: transparent;
}
</style>

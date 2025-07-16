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
      <div class="col-span-15 grid grid-cols-subgrid">
        <div class="col-span-15">
          {{
            truncate(`${modelValue.name} ${modelValue.customer?.lastName}`, 12)
          }}
        </div>
        <q-field
          :label="lang.pet.fields.gender"
          :filled="false"
          stack-label
          dense
          class="col-span-8"
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
          :label="lang.pet.fields.sterilized"
          :filled="false"
          stack-label
          dense
          class="col-span-7"
        >
          <template #control>
            <div
              class="self-center full-width no-outline q-ma-none"
              tabindex="0"
            >
              <q-icon
                v-if="
                  modelValue.chemicalSterilizationDate &&
                  modelValue.chemicalSterilizationDate < dateSixMonthsAgo
                "
                size="xs"
                color="orange"
                name="i-mdi-warning"
              />
              <q-icon
                v-else
                size="sm"
                :color="modelValue.sterilized ? 'green' : 'red'"
                :name="modelValue.sterilized ? 'i-mdi-check' : 'i-mdi-close'"
              />
            </div>
          </template>
        </q-field>
      </div>
      <div class="col-span-0 grid grid-cols-subgrid">
        <div id="qrcode" style="width: 2cm; height: 2cm" v-html="qrSvg"></div>
      </div>
      <q-field
        :label="lang.pet.fields.breed"
        :filled="false"
        class="col-span-10"
        stack-label
        dense
      >
        <template #control>
          <div
            class="self-center text-truncate text-subtitle2 full-width no-outline q-ma-none"
            tabindex="0"
          >
            {{ modelValue.breed }}
          </div>
        </template>
      </q-field>
      <q-field
        :label="lang.pet.fields.food"
        stack-label
        dense
        :filled="false"
        class="col-span-14"
      >
        <template #control>
          <div
            class="self-center text-subtitle2 text-truncate full-width no-outline q-ma-none"
            tabindex="0"
          >
            {{
              `${modelValue.food?.timesADay ?? ''}x ${modelValue.food.amount || ''} 
                    ${lang.pet.food.unit[modelValue.food?.amountUnit] ?? ''} ${modelValue.food?.kind}`
            }}
          </div>
        </template>
      </q-field>

      <!-- <q-field
        v-if="modelValue.chemicalSterilizationDate"
        :label="lang.pet.fields.chemicalSterilizationDate"
        stack-label
        dense
        :filled="false"
        class="col-span-4"
      >
        <template #control>
          <div
            class="self-center text-truncate text-subtitle2 full-width no-outline q-ma-none"
            tabindex="0"
          >
            {{ modelValue.chemicalSterilizationDate }}
          </div>
        </template>
      </q-field> -->

      <q-field
        :label="lang.pet.fields.color"
        stack-label
        dense
        :filled="false"
        class="col-span-12"
      >
        <template #control>
          <div class="self-center full-width no-outline q-ma-none" tabindex="0">
            {{ modelValue.color }}
          </div>
        </template>
      </q-field>
      <q-field
        :label="lang.pet.fields.medicines"
        stack-label
        dense
        :filled="false"
        class="col-span-12"
      >
        <template #control>
          <div
            class="self-center text-subtitle2 text-truncate full-width no-outline q-ma-none"
            tabindex="0"
          >
            {{ modelValue.medicines }}
          </div>
        </template>
      </q-field>

      <q-field
        :label="lang.pet.fields.particularities"
        stack-label
        dense
        :filled="false"
        class="col-span-24"
      >
        <template #control>
          <div
            class="self-center text-subtitle1 full-width no-outline q-ma-none"
            style="line-height: 80%"
            tabindex="0"
          >
            {{ modelValue.particularities }}
          </div>
        </template>
      </q-field>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'PetLabel'
}
</script>

<script setup lang="ts">
import { ref, toRefs, computed } from 'vue'
import { date as dateUtil } from 'quasar'
import { useLang } from '../../lang/index.js'
import { Pet } from '@petboarding/api/zod'
import { renderSVG } from 'uqr'

export interface Props {
  modelValue: Pet
  width: number
  height: number
}
const props = defineProps<Props>()
const lang = useLang()

const { modelValue } = toRefs(props)
function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n - 1) + '...' : str
}

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
  renderSVG(`${window.location.origin}/employee/pets/${modelValue.value.id}`)
)

const dateSixMonthsAgo = computed(() =>
  dateUtil.formatDate(
    dateUtil.subtractFromDate(new Date(), {
      months: 6
    }),
    'YYYY-MM-DD'
  )
)
</script>

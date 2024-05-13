<template>
  <div
    class="text-h6 label"
    :style="{
      width: width - 4 + 'mm',
      height: height - 4 + 'mm'
    }"
  >
    <div class="row justify-between items-center" style="margin-bottom: -10px">
      <span style="font-size: 12px">#{{ modelValue.id }}</span>
      <span style="font-size: 12px">
        <q-icon name="calendar_today" />
        {{ modelValue.birthDate }}</span
      >
    </div>
    <div class="row items-center">
      <div class="col-8">
        <div class="row">
          <a class="text-subtitle1">
            {{
              truncate(
                `${modelValue.name} ${modelValue.customer?.lastName}`,
                12
              )
            }}
          </a>
        </div>
        <div class="row">
          <div class="col-8">
            <q-field :label="lang.pet.fields.gender" stack-label dense>
              <template #control>
                <div
                  class="self-center text-subtitle2 text-truncate full-width no-outline q-ma-none"
                  tabindex="0"
                >
                  {{ lang.pet.genders[modelValue.gender] }}
                </div>
              </template>
            </q-field>
          </div>
          <div class="col-4">
            <q-field :label="lang.pet.fields.sterilized" stack-label dense>
              <template #control>
                <div
                  class="self-center full-width no-outline q-ma-none"
                  tabindex="0"
                >
                  <q-icon
                    size="sm"
                    :color="modelValue.sterilized ? 'green' : 'red'"
                    :name="modelValue.sterilized ? 'check' : 'close'"
                  />
                </div>
              </template>
            </q-field>
          </div>
        </div>
      </div>
      <div class="col-4 text-center">
        <div v-html="qrSvg" id="qrcode" style="width: 2cm; height: 2cm"></div>
      </div>
    </div>
    <div class="row">
      <div class="col-6 q-pr-xs">
        <q-field :label="lang.pet.fields.breed" stack-label dense>
          <template #control>
            <div
              class="self-center text-truncate text-subtitle2 full-width no-outline q-ma-none"
              tabindex="0"
            >
              {{ modelValue.breed }}
            </div>
          </template>
        </q-field>
      </div>
      <div class="col-6">
        <div class="row">
          <div class="col-12">
            <q-field :label="lang.pet.fields.food" stack-label dense>
              <template #control>
                <div
                  class="self-center text-subtitle2 text-truncate full-width no-outline q-ma-none"
                  tabindex="0"
                >
                  {{ modelValue.food }}
                </div>
              </template>
            </q-field>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <q-field
              v-if="modelValue.chemicalSterilizationDate"
              :label="lang.pet.fields.chemicalSterilizationDate"
              stack-label
              dense
            >
              <template #control>
                <div
                  class="self-center text-truncate text-subtitle2 full-width no-outline q-ma-none"
                  tabindex="0"
                >
                  {{ modelValue.chemicalSterilizationDate }}
                </div>
              </template>
            </q-field>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-6">
        <q-field :label="lang.pet.fields.color" stack-label dense>
          <template #control>
            <div
              class="self-center full-width no-outline q-ma-none"
              tabindex="0"
            >
              {{ modelValue.color }}
            </div>
          </template>
        </q-field>
      </div>
      <div class="col-6">
        <q-field :label="lang.pet.fields.medicines" stack-label dense>
          <template #control>
            <div
              class="self-center text-subtitle2 text-truncate full-width no-outline q-ma-none"
              tabindex="0"
            >
              {{ modelValue.medicines }}
            </div>
          </template>
        </q-field>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <q-field :label="lang.pet.fields.particularities" stack-label dense>
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
  </div>
</template>

<script lang="ts">
export default {
  name: 'PetLabel'
}
</script>

<script setup lang="ts">
import { ref, toRefs } from 'vue'
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
</script>

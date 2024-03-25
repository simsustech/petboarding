<template>
  <div
    class="text-h6 label"
    :style="{
      width: width - 4 + 'mm',
      height: height - 4 + 'mm'
    }"
  >
    <div class="row text-subtitle2 q-mt-md" style="line-height: 1em">
      {{ formatDate(modelValue.startDate, modelValue.startTime?.name) }}
      <br />
      {{ lang.booking.until }}
      <br />
      {{ formatDate(modelValue.endDate, modelValue.endTime?.name) }}
    </div>

    <div class="row">
      <div class="col-12 q-pr-xs">
        <q-field :label="lang.pet.title" stack-label dense>
          <template #control>
            <div
              class="self-center text-truncate text-subtitle2 full-width no-outline q-ma-none"
              tabindex="0"
            >
              {{ getPetNames(modelValue.pets) }}
            </div>
          </template>
        </q-field>
      </div>
    </div>
    <div class="row">
      <div class="col-12 q-pr-xs">
        <q-field :label="lang.customer.fields.lastName" stack-label dense>
          <template #control>
            <div
              class="self-center text-truncate text-subtitle2 full-width no-outline q-ma-none"
              tabindex="0"
            >
              {{ modelValue.customer?.lastName }}
            </div>
          </template>
        </q-field>
      </div>
    </div>
    <div v-if="modelValue.services.length" class="row">
      <div class="col-12 q-pr-xs">
        <q-field :label="lang.service.title" stack-label dense>
          <template #control>
            <div
              class="self-center text-truncate text-subtitle2 full-width no-outline q-ma-none"
              tabindex="0"
            >
              {{ getServiceNames(modelValue.services) }}
            </div>
          </template>
        </q-field>
      </div>
    </div>
    <div class="row">
      <a v-if="modelValue.costs?.total">
        {{ `${configuration.CURRENCY}${modelValue.costs.total.toFixed(2)}` }}
      </a>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'BookingLabel'
}
</script>

<script setup lang="ts">
import { ref } from 'vue'
import { useLang } from '../../lang/index.js'
import { Booking, Pet, Service } from '@petboarding/api/zod'
import { useQuasar } from 'quasar'
import { useConfiguration } from '../../configuration.js'

export interface Props {
  modelValue: Booking
  width: number
  height: number
}
defineProps<Props>()
const lang = useLang()
const $q = useQuasar()
const configuration = useConfiguration()

const dateFormatter = (date: Date, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeZone: 'UTC'
  }).format(date)

const formatDate = (date: string, time?: string) => {
  return `${dateFormatter(new Date(date), $q.lang.isoName)} ${time}`
}

const getPetNames = (pets?: Pet[]) => {
  if (pets) return pets.map((pet) => pet.name).join(', ')
  return ''
}

const getServiceNames = (services?: { service: Service }[]) => {
  if (services)
    return services.map((service) => service.service?.name).join(', ')
  return ''
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
</script>

<template>
  <div
    class="text-h6 label"
    :style="{
      width: width + 'mm',
      height: height + 'mm'
    }"
  >
    <div class="grid grid-cols-24 gap-x-1 p-0.25em">
      <div class="col-span-24 line-height-1em">
        {{ formatDate(modelValue.startDate, modelValue.startTime?.name) }}
        <br />
        {{ lang.booking.until }}
        <br />
        {{ formatDate(modelValue.endDate, modelValue.endTime?.name) }}
      </div>

      <q-field
        :label="lang.pet.title"
        stack-label
        dense
        :filled="false"
        class="col-span-24"
      >
        <template #control>
          <div
            class="self-center text-truncate text-subtitle2 full-width no-outline q-ma-none"
            tabindex="0"
          >
            {{ getPetNames(modelValue.pets) }}
          </div>
        </template>
      </q-field>

      <q-field
        :label="lang.customer.fields.lastName"
        stack-label
        dense
        :filled="false"
        class="col-span-24"
      >
        <template #control>
          <div
            class="self-center text-truncate text-subtitle2 full-width no-outline q-ma-none"
            tabindex="0"
          >
            {{ modelValue.customer?.lastName }}
          </div>
        </template>
      </q-field>

      <q-field
        :label="lang.service.title"
        stack-label
        dense
        :filled="false"
        class="col-span-24"
      >
        <template #control>
          <div
            class="self-center text-truncate text-subtitle2 full-width no-outline q-ma-none"
            tabindex="0"
          >
            {{ getServiceNames(modelValue.services) }}
          </div>
        </template>
      </q-field>

      <div v-if="modelValue.costs?.totalIncludingTax" class="col-span-24">
        {{
          `${currencySymbols[configuration.CURRENCY]}${(modelValue.costs.totalIncludingTax / 100).toFixed(2)}`
        }}
      </div>
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
import { Pet } from '@petboarding/api/zod'
import type { ParsedBooking, BookingService } from '@petboarding/api'
import { useQuasar } from 'quasar'
import { useConfiguration } from '../../configuration.js'

export interface Props {
  modelValue: ParsedBooking
  width: number
  height: number
}

defineProps<Props>()
const lang = useLang()
const $q = useQuasar()
const configuration = useConfiguration()

const currencySymbols = ref({
  EUR: '€',
  USD: '$'
})

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

const getServiceNames = (services?: BookingService[]) => {
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

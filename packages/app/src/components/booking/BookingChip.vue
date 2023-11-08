<template>
  <div class="q-mb-md">
    <q-chip
      v-for="pet in modelValue.pets"
      :key="pet.id"
      class="row q-mt-none q-mb-xs"
      :icon="icons[type]"
      :color="colors[type]"
    >
      <div>
        {{ pet.name }}
      </div>
    </q-chip>
  </div>
</template>

<script lang="ts">
export default {
  name: 'BookingChip'
}
</script>

<script setup lang="ts">
import { Booking } from '@petboarding/api/zod'
import { QChip } from 'quasar'
import { ref } from 'vue'

export interface Props {
  modelValue: Booking
  type: 'arrival' | 'departure' | 'stay'
}
defineProps<Props>()

const icons = ref({
  arrival: 'add',
  departure: 'cancel',
  stay: undefined
})

const colors = ref({
  arrival: 'green',
  departure: 'red',
  stay: undefined
})
</script>

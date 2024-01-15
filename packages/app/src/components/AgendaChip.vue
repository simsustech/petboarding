<template>
  <div class="q-mb-md">
    <q-chip
      v-for="(pet, index) in modelValue.pets"
      v-bind="attrs"
      :key="pet.id"
      class="row q-mt-none q-mb-xs q-pr-sm"
      :class="{
        'text-strike':
          (modelValue.status?.status || modelValue.status) === 'cancelled'
      }"
      dense
      :icon="icons[type]"
      :color="
        (modelValue.status?.status || modelValue.status) === 'standby'
          ? 'yellow'
          : colors[type]
      "
      :selected="selectedPets?.includes(pet.id)"
      @click="emit('click', { data: pet.id })"
    >
      <slot name="default" />
      <q-badge v-if="modelValue.isDoubleBooked" color="red" rounded floating />

      <q-badge
        v-else-if="
          modelValue.services?.some(
            (service) => service.service.type === 'appointment'
          ) && index === 0
        "
        :color="BOOKING_SERVICE_COLORS.appointment"
        text-color="black"
        rounded
        floating
      >
        !
      </q-badge>

      <q-menu context-menu>
        <q-list>
          <q-item
            v-if="onOpenBooking && modelValue.id"
            clickable
            @click="emit('openBooking', modelValue.id)"
          >
            <q-item-section>
              <q-item-label>
                {{ lang.booking.messages.openBooking }}
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item
            v-if="onOpenPets && petIds"
            clickable
            @click="emit('openPets', petIds)"
          >
            <q-item-section>
              <q-item-label>
                {{ lang.booking.messages.openPets }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-menu>
      <div>
        {{ pet.name }}
      </div>
    </q-chip>
  </div>
</template>

<script lang="ts">
export default {
  name: 'AgendaChip',
  inheritAttrs: false
}
</script>

<script setup lang="ts">
import { Booking, DaycareDate } from '@petboarding/api/zod'
import { QChip } from 'quasar'
import { computed, ref, toRefs, useAttrs } from 'vue'
import { useLang } from '../lang/index.js'
import { BOOKING_SERVICE_COLORS } from '../configuration.js'
export interface Props {
  modelValue: Booking | DaycareDate
  type: 'arrival' | 'departure' | 'stay' | 'daycare'
  selectedPets?: number[]
  onOpenPets?: unknown
  onOpenBooking?: unknown
}

const props = defineProps<Props>()
const attrs = useAttrs()
const emit = defineEmits<{
  (
    e: 'click',
    {
      data,
      done
    }: {
      data: number
      done: () => void
    }
  ): void
  (e: 'openPets', ids: number[]): void
  (e: 'openBooking', id: number): void
}>()
const lang = useLang()

const { modelValue } = toRefs(props)
const petIds = computed(() => modelValue.value.pets?.map((pet) => pet.id))

const icons = ref({
  arrival: 'add',
  departure: 'cancel',
  stay: undefined,
  daycare: undefined
})

const colors = ref({
  arrival: 'green',
  departure: 'red',
  stay: undefined,
  daycare: undefined
})
</script>

<template>
  <div class="q-mb-md">
    <pet-chip
      v-for="(pet, index) in modelValue.pets"
      :key="pet.id"
      :model-value="pet"
      :show-last-name="showLastName"
      :selected="selectedPets?.includes(pet.id!)"
      class="q-mt-none q-mb-xs q-pr-sm"
      :class="{
        'text-strike':
          modelValue.status?.status === 'canceled' ||
          modelValue.status === 'canceled'
      }"
      dense
      show-badge
      :icon="icons[type]"
      :color="colors[type]"
      @click="emit('click', { data: pet.id!, done: () => {} })"
      @open-pet="emit('openPets', petIds)"
    >
      <template
        v-if="
          modelValue.isDoubleBooked ||
          (modelValue.services?.some(
            (service) => service.service.type === 'appointment'
          ) &&
            index === 0)
        "
        #bottom-badge
      >
        <q-badge
          v-if="
            modelValue.services?.some(
              (service) => service.service.type === 'appointment'
            ) && index === 0
          "
          :color="AGENDA_CHIP_BADGE_COLORS.appointment"
          rounded
        >
          <q-icon
            class="q-ma-none q-pa-none"
            :name="AGENDA_CHIP_BADGE_ICONS.appointment"
            size="0.8em"
          />
        </q-badge>
        <q-badge
          v-if="modelValue.isDoubleBooked"
          :color="AGENDA_CHIP_BADGE_ICONS.isDoubleBooked"
          rounded
        >
          <q-icon
            class="q-ma-none q-pa-none"
            :name="AGENDA_CHIP_BADGE_ICONS.isDoubleBooked"
            size="0.8em"
          />
        </q-badge>
      </template>
      <template #menu-items>
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
      </template>
    </pet-chip>
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
import { computed, ref, toRefs } from 'vue'
import { useLang } from '../lang/index.js'
import {
  AGENDA_CHIP_BADGE_COLORS,
  AGENDA_CHIP_BADGE_ICONS
} from '../configuration.js'
import PetChip from './pet/PetChip.vue'

export interface Props {
  modelValue: Booking | DaycareDate
  type: 'arrival' | 'departure' | 'stay' | 'daycare'
  selectedPets?: number[]
  onOpenPets?: unknown
  onOpenBooking?: unknown
  showLastName?: boolean
}

const props = defineProps<Props>()
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
const petIds = computed(
  () => modelValue.value.pets?.map((pet) => pet.id!) || []
)

const icons = ref({
  arrival: 'add',
  departure: 'cancel',
  stay: undefined,
  daycare: undefined
})

const colors = ref({
  arrival: 'green',
  departure: 'red',
  standby: 'yellow',
  stay: undefined,
  daycare: undefined
})
</script>

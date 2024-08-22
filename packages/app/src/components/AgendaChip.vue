<template>
  <div class="q-mb-md">
    <q-chip
      v-for="(pet, index) in modelValue.pets"
      v-bind="attrs"
      :key="pet.id"
      class="q-mt-none q-mb-xs q-pr-sm"
      :class="{
        'text-strike':
          (modelValue.status?.status || modelValue.status) === 'canceled'
      }"
      dense
      :icon="icons[type]"
      :color="
        (modelValue.status?.status || modelValue.status) === 'standby'
          ? 'yellow'
          : colors[type]
      "
      :selected="selectedPets?.includes(pet.id)"
      style="height: 100%"
      @click="emit('click', { data: pet.id })"
    >
      <slot name="default" />
      <q-badge style="top: -8px" floating color="transparent">
        <q-badge
          v-if="
            modelValue.services?.some(
              (service) => service.service.type === 'appointment'
            ) && index === 0
          "
          :color="BOOKING_SERVICE_COLORS.appointment"
          text-color="black"
          rounded
        >
        </q-badge>
        <q-badge v-if="modelValue.isDoubleBooked" color="orange" rounded />
        <q-badge v-if="!pet.hasMandatoryVaccinations" color="red" rounded />
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
        <div>
          {{ pet.name }}
        </div>
        <i v-if="showLastName">{{ getLastName(pet) }}</i>
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
import { Booking, DaycareDate, Pet } from '@petboarding/api/zod'
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
  showLastName?: boolean
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

const getLastName = (pet: Pet) => {
  if (pet.customer?.lastName) {
    const lastName = pet.customer.lastName.substring(0, 8)
    if (pet.customer.lastName.length > 8) return lastName + '...'
    return lastName
  }
}

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

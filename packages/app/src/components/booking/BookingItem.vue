<template>
  <q-item :class="getClasses()">
    <booking-item-content
      :model-value="modelValue"
      :show-icon="showIcon"
      :show-approval-buttons="showApprovalButtons"
      :show-edit-button="showEditButton"
      :status="status"
      @update="($event) => emit('update', $event)"
      @cancel="($event) => emit('cancel', $event)"
      @approve="($event) => emit('approve', $event)"
      @reject="($event) => emit('reject', $event)"
      @standby="($event) => emit('standby', $event)"
      @reply="($event) => emit('reply', $event)"
      @settle-cancellation="($event) => emit('settleCancellation', $event)"
    />

    <q-menu touch-position context-menu>
      <q-list dense>
        <q-item
          v-if="modelValue.customerId && onOpenCustomer"
          clickable
          @click="emit('openCustomer', { id: modelValue.customerId })"
        >
          <q-item-section>
            <q-item-label>{{
              lang.booking.messages.openCustomer
            }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          v-if="modelValue.id && onOpenBooking"
          clickable
          @click="
            emit('openBooking', {
              id: modelValue.id
            })
          "
        >
          <q-item-section>
            <q-item-label>{{ lang.booking.messages.openBooking }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          v-if="(modelValue.petIds || modelValue.pets) && onOpenPets"
          clickable
          :to="`/employee/pets/${(
            modelValue.petIds || modelValue.pets?.map((pet) => pet.id)
          ).join('/')}`"
        >
          <q-item-section>
            <q-item-label>{{ lang.booking.messages.openPets }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-item>
</template>

<script lang="ts">
export default {
  name: 'BookingItem'
}
</script>

<script setup lang="ts">
import { watch, toRefs } from 'vue'
import { QItem, QItemLabel, QItemSection, useQuasar } from 'quasar'
import { useLang, loadLang } from '../../lang/index.js'
import { Booking } from '@petboarding/api/zod'
import BookingItemContent from './BookingItemContent.vue'

export interface Props {
  modelValue: Booking
  showIcon?: boolean
  showApprovalButtons?: boolean
  showEditButton?: boolean
  status?: 'arriving' | 'departing' | 'staying'
  onOpenCustomer?: unknown
  onOpenBooking?: unknown
  onOpenPets?: unknown
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (
    e: 'update',
    {
      data,
      done
    }: {
      data: Booking
      done: (success?: boolean) => void
    }
  ): void
  (
    e: 'cancel',
    {
      data,
      done
    }: {
      data: {
        booking: Booking
        reason: string
      }
      done: (success?: boolean) => void
    }
  ): void
  (
    e: 'approve',
    {
      data,
      done
    }: {
      data: Booking
      done: (success?: boolean) => void
    }
  ): void
  (
    e: 'reject',
    {
      data,
      done
    }: {
      data: Booking
      done: (success?: boolean) => void
    }
  ): void
  (
    e: 'standby',
    {
      data,
      done
    }: {
      data: Booking
      done: (success?: boolean) => void
    }
  ): void
  (
    e: 'reply',
    {
      data,
      done
    }: {
      data: Booking
      done: (success?: boolean) => void
    }
  ): void
  (
    e: 'settleCancellation',
    {
      data,
      done
    }: {
      data: Booking
      done: (success?: boolean) => void
    }
  ): void
  (
    e: 'openCustomer',
    {
      id
    }: {
      id: number
    }
  ): void
  (
    e: 'openBooking',
    {
      id
    }: {
      id: number
    }
  ): void
  (
    e: 'openPets',
    {
      ids
    }: {
      ids: number[]
    }
  ): void
}>()

const lang = useLang()

const $q = useQuasar()
if (lang.value.isoName !== $q.lang.isoName) loadLang($q.lang.isoName)
watch($q.lang, () => {
  loadLang($q.lang.isoName)
})

const { status } = toRefs(props)
const getClasses = () => ({
  'bg-green-2': status?.value === 'arriving' || status?.value === 'staying',
  'bg-red-2': status?.value === 'departing'
})
</script>

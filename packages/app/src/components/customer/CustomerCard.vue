<template>
  <q-card>
    <q-card-section>
      <div class="row justify-between">
        <q-rating v-if="modelValue.rating" :model-value="modelValue.rating" />
        <q-btn
          v-if="showEditButton"
          v-close-popup
          class="float-right"
          rounded
          outline
          icon="i-mdi-edit"
          data-testid="edit-button"
          @click="update(modelValue)"
        >
          <q-tooltip>
            {{ lang.edit }}
          </q-tooltip>
        </q-btn>
      </div>
    </q-card-section>

    <q-list>
      <gender-item :model-value="modelValue.gender" />
      <form-item field="firstName" :model-value="modelValue.firstName" />
      <form-item field="lastName" :model-value="modelValue.lastName" />
      <form-item field="address" :model-value="modelValue.address" />
      <form-item field="postalCode" :model-value="modelValue.postalCode" />
      <form-item field="city" :model-value="modelValue.city" />

      <q-item>
        <q-item-section>
          <q-item-label overline>
            {{ lang.customer.fields.telephoneNumber }}
          </q-item-label>
          <q-item-label>
            {{ modelValue.telephoneNumber }}
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-item>
        <q-item-section>
          <q-item-label overline>
            {{ lang.customer.fields.veterinarian }}
          </q-item-label>
          <q-item-label>
            {{ modelValue.veterinarian }}
          </q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label overline>
            {{ lang.account.fields.email }}
          </q-item-label>
          <q-item-label>
            {{ modelValue.account?.email }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-card>
</template>

<script lang="ts">
export default {
  name: 'CustomerCard'
}
</script>

<script setup lang="ts">
import type { Customer } from '@petboarding/api/zod'
import { useLang } from '../../lang/index.js'
import { GenderItem, FormItem } from '@simsustech/quasar-components/form'
import { toRefs } from 'vue'

export interface Props {
  modelValue: Customer
  showEditButton?: boolean
}
const props = defineProps<Props>()

const emit = defineEmits<{
  (
    e: 'update',
    {
      data,
      done
    }: {
      data: Customer
      done: (success?: boolean) => void
    }
  ): void
  (
    e: 'openBookings',
    {
      ids,
      done
    }: {
      ids: number[]
      done?: (success?: boolean) => void
    }
  ): void
  (
    e: 'openPets',
    {
      ids,
      done
    }: {
      ids: number[]
      done?: (success?: boolean) => void
    }
  ): void
}>()

const { modelValue } = toRefs(props)
const update = (customer: Customer) => {
  function done() {
    //
  }
  emit('update', { data: customer, done })
}
// const openBookings = () =>
//   emit('openBookings', {
//     ids: props.modelValue.bookings?.map((booking) => booking.id) || []
//   })

// const openPets = () =>
//   emit('openPets', {
//     ids: modelValue.value.pets?.map((pet) => pet.id) || []
//   })

const lang = useLang()
</script>

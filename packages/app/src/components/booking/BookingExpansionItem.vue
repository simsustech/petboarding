<template>
  <q-expansion-item>
    <template #header>
      <booking-item-content
        :model-value="modelValue"
        v-bind="attrs"
        :show-history="showHistory"
      />
      <q-menu v-if="onOpenCustomer" context-menu>
        <q-list>
          <q-item clickable @click="openCustomer">
            <q-item-section>
              <q-item-label>
                {{ `${lang.open} ${lang.customer.title.toLowerCase()}` }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </template>

    <q-list>
      <div v-if="modelValue.pets">
        <pet-item
          v-for="pet in modelValue.pets"
          :key="pet.id"
          :model-value="pet"
          show-warnings
        >
          <q-menu context-menu>
            <q-list>
              <q-item clickable :to="`/employee/pets/${pet.id}`">
                <q-item-section>
                  <q-item-label>{{ lang.open }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </pet-item>
      </div>
      <q-expansion-item
        v-if="modelValue.statuses?.length && showHistory"
        :header-inset-level="1"
        :content-inset-level="2"
      >
        <template #header>
          <q-item-section>
            <q-item-label> {{ lang.booking.history }} </q-item-label>
          </q-item-section>
        </template>
        <booking-status-item
          v-for="status in modelValue.statuses"
          :key="status.id"
          :model-value="status"
          :pets="modelValue.pets"
        />
      </q-expansion-item>
      <q-expansion-item
        v-if="modelValue.costs"
        :header-inset-level="1"
        :content-inset-level="2"
      >
        <template #header>
          <q-item-section>
            <q-item-label> {{ lang.booking.costs.title }} </q-item-label>
          </q-item-section>
          <q-item-section side>
            <!-- <q-item-label>
              {{
                modelValue.costs.total
                  ? configuration.CURRENCY + modelValue.costs.total.toFixed(2)
                  : lang.tbd
              }}
            </q-item-label> -->
          </q-item-section>
        </template>
        <!-- <booking-costs
          v-if="modelValue.costs"
          :model-value="modelValue.costs"
        /> -->
        <order-card
          v-if="modelValue.order"
          :model-value="modelValue.order"
          disable
        />
      </q-expansion-item>
      <q-expansion-item
        v-if="modelValue.services?.length"
        :header-inset-level="1"
        :content-inset-level="2"
      >
        <template #header>
          <q-item-section>
            <q-item-label>
              {{ lang.booking.fields.services }}
            </q-item-label>
          </q-item-section>
        </template>
        <booking-services-list
          :model-value="modelValue.services"
          :show-edit-button="showBookingServicesEditButton"
          @edit="editBookingService"
        />
      </q-expansion-item>
    </q-list>
  </q-expansion-item>
</template>

<script lang="ts">
export default {
  name: 'BookingExpansionItem'
}
</script>

<script setup lang="ts">
import { ref, toRefs, useAttrs } from 'vue'
import { QBtn, QExpansionItem } from 'quasar'
import { useLang } from '../../lang/index.js'
import { Booking, BookingService } from '@petboarding/api/zod'
import BookingItemContent from './BookingItemContent.vue'
import PetItem from '../pet/PetItem.vue'
import BookingStatusItem from './BookingStatusItem.vue'
// import { useConfiguration } from '../../configuration.js'
import BookingServicesList from './BookingServicesList.vue'
import { OrderCard } from '@modular-api/quasar-components/cart'
export interface Props {
  modelValue: Booking
  showBookingServicesEditButton?: boolean
  showHistory?: boolean
  onOpenCustomer?: unknown
}
const props = defineProps<Props>()
const attrs = useAttrs()
const emit = defineEmits<{
  (
    e: 'editPet',
    {
      id,
      done
    }: {
      id: number
      done?: () => void
    }
  ): void
  (
    e: 'editBookingService',
    {
      data,
      done
    }: {
      data: BookingService
      done?: (success?: boolean) => void
    }
  ): void
  (e: 'openCustomer', { id }: { id: number }): void
}>()

const { modelValue } = toRefs(props)
const lang = useLang()
// const configuration = useConfiguration()

const editBookingService: InstanceType<
  typeof BookingServicesList
>['$props']['onEdit'] = ({ data, done }) =>
  emit('editBookingService', { data, done })

const openCustomer: InstanceType<typeof QBtn>['$props']['onClick'] = (evt) => {
  if (modelValue.value.customerId) {
    emit('openCustomer', { id: modelValue.value.customerId })
  }
}

const variables = ref({})
const functions = ref({})
defineExpose({
  variables,
  functions
})
</script>

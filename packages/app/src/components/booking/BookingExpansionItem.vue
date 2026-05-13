<template>
  <q-expansion-item
    :header-class="{
      'bg-grey-3': modelValue.endDate < currentDate
    }"
  >
    <template #header>
      <booking-item-content
        :model-value="modelValue"
        v-bind="attrs"
        :show-history="showHistory"
      />
      <q-menu v-if="onOpenCustomer" context-menu>
        <q-list>
          <q-item
            clickable
            @click="$emit('openCustomer', { id: modelValue.customerId })"
          >
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
      <q-item :inset-level="1">
        <q-item-section>
          <q-item-label>
            <a
              >{{
                formatDates(
                  modelValue.startDate,
                  modelValue.startTime!.name,
                  modelValue.endDate,
                  modelValue.endTime!.name
                )
              }}
            </a>
            -
            <a class="text-italic">
              {{ `${modelValue.days} ${lang.booking.days}` }}
            </a>
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn
            icon="i-mdi-edit"
            flat
            @click.stop
            data-testid="booking-dates-edit-button"
          >
            <q-menu>
              <q-list>
                <q-item v-close-popup clickable @click="update(modelValue)">
                  <q-item-section>
                    <q-item-label>
                      {{ lang.edit }}
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item
                  v-close-popup
                  class="text-red"
                  clickable
                  @click="cancel(modelValue)"
                >
                  <q-item-section>
                    <q-item-label>
                      {{ lang.cancel }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </q-item-section>
      </q-item>
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
            <q-item-label>
              <price
                v-if="modelValue.costs?.totalIncludingTax"
                :model-value="modelValue.costs.totalIncludingTax"
                :currency="configuration.CURRENCY"
              />
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              v-if="
                configuration.INTEGRATIONS?.slimfact &&
                onUpdateBookingInvoice &&
                twoWeeksInThePast < modelValue.endDate
              "
              outline
              :rounded="false"
              @click.stop="updateBookingInvoice(modelValue)"
            >
              <div class="column items-center">
                <q-avatar class="col-12">
                  <q-icon name="i-mdi-invoice-text" size="md" />
                </q-avatar>
                <q-icon
                  style="position: absolute; right: 16px; bottom: 6px"
                  name="i-mdi-sync"
                  size="xs"
                />
              </div>
            </q-btn>
          </q-item-section>
        </template>
        <q-list bordered>
          <booking-costs
            v-if="modelValue.costs"
            :model-value="modelValue.costs"
          />
        </q-list>
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
          @update="updateBookingService"
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
import { ref, useAttrs } from 'vue'
import { QExpansionItem, date as dateUtil, useQuasar } from 'quasar'
import { useLang } from '../../lang/index.js'
import type { Booking, BookingService } from '@petboarding/api/zod'
import BookingItemContent, {
  formatBookingDates
} from './BookingItemContent.vue'
import PetItem from '../pet/PetItem.vue'
import BookingStatusItem from './BookingStatusItem.vue'
import { useConfiguration } from '../../configuration.js'
import BookingServicesList from './BookingServicesList.vue'

export interface Props {
  modelValue: Booking
  showBookingServicesEditButton?: boolean
  showHistory?: boolean
  onOpenCustomer?: unknown
  onUpdateBookingInvoice?: unknown
}
defineProps<Props>()
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
    e: 'updateBookingService',
    {
      data,
      done
    }: {
      data: BookingService
      done?: (success?: boolean) => void
    }
  ): void
  (
    e: 'updateBookingInvoice',
    {
      data,
      done
    }: {
      data: Booking
      done: (success?: boolean) => void
    }
  ): void
  (e: 'openCustomer', { id }: { id: number }): void
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
}>()

const lang = useLang()
const configuration = useConfiguration()
const $q = useQuasar()

const updateBookingService: InstanceType<
  typeof BookingServicesList
>['$props']['onUpdate'] = ({ data, done }) =>
  emit('updateBookingService', { data, done })

const updateBookingInvoice = (booking: Booking) => {
  const done = () => {}
  emit('updateBookingInvoice', { data: booking, done })
}
const currentDate = ref(new Date().toISOString().slice(0, 10))
const twoWeeksInThePast = ref(
  dateUtil.formatDate(
    dateUtil.subtractFromDate(new Date(), { days: 14 }),
    'YYYY-MM-DD'
  )
)

const formatDates = (
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string
) => {
  return formatBookingDates({
    startDate,
    startTime,
    endDate,
    endTime,
    lang: lang.value,
    locale: $q.lang.isoName
  })
}

const update = (booking: Booking) => {
  const done = () => {
    //
  }
  emit('update', { data: booking, done })
}

const cancel = (booking: Booking) => {
  const done = () => {
    //
  }
  $q.dialog({
    message: lang.value.booking.messages.cancelationReason,
    cancel: true,
    prompt: {
      model: '',
      isValid: (val) => !!val,
      type: 'text'
    }
  }).onOk((input) => {
    emit('cancel', { data: { booking, reason: input }, done })
  })
}

const variables = ref({})
const functions = ref({})
defineExpose({
  variables,
  functions
})
</script>

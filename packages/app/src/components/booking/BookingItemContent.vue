<template>
  <q-item-section v-if="showIcon" avatar>
    <q-icon
      v-if="modelValue.status"
      :name="BOOKING_ICON[modelValue.status!.status]"
      :color="BOOKING_ICON_COLOR[modelValue.status!.status]"
      size="1.8rem"
    >
      <q-tooltip>
        {{ lang.booking.helpers.status[modelValue.status!.status] }}
      </q-tooltip>
    </q-icon>
  </q-item-section>

  <q-item-section>
    <q-item-label overline>
      {{ modelValue.pets?.map((pet) => pet.name).join(', ') }}
      <a v-if="modelValue.customer">
        {{ modelValue.customer?.lastName ? modelValue.customer.lastName : '' }}
      </a>
    </q-item-label>
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
    <q-item-label
      v-if="
        showHistory &&
        modelValue.statuses &&
        modelValue.status &&
        modelValue.statuses?.length > 1 &&
        modelValue.status.status === BOOKING_STATUS.PENDING
      "
      caption
    >
      <q-icon name="i-mdi-warning" color="red"> </q-icon>
      {{ lang.booking.messages.bookingModified }}
    </q-item-label>
    <q-item-label v-if="modelValue.isDoubleBooked" caption>
      <q-icon name="i-mdi-warning" color="red"> </q-icon>
      {{
        `${lang.booking.messages.isDoubleBooked} ${lang.booking.messages.cancelDoubleBookings}`
      }}
    </q-item-label>
    <q-item-label v-if="modelValue.overlapsWithUnavailablePeriod" caption>
      <q-icon name="i-mdi-warning" color="red"> </q-icon>
      {{ `${lang.booking.messages.overlapsWithUnavailablePeriod}` }}
    </q-item-label>
    <q-item-label
      v-if="modelValue.comments"
      class="text-bold"
      caption
      lines="2"
    >
      {{ modelValue.comments }}
    </q-item-label>
    <q-item-label v-if="modelValue.services?.length" class="text-bold" caption>
      {{
        modelValue.services.map((service) => service.service?.name).join(', ')
      }}
    </q-item-label>
    <q-item-label
      v-if="modelValue.costs?.totalIncludingTax"
      class="text-bold"
      caption
    >
      <price
        :model-value="modelValue.costs?.totalIncludingTax"
        :currency="configuration.CURRENCY"
      />
    </q-item-label>
  </q-item-section>
  <q-item-section side>
    <div class="row items-center">
      <div
        v-if="
          configuration.INTEGRATIONS?.slimfact.hostname &&
          modelValue.invoiceUuid &&
          modelValue.invoice
        "
        class="col-sm-auto"
      >
        <invoice-button :model-value="modelValue.invoice" />
        <!-- <q-btn
          :dense="$q.screen.lt.sm"
          class="q-pt-none q-pb-none"
          data-html2canvas-ignore="true"
          :href="`https://${configuration.INTEGRATIONS?.slimfact.hostname}/invoice/${modelValue.invoiceUuid}`"
          target="_blank"
          :text-color="getInvoiceTextColor(modelValue)"
        >
          <div class="column">
            <q-icon class="col-12" name="receipt" />
            <div class="col-12 text-caption">
              <price
                :model-value="modelValue.invoice.totalIncludingTax || 0"
                :currency="modelValue.invoice.currency"
              />
            </div>
          </div>
          <q-tooltip>
            {{ lang.booking.messages.openInvoice }}
          </q-tooltip>
        </q-btn> -->
      </div>

      <div>
        <q-btn
          v-if="
            showApprovalButtons || showEditButton || showHandleCancelationButton
          "
          class="col-auto"
          icon="i-mdi-more-vert"
          flat
        >
          <q-menu>
            <q-list>
              <q-item
                v-if="
                  showApprovalButtons &&
                  modelValue.status?.status !== BOOKING_STATUS.APPROVED
                "
                v-close-popup
                clickable
                class="bg-green"
                @click="approve(modelValue)"
              >
                <q-item-section>
                  <q-item-label>
                    {{ lang.booking.replies.approve }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item
                v-if="
                  showApprovalButtons &&
                  modelValue.status?.status !== BOOKING_STATUS.REJECTED
                "
                v-close-popup
                clickable
                class="bg-red"
                @click="reject(modelValue)"
              >
                <q-item-section>
                  <q-item-label>
                    {{ lang.booking.replies.reject }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item
                v-if="
                  showApprovalButtons &&
                  modelValue.status?.status !== BOOKING_STATUS.STANDBY
                "
                v-close-popup
                clickable
                class="bg-yellow"
                @click="standby(modelValue)"
              >
                <q-item-section>
                  <q-item-label>
                    {{ lang.booking.replies.standby }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item
                v-if="showApprovalButtons"
                v-close-popup
                clickable
                @click="reply(modelValue)"
              >
                <q-item-section>
                  <q-item-label>
                    {{ lang.booking.replies.reply }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item
                v-if="showHandleCancelationButton"
                v-close-popup
                clickable
                @click="settleCancelation(modelValue)"
              >
                <q-item-section>
                  <q-item-label>
                    {{ lang.booking.replies.settleCancelation }}
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item
                v-if="showEditButton"
                v-close-popup
                clickable
                @click="update(modelValue)"
              >
                <q-item-section>
                  <q-item-label>
                    {{ lang.edit }}
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item
                v-if="showEditButton"
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
      </div>
    </div>
  </q-item-section>
</template>

<script lang="ts">
import type { Language } from '../../lang/index.js'
import Price from '../Price.vue'
export default {
  name: 'BookingItemContent'
}
const dateFormatter = (date: Date, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    dateStyle: 'full',
    timeZone: 'UTC'
  }).format(date)

export const formatBookingDates = ({
  startDate,
  startTime,
  endDate,
  endTime,
  lang,
  locale
}: {
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  lang: Language
  locale: string
}) => {
  return `${dateFormatter(new Date(startDate), locale)} ${startTime}
  ${lang.booking.until}
  ${dateFormatter(new Date(endDate), locale)} ${endTime}`
}
</script>

<script setup lang="ts">
import { watch } from 'vue'
import { QItem, QItemLabel, QItemSection, useQuasar } from 'quasar'
import { useLang, loadLang } from '../../lang/index.js'
import { Booking, BOOKING_STATUS } from '@petboarding/api/zod'
import { BOOKING_ICON, BOOKING_ICON_COLOR } from '../../configuration.js'
import { useConfiguration } from '../../configuration.js'
import InvoiceButton from '../InvoiceButton.vue'
export interface Props {
  modelValue: Booking
  showIcon?: boolean
  showApprovalButtons?: boolean
  showEditButton?: boolean
  showHandleCancelationButton?: boolean
  status?: 'arriving' | 'departing' | 'staying'
  showHistory?: boolean
}

defineProps<Props>()

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
    e: 'settleCancelation',
    {
      data,
      done
    }: {
      data: Booking
      done: (success?: boolean) => void
    }
  ): void
}>()

const lang = useLang()
const configuration = useConfiguration()

const $q = useQuasar()
if (lang.value.isoName !== $q.lang.isoName) loadLang($q.lang.isoName)
watch($q.lang, () => {
  loadLang($q.lang.isoName)
})

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

const approve = (booking: Booking) =>
  emit('approve', {
    data: booking,
    done: () => {
      //
    }
  })
const reject = (booking: Booking) =>
  emit('reject', {
    data: booking,
    done: () => {
      //
    }
  })

const standby = (booking: Booking) =>
  emit('standby', {
    data: booking,
    done: () => {
      //
    }
  })
const reply = (booking: Booking) =>
  emit('reply', {
    data: booking,
    done: () => {
      //
    }
  })

const settleCancelation = (booking: Booking) =>
  emit('settleCancelation', {
    data: booking,
    done: () => {}
  })
</script>

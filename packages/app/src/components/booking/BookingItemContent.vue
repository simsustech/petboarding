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
      <q-icon name="warning" color="red"> </q-icon>
      {{ lang.booking.messages.bookingModified }}
    </q-item-label>
    <q-item-label v-if="modelValue.isDoubleBooked" caption>
      <q-icon name="warning" color="red"> </q-icon>
      {{
        `${lang.booking.messages.isDoubleBooked} ${lang.booking.messages.cancelDoubleBookings}`
      }}
    </q-item-label>
    <q-item-label v-if="modelValue.overlapsWithUnavailablePeriod" caption>
      <q-icon name="warning" color="red"> </q-icon>
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
    <div class="row">
      <div v-if="showHandleCancelationButton" class="col-12 col-sm-shrink">
        <q-btn
          icon="check"
          color="red"
          :size="$q.screen.lt.sm ? 'sm' : 'md'"
          @click.stop="settleCancelation(modelValue)"
        />
      </div>
      <div v-if="showApprovalButtons" class="col-12 col-sm-shrink">
        <div class="row">
          <q-btn
            v-if="modelValue.status?.status !== 'approved'"
            icon="check"
            :dense="$q.screen.lt.sm"
            color="green"
            @click.stop="approve(modelValue)"
          />
          <q-btn
            v-if="modelValue.status?.status !== 'rejected'"
            icon="cancel"
            :dense="$q.screen.lt.sm"
            color="red"
            @click.stop="reject(modelValue)"
          />
        </div>
        <div class="row">
          <q-btn
            v-if="modelValue.status?.status !== 'standby'"
            icon="hourglass_full"
            :dense="$q.screen.lt.sm"
            color="yellow"
            @click.stop="standby(modelValue)"
          />

          <q-btn
            icon="reply"
            :dense="$q.screen.lt.sm"
            @click.stop="reply(modelValue)"
          />
        </div>
      </div>

      <div
        v-if="
          configuration.INTEGRATIONS?.slimfact.hostname &&
          modelValue.invoiceUuid &&
          modelValue.invoice
        "
        class="col-12 col-sm-shrink"
      >
        <q-btn
          :dense="$q.screen.lt.sm"
          data-html2canvas-ignore="true"
          :href="`https://${configuration.INTEGRATIONS?.slimfact.hostname}/invoice/${modelValue.invoiceUuid}`"
          target="_blank"
          :text-color="getInvoiceTextColor(modelValue)"
        >
          <div class="column q-pl-xs q-pr-xs">
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
        </q-btn>
      </div>

      <div v-if="showEditButton" class="col-12 col-sm-shrink">
        <q-btn icon="edit" :dense="$q.screen.lt.sm" @click.stop>
          <q-menu>
            <q-list>
              <q-item v-close-popup clickable @click.stop="update(modelValue)">
                <q-item-section>
                  <q-item-label>
                    {{ lang.edit }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-close-popup clickable @click.stop="cancel(modelValue)">
                <q-item-section>
                  <q-item-label class="text-red">
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

const getInvoiceTextColor = (booking: Booking) => {
  if (booking.invoice?.amountDue !== void 0) {
    if (booking.invoice.amountDue <= 0) return 'green-6'
    if (
      booking.invoice.amountPaid &&
      booking.invoice.requiredDownPaymentAmount
    ) {
      if (
        booking.invoice.amountPaid >= booking.invoice.requiredDownPaymentAmount
      )
        return 'orange-6'
    }
  }
}
</script>

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
      <q-icon name="warning" color="red"> </q-icon
      >{{ lang.booking.messages.isDoubleBooked }}</q-item-label
    >
    <q-item-label v-if="modelValue.comments" caption lines="2">
      {{ modelValue.comments }}
    </q-item-label>
    <q-item-label v-if="modelValue.services?.length" caption>
      {{
        modelValue.services.map((service) => service.service?.name).join(', ')
      }}
    </q-item-label>
    <q-item-label v-if="modelValue.costs?.total" caption>
      {{ configuration.CURRENCY + modelValue.costs.total.toFixed(2) }}
    </q-item-label>
  </q-item-section>
  <q-item-section side>
    <div v-if="showHandleCancellationButton">
      <q-btn
        icon="check"
        color="red"
        :size="$q.screen.lt.sm ? 'sm' : 'md'"
        @click.stop="settleCancellation(modelValue)"
      />
    </div>
    <div v-if="showApprovalButtons">
      <div class="row">
        <q-btn
          icon="check"
          :size="$q.screen.lt.sm ? 'sm' : 'md'"
          color="green"
          @click.stop="approve(modelValue)"
        />
        <q-btn
          icon="cancel"
          :size="$q.screen.lt.sm ? 'sm' : 'md'"
          color="red"
          @click.stop="reject(modelValue)"
        />
      </div>
      <div class="row">
        <q-btn
          v-if="modelValue.status.status !== 'standby'"
          icon="hourglass_full"
          :size="$q.screen.lt.sm ? 'sm' : 'md'"
          color="yellow"
          @click.stop="standby(modelValue)"
        />

        <q-btn
          icon="reply"
          :size="$q.screen.lt.sm ? 'sm' : 'md'"
          @click.stop="reply(modelValue)"
        />
      </div>
    </div>
    <q-item-label v-if="showEditButton">
      <q-btn @click.stop icon="edit" :size="$q.screen.lt.sm ? 'sm' : 'md'">
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
    </q-item-label>
  </q-item-section>
</template>

<script lang="ts">
export default {
  name: 'BookingItemContent'
}
</script>

<script setup lang="ts">
import { watch } from 'vue'
import {
  QItem,
  QItemLabel,
  QItemSection,
  useQuasar,
  date as dateUtil
} from 'quasar'
import { useLang, loadLang } from '../../lang/index.js'
import { Booking, BOOKING_STATUS } from '@petboarding/api/zod'
import { BOOKING_ICON, BOOKING_ICON_COLOR } from '../../configuration.js'
import { useConfiguration } from '../../configuration.js'
export interface Props {
  modelValue: Booking
  showIcon?: boolean
  showApprovalButtons?: boolean
  showEditButton?: boolean
  showHandleCancellationButton?: boolean
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
    e: 'settleCancellation',
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
  return `${dateUtil.formatDate(
    new Date(startDate),
    'D MMMM YYYY'
  )} ${startTime} ${lang.value.booking.until} ${dateUtil.formatDate(
    new Date(endDate),
    'D MMMM YYYY'
  )} ${endTime}`
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
    message: lang.value.booking.messages.cancellationReason,
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

const settleCancellation = (booking: Booking) =>
  emit('settleCancellation', {
    data: booking,
    done: () => {}
  })
</script>

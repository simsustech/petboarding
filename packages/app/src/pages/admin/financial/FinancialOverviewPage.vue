<template>
  <q-page padding>
    <q-list>
      <q-item-label header>
        {{ lang.booking.messages.unpaidBookings(days) }}
      </q-item-label>
      <!-- An empty list is a state, not a rendering failure: say so instead of
           leaving the header alone on the page (audit: admin-financial-overview). -->
      <q-item v-if="!unpaidBookings?.length">
        <q-item-section avatar>
          <q-icon name="i-mdi-check-circle-outline" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ lang.financial.noUnpaidBookings }}</q-item-label>
        </q-item-section>
      </q-item>
      <booking-item
        v-for="booking in unpaidBookings"
        :key="booking.id"
        :model-value="booking"
        @open-booking="onOpenBooking"
      />
    </q-list>
  </q-page>
</template>

<script setup lang="ts">
import { useLang } from '../../../lang/index.js'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BookingItem, {
  type OpenBookingHandler
} from '../../../components/booking/BookingItem.vue'
import { useAdminFinancialGetUnpaidBookingsQuery } from 'src/queries/admin/financial.js'

const router = useRouter()

const lang = useLang()

// const days = ref(90)
// const { useQuery } = await createUseTrpc()
// const { data: unpaidBookings, execute: executeUnpaidBookings } = useQuery(
//   'admin.getUnpaidBookings',
//   { args: reactive({ days }) }
// )

const {
  bookings: unpaidBookings,
  refetch: executeUnpaidBookings,
  days
} = useAdminFinancialGetUnpaidBookingsQuery()

const onOpenBooking: OpenBookingHandler = ({ id }) =>
  router.push(`/employee/bookings/${id}`)

onMounted(async () => {
  await executeUnpaidBookings()
})
</script>

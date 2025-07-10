<template>
  <q-list>
    <q-item-label header>
      {{ lang.booking.messages.unpaidBookings(days) }}
    </q-item-label>
    <booking-expansion-item
      v-for="booking in unpaidBookings"
      :key="booking.id"
      :model-value="booking"
    />
  </q-list>
</template>

<script setup lang="ts">
import BookingExpansionItem from '../../components/booking/BookingExpansionItem.vue'
import { useLang } from '../../lang/index.js'
import { onMounted } from 'vue'
import { useAdminFinancialGetUnpaidBookingsQuery } from 'src/queries/admin/financial.js'

const lang = useLang()

const {
  bookings: unpaidBookings,
  days,
  refetch: executeUnpaidBookings
} = useAdminFinancialGetUnpaidBookingsQuery()

onMounted(async () => {
  await executeUnpaidBookings()
})
</script>

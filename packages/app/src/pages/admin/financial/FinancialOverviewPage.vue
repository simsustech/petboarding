<template>
  <q-page padding>
    <q-list>
      <q-item-label header>
        {{ lang.booking.messages.unpaidBookings(days) }}
      </q-item-label>
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
import BookingItem from '../../../components/booking/BookingItem.vue'
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

const onOpenBooking: InstanceType<
  typeof BookingItem
>['$props']['onOpenBooking'] = ({ id }) =>
  router.push(`/employee/bookings/${id}`)

onMounted(async () => {
  await executeUnpaidBookings()
})
</script>

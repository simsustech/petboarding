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
import { createUseTrpc } from '../../trpc.js'
import BookingExpansionItem from '../../components/booking/BookingExpansionItem.vue'
import { useLang } from '../../lang/index.js'
import { onMounted } from 'vue'
import { ref } from 'vue'
import { reactive } from 'vue'

const lang = useLang()

const days = ref(90)
const { useQuery } = await createUseTrpc()
const { data: unpaidBookings, execute: executeUnpaidBookings } = useQuery(
  'admin.getUnpaidBookings',
  { args: reactive({ days }) }
)

onMounted(async () => {
  await executeUnpaidBookings()
})
</script>

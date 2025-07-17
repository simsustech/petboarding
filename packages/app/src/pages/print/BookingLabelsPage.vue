<template>
  <div class="p-1em print:p-0">
    <booking-label
      v-for="booking in data"
      :key="booking.id"
      :model-value="booking"
      :width="LABEL_WIDTH"
      :height="LABEL_HEIGHT"
    />
  </div>
</template>

<script lang="ts">
export default {
  name: 'PrintBookingLabelsPage'
}
</script>

<script setup lang="ts">
import { onMounted } from 'vue'
import BookingLabel from '../../components/booking/BookingLabel.vue'
import { onBeforeRouteUpdate, useRoute } from 'vue-router'
import { useEmployeeGetBookingLabelsQuery } from 'src/queries/employee/labels/booking'

const LABEL_WIDTH = (import.meta.env.VITE_LABEL_WIDTH || 62) - 4
const LABEL_HEIGHT = (import.meta.env.VITE_LABEL_HEIGHT || 62) - 4

const route = useRoute()

// const selectedBookings = ref<number[]>([])
// if (Array.isArray(route.params.ids)) {
//   selectedBookings.value = [...route.params.ids.map((id) => Number(id))]
// }
onBeforeRouteUpdate((to) => {
  if (to.params.ids && Array.isArray(to.params.ids)) {
    selectedBookings.value = to.params.ids.map((val) => Number(val))
  }
})

const {
  bookings: data,
  refetch: execute,
  ids: selectedBookings
} = useEmployeeGetBookingLabelsQuery()
if (Array.isArray(route.params.ids)) {
  selectedBookings.value = [...route.params.ids.map((id) => Number(id))]
}

onMounted(() => {
  if (route.params.ids) execute()
})
</script>

<style>
@media print {
  @page {
    height: v-bind('LABEL_HEIGHT');
    width: v-bind('LABEL_WIDTH');
    margin: 0;
  }
  .label {
    break-after: page;
  }
}
body {
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact; /* For Firefox */
}
</style>

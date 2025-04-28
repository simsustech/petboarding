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
import { ref, reactive, onMounted } from 'vue'
import BookingLabel from '../../components/booking/BookingLabel.vue'
import { createUseTrpc } from '../../trpc.js'
import { onBeforeRouteUpdate, useRoute } from 'vue-router'

const LABEL_WIDTH = (import.meta.env.VITE_LABEL_WIDTH || 62) - 4
const LABEL_HEIGHT = (import.meta.env.VITE_LABEL_HEIGHT || 62) - 4

const { useQuery } = await createUseTrpc()
const route = useRoute()

const selectedBookings = ref<number[]>([])
if (Array.isArray(route.params.ids)) {
  selectedBookings.value = [...route.params.ids.map((id) => Number(id))]
}
onBeforeRouteUpdate((to) => {
  if (to.params.ids && Array.isArray(to.params.ids)) {
    selectedBookings.value = to.params.ids.map((val) => Number(val))
  }
})

const { data, execute } = useQuery('employee.getBookingsByIds', {
  args: reactive({ ids: selectedBookings }),
  reactive: {
    args: true
  }
})

onMounted(() => {
  if (route.params.ids) execute()
})
</script>

<style>
@media print {
  @page {
    height: v-bind('LABEL_HEIGHT');
    width: v-bind('LABEL_WIDTH');
  }
  .label {
    break-after: page;
  }
}
</style>

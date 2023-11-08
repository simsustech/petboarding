<template>
  <div class="row justify-center">
    <q-btn label="Print" @click="printLabels" />
  </div>
  <div ref="labelsRef" class="">
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
  name: 'EmployeeBookingLabelsPage'
}
</script>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import BookingLabel from 'src/components/booking/BookingLabel.vue'
import { createUseTrpc } from '../../../trpc.js'
import { onBeforeRouteUpdate, useRoute } from 'vue-router'

const LABEL_WIDTH = import.meta.env.VITE_LABEL_WIDTH || 62
const LABEL_HEIGHT = import.meta.env.VITE_LABEL_HEIGHT || 62

const { useQuery } = await createUseTrpc()
const route = useRoute()
const labelsRef = ref()
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

const printLabels = async () => {
  let html2pdf = (element, opt) => {
    //
  }
  if (!import.meta.env.SSR) html2pdf = (await import('html2pdf.js')).default
  var element = labelsRef.value.innerHTML
  var opt = {
    margin: 1,
    filename: 'labels.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 1 },
    jsPDF: {
      unit: 'mm',
      format: [LABEL_WIDTH, LABEL_HEIGHT],
      orientation: 'portrait'
    },
    pagebreak: { after: '.label' }
  }
  html2pdf(element, opt)
}

onMounted(() => {
  if (route.params.ids) execute()
})
</script>

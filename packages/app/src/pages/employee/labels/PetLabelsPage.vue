<template>
  <div class="row justify-center">
    <pet-select
      :model-value="selectedPetIds"
      multiple
      @update:model-value="setParam"
    />

    <q-btn label="Print" @click="printLabels" />
  </div>
  <div ref="labelsRef" class="">
    <pet-label
      v-for="pet in data"
      :key="pet.id"
      :model-value="pet"
      :width="LABEL_WIDTH"
      :height="LABEL_HEIGHT"
    />
  </div>
</template>

<script lang="ts">
export default {
  name: 'EmployeeLabelsPage'
}
</script>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import PetLabel from '../../../components/pet/PetLabel.vue'
import { createUseTrpc } from '../../../trpc.js'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'

const LABEL_WIDTH = import.meta.env.VITE_LABEL_WIDTH || 62
const LABEL_HEIGHT = import.meta.env.VITE_LABEL_HEIGHT || 62

const { useQuery } = await createUseTrpc()
const route = useRoute()
const router = useRouter()
const labelsRef = ref()
const selectedPetIds = ref<number[]>([])
if (Array.isArray(route.params.ids)) {
  selectedPetIds.value = [...route.params.ids.map((id) => Number(id))]
}
onBeforeRouteUpdate((to) => {
  if (to.params.ids && Array.isArray(to.params.ids)) {
    selectedPetIds.value = to.params.ids.map((val) => Number(val))
  }
})

const setParam = (ids: number) => {
  router.push({ params: { ids } })
}

const { data, execute } = useQuery('employee.getPetsByIds', {
  args: reactive({ ids: selectedPetIds }),
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
    html2canvas: { scale: 1.8 },
    jsPDF: {
      unit: 'mm',
      format: [LABEL_WIDTH, LABEL_HEIGHT + 4],
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

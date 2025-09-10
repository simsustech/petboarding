<template>
  <q-page padding>
    <q-toolbar>
      <pet-select
        :model-value="selectedPetIds"
        multiple
        clearable
        :filled="false"
        rounded
        standout
        @update:model-value="setParam"
      >
        <template #prepend> <q-icon name="i-mdi-search" /> </template>
      </pet-select>

      <q-btn icon="i-mdi-printer" @click="printLabels" />
    </q-toolbar>

    <div ref="labelsRef" class="">
      <pet-label v-for="pet in data" :key="pet.id" :model-value="pet" />
    </div>
  </q-page>
</template>

<script lang="ts">
export default {
  name: 'EmployeeLabelsPage'
}
</script>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PetLabel from '../../../components/pet/PetLabel.vue'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { useEmployeeGetPetLabelsQuery } from 'src/queries/employee/labels/pet'

const route = useRoute()
const router = useRouter()
const labelsRef = ref()
// const selectedPetIds = ref<number[]>([])
// if (Array.isArray(route.params.ids)) {
//   selectedPetIds.value = [...route.params.ids.map((id) => Number(id))]
// }
onBeforeRouteUpdate((to) => {
  if (to.params.ids && Array.isArray(to.params.ids)) {
    selectedPetIds.value = to.params.ids.map((val) => Number(val))
  }
})

const setParam = (ids: number) => {
  router.push({ params: { ids } })
}

const {
  pets: data,
  refetch: execute,
  ids: selectedPetIds
} = useEmployeeGetPetLabelsQuery()
if (Array.isArray(route.params.ids)) {
  selectedPetIds.value = [...route.params.ids.map((id) => Number(id))]
}
// const { data, execute } = useQuery('employee.getPetsByIds', {
//   args: reactive({ ids: selectedPetIds }),
//   reactive: {
//     args: true
//   }
// })

const printLabels = async () => {
  router.push({
    path: `/print/pets/${selectedPetIds.value.join('/')}`
  })
  // let html2pdf = (element, opt) => {
  //   //
  // }
  // if (!import.meta.env.SSR) html2pdf = (await import('html2pdf.js')).default
  // var element = labelsRef.value.innerHTML
  // var opt = {
  //   margin: 1,
  //   filename: 'labels.pdf',
  //   image: { type: 'jpeg', quality: 0.98 },
  //   html2canvas: { scale: 1.8 },
  //   jsPDF: {
  //     unit: 'mm',
  //     format: [LABEL_WIDTH, LABEL_HEIGHT + 4],
  //     orientation: 'portrait'
  //   },
  //   pagebreak: { after: '.label' }
  // }
  // html2pdf(element, opt)
}

onMounted(() => {
  if (route.params.ids) execute()
})
</script>

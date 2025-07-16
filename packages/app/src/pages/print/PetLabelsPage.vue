<template>
  <div class="p-1em print:p-0">
    <div ref="labelsRef" class="">
      <pet-label
        v-for="pet in data"
        :key="pet.id"
        :model-value="pet"
        :width="LABEL_WIDTH"
        :height="LABEL_HEIGHT"
      />
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'EmployeeLabelsPage'
}
</script>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PetLabel from '../../components/pet/PetLabel.vue'
import { onBeforeRouteUpdate, useRoute } from 'vue-router'
import { useEmployeeGetPetLabelsQuery } from 'src/queries/employee/labels/pet'

const LABEL_WIDTH = (import.meta.env.VITE_LABEL_WIDTH || 62) - 4
const LABEL_HEIGHT = (import.meta.env.VITE_LABEL_HEIGHT || 62) - 4

const route = useRoute()
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

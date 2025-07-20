<template>
  <div class="page p-1em print:p-0">
    <div class="row justify-center text-h6">
      {{ formatDate(selectedDate, { dateStyle: 'medium' }) }}
    </div>
    <div class="row pt-0px mt-0px">
      <pet-chip
        v-for="pet in internalPetKennels.filter((pet) => pet.kennelId === null)"
        :id="`pet${pet.id}`"
        :key="pet.id"
        :class="{
          'col-auto': true,
          'bg-white': true,
          // 'bg-blue-2': pet.bookingId,
          // 'bg-yellow-2': pet.daycareDateId,
          'py-0px': true
        }"
        :model-value="pet"
        show-last-name
        draggable="true"
        @dragstart="onDragStart"
      >
      </pet-chip>
    </div>
    <div class="q-col-gutter-md row">
      <div
        v-for="building in buildings"
        :key="building.id"
        class="col-12 pt-0px mt-0px"
      >
        <div class="col-12 row justify-center text-h6 q-mb-none">
          {{ building.name }}
        </div>
        <div class="grid grid-cols-12 gap-1">
          <q-card
            v-for="kennel in building.kennels"
            :key="kennel.id"
            class="col-span-3 p-0px bg-white"
            bordered
            :style="{
              'border-width': '3px',
              'min-width': '75px'
            }"
          >
            <q-card-section
              header
              class="text-h6 text-center p-0px m-0px line-height-1.2em"
            >
              {{ kennel.name }}
            </q-card-section>
            <q-card-section
              v-if="
                internalPetKennels.find((pet) => pet.kennelId === kennel.id)
              "
              :id="`kennel${kennel.id}`"
              class="text-center q-pl-none q-pr-none q-pt-none q-pb-xs"
            >
              <div
                v-for="pet in internalPetKennels.filter(
                  (pet) => pet.kennelId === kennel.id
                )"
                :id="`pet${pet.id}`"
                :key="pet.id"
                class="row justify-center"
              >
                <pet-chip
                  :id="`pet${pet.id}`"
                  :class="{
                    'bg-white': true,
                    'text-italic': pet.daycareDateId,
                    // 'bg-blue-2': pet.bookingId,
                    // 'bg-yellow-2': pet.daycareDateId,
                    'py-0px': true
                  }"
                  :model-value="pet"
                  show-badge
                  show-last-name
                  draggable="true"
                  @dragstart="onDragStart"
                >
                </pet-chip>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { extend, useMeta } from 'quasar'
import { onBeforeRouteUpdate, useRoute } from 'vue-router'
import { formatDate } from '../../tools.js'
import PetChip from '../../components/pet/PetChip.vue'
import type { Pet } from '@petboarding/api/zod'
import { useEmployeeGetPetKennelsQuery } from 'src/queries/employee/petKennel.js'
import { useEmployeeGetBuildingsQuery } from 'src/queries/employee/building.js'

// const { useQuery } = await createUseTrpc()

const route = useRoute()
// const selectedDate = ref(
//   !Array.isArray(route.params.date)
//     ? route.params.date
//     : new Date().toISOString().slice(0, 10)
// )

onBeforeRouteUpdate((to) => {
  if (to.params.date && !Array.isArray(to.params.date)) {
    selectedDate.value = to.params.date
  }
})

const internalPetKennels = ref<
  (Pick<Pet, 'id' | 'name' | 'food' | 'medicines'> & {
    customer: {
      lastName: string
    }
    kennelId: number | null
    bookingId?: number
    daycareDateId?: number
  })[]
>([])

const { buildings, refetch: executeBuildings } = useEmployeeGetBuildingsQuery()
const {
  petKennels,
  refetch: executePets,
  selectedDate
} = useEmployeeGetPetKennelsQuery()
selectedDate.value = !Array.isArray(route.params.date)
  ? route.params.date
  : new Date().toISOString().slice(0, 10)

useMeta({
  title: `kennel layout ${selectedDate.value}`
})
// const { data: buildings, execute: executeBuildings } = useQuery(
//   'employee.getBuildings'
// )
// const { data: petKennels, execute: executePets } = useQuery(
//   'employee.getPetKennels',
//   {
//     args: reactive({
//       date: selectedDate
//     })
//   }
// )

watch(
  () => petKennels.value,
  () => {
    if (petKennels.value)
      internalPetKennels.value = petKennels.value.map((val) => extend({}, val))
  }
)

// store the id of the draggable element
function onDragStart(e) {
  e.dataTransfer.setData('text', e.target.id)
  e.dataTransfer.dropEffect = 'move'
}

onMounted(async () => {
  await executeBuildings()
  await executePets()
  // internalPetKennels.value = petKennels.value.map((val) => extend({}, val))
})
</script>

<style>
@media print {
  @page {
    size: auto;
    margin: 15mm;
  }
}
body {
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact; /* For Firefox */
}
</style>

<template>
  <q-page class="page" :style="{ padding: '2cm' }">
    <div class="row justify-center text-h6">
      {{ formatDate(selectedDate, { dateStyle: 'medium' }) }}
    </div>
    <div class="row" style="height: 150px">
      <pet-chip
        v-for="pet in internalPetKennels.filter((pet) => pet.kennelId === null)"
        :id="`pet${pet.id}`"
        :key="pet.id"
        :class="{
          'col-auto': true,
          'bg-blue-2': pet.bookingId,
          'bg-yellow-2': pet.daycareDateId
        }"
        :model-value="pet"
        show-last-name
        draggable="true"
        @dragstart="onDragStart"
      >
      </pet-chip>
      <div class="col-12 q-col-gutter-md row">
        <div v-for="building in buildings" :key="building.id" class="col-auto">
          <div class="col-12 row justify-center text-h6 q-mb-none">
            {{ building.name }}
          </div>
          <div class="col-12 row">
            <q-card
              v-for="kennel in building.kennels"
              :key="kennel.id"
              class="col-3"
              bordered
              :style="{
                'border-width': '3px',
                'min-width': '75px'
              }"
            >
              <q-card-section
                header
                class="text-h6 text-center q-pt-xs q-pb-none"
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
                      'bg-blue-2': pet.bookingId,
                      'bg-yellow-2': pet.daycareDateId
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
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { createUseTrpc } from '../../trpc.js'
import { extend, useMeta } from 'quasar'
import { onBeforeRouteUpdate, useRoute } from 'vue-router'
import { formatDate } from '../../tools.js'
import PetChip from '../../components/pet/PetChip.vue'
import type { Pet } from '@petboarding/api/zod'

const { useQuery } = await createUseTrpc()

const route = useRoute()
const selectedDate = ref(
  !Array.isArray(route.params.date)
    ? route.params.date
    : new Date().toISOString().slice(0, 10)
)

onBeforeRouteUpdate((to) => {
  if (to.params.date && !Array.isArray(to.params.date)) {
    selectedDate.value = to.params.date
  }
})

useMeta({
  title: `kennel layout ${selectedDate.value}`
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

const { data: buildings, execute: executeBuildings } = useQuery(
  'employee.getBuildings'
)
const { data: petKennels, execute: executePets } = useQuery(
  'employee.getPetKennels',
  {
    args: reactive({
      date: selectedDate
    })
  }
)

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
    margin: 0mm;
  }
}
</style>

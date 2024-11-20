<template>
  <q-page padding class="page">
    <div class="row justify-center">
      {{ selectedDate }}
    </div>
    <div class="row" style="height: 150px">
      <q-chip
        v-for="pet in internalPetKennels.filter((pet) => pet.kennelId === null)"
        :id="`pet${pet.id}`"
        :key="pet.id"
        :class="{
          'col-auto': true,
          'bg-blue-2': pet.bookingId,
          'bg-yellow-2': pet.daycareDateId
        }"
        draggable="true"
        @dragstart="onDragStart"
      >
        {{ `${pet.name} ${truncate(pet.lastName, 6)}` }}
      </q-chip>
      <div class="col-12 q-col-gutter-md">
        <div v-for="building in buildings" :key="building.id" class="row">
          <div class="col-12 row">
            {{ building.name }}
          </div>
          <div class="col-12 row">
            <q-card
              v-for="kennel in building.kennels"
              :key="kennel.id"
              class="col-3"
            >
              <q-card-section header>
                {{ kennel.name }}
              </q-card-section>
              <q-card-section :id="`kennel${kennel.id}`">
                <q-chip
                  v-for="pet in internalPetKennels.filter(
                    (pet) => pet.kennelId === kennel.id
                  )"
                  :class="{
                    'bg-blue-2': pet.bookingId,
                    'bg-yellow-2': pet.daycareDateId
                  }"
                  :id="`pet${pet.id}`"
                  :key="pet.id"
                  draggable="true"
                  @dragstart="onDragStart"
                >
                  {{ `${pet.name} ${truncate(pet.lastName, 6)}` }}
                </q-chip>
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
  {
    id: number
    name: string
    lastName: string
    kennelId: number | null
    bookingId?: number
    daycareDateId?: number
  }[]
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

function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n - 1) + '...' : str
}

onMounted(async () => {
  await executeBuildings()
  await executePets()
  // internalPetKennels.value = petKennels.value.map((val) => extend({}, val))
})
</script>

<style lang="sass">
.drop-target
  min-height: 50px
  background-color: gainsboro

.drag-enter
  outline-style: dashed
</style>

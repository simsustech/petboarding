<template>
  <q-page padding>
    <div class="row" style="height: 150px">
      <div class="col-12 col-md-3">
        <q-chip
          v-for="pet in internalPetKennels.filter(
            (pet) => pet.kennelId === null
          )"
          :id="`pet${pet.id}`"
          :key="pet.id"
          draggable="true"
          @dragstart="onDragStart"
          :class="{ 'bg-green': pet.daycareDateId }"
        >
          {{ pet.name }}
        </q-chip>
      </div>
      <div class="col-12 col-md-9 q-col-gutter-md">
        <div v-for="building in buildings" :key="building.id" class="row">
          <div class="col-12 row">
            {{ building.name }}
          </div>
          <div class="col-12 row">
            <q-card
              v-for="kennel in building.kennels"
              :key="kennel.id"
              class="col"
            >
              <q-card-section header>
                {{ kennel.name }}
              </q-card-section>
              <q-card-section
                :id="`kennel${kennel.id}`"
                class="drop-target rounded-borders overflow-hidden"
                @dragenter="onDragEnter"
                @dragleave="onDragLeave"
                @dragover="onDragOver"
                @drop="onDrop"
              >
                <q-chip
                  v-for="pet in internalPetKennels.filter(
                    (pet) => pet.kennelId === kennel.id
                  )"
                  :id="`pet${pet.id}`"
                  :key="pet.id"
                  draggable="true"
                  @dragstart="onDragStart"
                >
                  {{ pet.name }}
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
import { onMounted, ref } from 'vue'
import { createUseTrpc } from '../../trpc.js'
import { extend } from 'quasar'

const { useQuery, useMutation } = await createUseTrpc()
// const pets = ref([
//   {
//     id: 1,
//     name: 'Max',
//     kennelId: null
//   },
//   {
//     id: 2,
//     name: 'Diesel',
//     kennelId: 2
//   }
// ])

// const kennels = ref([
//   {
//     id: 1,
//     name: 'Hok 1'
//   },
//   {
//     id: 2,
//     name: 'Hok 2'
//   }
// ])
const internalPetKennels = ref([])
const { data: buildings, execute: executeBuildings } = useQuery(
  'employee.getBuildings'
)
const { data: petKennels, execute: executePets } = useQuery(
  'employee.getPetKennels'
)

// store the id of the draggable element
function onDragStart(e) {
  e.dataTransfer.setData('text', e.target.id)
  e.dataTransfer.dropEffect = 'move'
}

function onDragEnter(e) {
  // don't drop on other draggables
  if (e.target.draggable !== true) {
    e.target.classList.add('drag-enter')
  }
}

function onDragLeave(e) {
  e.target.classList.remove('drag-enter')
}

function onDragOver(e) {
  e.preventDefault()
}

function onDrop(e) {
  e.preventDefault()

  // don't drop on other draggables
  if (e.target.draggable === true) {
    return
  }

  const draggedId = e.dataTransfer.getData('text')
  const draggedEl = document.getElementById(draggedId)
  let petId: number | undefined
  if (draggedId) petId = Number(draggedId.match(/pet(.*)/).at(1))
  let kennelId: number | undefined
  if (e.target.id) kennelId = Number(e.target.id?.match(/kennel(.*)/).at(1))

  // check if original parent node
  if (draggedEl?.parentNode === e.target || !kennelId) {
    e.target.classList.remove('drag-enter')
    return
  }

  const petKennel =
    internalPetKennels.value[
      internalPetKennels.value.findIndex((pet) => pet.id === petId)
    ]
  petKennel.kennelId = kennelId

  if (petKennel.bookingId) {
    useMutation('employee.setBookingPetKennel', {
      args: petKennel,
      immediate: true
    })
  } else if (petKennel.daycareDateId) {
    useMutation('employee.setDaycareDatePetKennel', {
      args: petKennel,
      immediate: true
    })
  }

  e.target.classList.remove('drag-enter')
}

onMounted(async () => {
  await executeBuildings()
  await executePets()
  internalPetKennels.value = petKennels.value.map((val) => extend({}, val))
})
</script>

<style lang="sass">
.drop-target
  min-height: 50px
  background-color: gainsboro

.drag-enter
  outline-style: dashed
</style>

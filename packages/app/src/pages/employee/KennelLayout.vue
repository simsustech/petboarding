<template>
  <q-page padding>
    <q-toolbar>
      <date-input
        v-model="selectedDate"
        hide-bottom-space
        :label="lang.kennellayout.labels.date"
        format="DD-MM-YYYY"
        clearable
        :date="{
          noUnset: true,
          firstDayOfWeek: '1'
        }"
        :icons="{
          event: 'i-mdi-event',
          clear: 'i-mdi-clear'
        }"
      >
      </date-input>
      <q-btn
        outline
        icon="i-mdi-printer"
        :to="`/print/kennellayout/${selectedDate}`"
      />
    </q-toolbar>
    <q-toolbar inset class="justify-center">
      <q-btn-group>
        <q-btn :label="lang.kennellayout.labels.today" @click="setToToday" />
        <q-btn
          :label="lang.kennellayout.labels.tomorrow"
          @click="setToTomorrow"
        />
      </q-btn-group>
    </q-toolbar>

    <div class="row">
      <div class="col-12 col-sm">
        <q-badge rounded text-color="black" color="blue-2"></q-badge>
        {{ lang.booking.title }}
      </div>
      <div class="col-12 col-sm">
        <q-badge rounded text-color="black" color="yellow-2"></q-badge>
        {{ lang.daycare.title }}
      </div>
    </div>
    <pet-legend />
    <div class="row">
      {{ lang.kennellayout.messages.dragAndDrop }}
    </div>
    <div class="grid grid-cols-12 gap-3">
      <q-card class="col-span-12 md:col-span-3">
        <q-card-section
          id="waitlist"
          @dragenter="onDragEnter"
          @dragleave="onDragLeave"
          @dragover="onDragOver"
          @drop="onDrop"
        >
          <pet-chip
            v-for="pet in internalPetKennels.filter(
              (pet) => pet.kennelId === null
            )"
            :id="`pet${pet.id}`"
            :key="pet.id"
            :model-value="pet"
            :class="{
              'bg-blue-2': pet.bookingId,
              'bg-yellow-2': pet.daycareDateId
            }"
            :draggable="true"
            show-image
            show-last-name
            @dragstart="onDragStart"
            @open-pet="openPet"
          >
            <template #menu-items>
              <pet-kennel-context-menu-items
                :pet-kennel="pet"
                :buildings="buildings"
                @set-pet-kennel="setPetKennel"
              />
            </template>
          </pet-chip>
        </q-card-section>
      </q-card>
      <div class="col-span-12 md:col-span-9">
        <div v-for="building in buildings" :key="building.id" class="row">
          <div class="col-12">
            {{ building.name }}
          </div>
          <div class="col-12 grid grid-cols-12 gap-4">
            <q-card
              v-for="kennel in building.kennels"
              :key="kennel.id"
              class="col-span-12 md:col-span-3"
              :style="{ 'min-height': '120px' }"
            >
              <q-card-section header>
                {{ kennel.name }}
              </q-card-section>
              <q-card-section
                :id="`kennel${kennel.id}`"
                class="min-h-80px !border-rd-8px drop-target rounded-borders overflow-hidden"
                @dragenter="onDragEnter"
                @dragleave="onDragLeave"
                @dragover="onDragOver"
                @drop="onDrop"
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
                    :model-value="pet"
                    :class="{
                      'bg-blue-2': pet.bookingId,
                      'bg-yellow-2': pet.daycareDateId
                    }"
                    :draggable="true"
                    show-badge
                    show-last-name
                    show-image
                    @dragstart="onDragStart"
                    @open-pet="openPet"
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
import { onMounted, ref, watch } from 'vue'
import { extend, date as dateUtil } from 'quasar'
import { useLang } from '../../lang/index.js'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { DateInput } from '@simsustech/quasar-components/form'
import PetChip from '../../components/pet/PetChip.vue'
import PetLegend from '../../components/pet/PetLegend.vue'
import { useEmployeeGetPetKennelsQuery } from '../../queries/employee/petKennel.js'
import { useEmployeeGetBuildingsQuery } from '../../queries/employee/building.js'
import {
  useEmployeeSetBookingPetKennelMutation,
  useEmployeeSetDaycareDatePetKennelMutation
} from '../../mutations/employee/petKennel.js'
import type { PetKennel } from '../../configuration.js'
import PetKennelContextMenuItems from '../../components/kennelLayout/PetKennelContextMenuItems.vue'

const lang = useLang()

const router = useRouter()
const route = useRoute()

onBeforeRouteUpdate((to) => {
  if (to.params.date && !Array.isArray(to.params.date)) {
    selectedDate.value = to.params.date
  }
})

const internalPetKennels = ref<PetKennel[]>([])

const { buildings, refetch: executeBuildings } = useEmployeeGetBuildingsQuery()
const {
  petKennels,
  refetch: executePets,
  selectedDate
} = useEmployeeGetPetKennelsQuery()
selectedDate.value = !Array.isArray(route.params.date)
  ? route.params.date
  : new Date().toISOString().slice(0, 10)

const { mutateAsync: setBookingPetKennelMutation } =
  useEmployeeSetBookingPetKennelMutation()
const { mutateAsync: setDaycareDatePetKennelMutation } =
  useEmployeeSetDaycareDatePetKennelMutation()

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

function onDragEnter(e) {
  // don't drop on other draggables
  if (
    e.target.draggable !== true &&
    ![...e.target.classList].includes('q-chip__content')
  ) {
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
  let kennel = e.target

  for (let i = 0; i < 4; i++) {
    if (!kennel.id?.match(/(kennel|waitlist)(.*)/)) {
      kennel = kennel.parentNode
    }
  }
  const draggedId = e.dataTransfer.getData('text')
  const draggedEl = document.getElementById(draggedId)
  let petId: number | undefined
  if (draggedId) petId = Number(draggedId.match(/pet(.*)/).at(1))
  let kennelId: number | undefined | null
  if (kennel.id) {
    if (kennel.id === 'waitlist') kennelId = null
    else kennelId = Number(kennel.id?.match(/kennel(.*)/).at(1))
  }

  // check if original parent node
  if (draggedEl?.parentNode === e.target || kennelId === undefined) {
    e.target.classList.remove('drag-enter')
    return
  }

  const petKennel =
    internalPetKennels.value[
      internalPetKennels.value.findIndex((pet) => pet.id === petId)
    ]
  petKennel.kennelId = kennelId

  setPetKennel(petKennel)

  e.target.classList.remove('drag-enter')
}

const setPetKennel = async (petKennel: PetKennel) => {
  if (petKennel.bookingId) {
    await setBookingPetKennelMutation(petKennel)
  } else if (petKennel.daycareDateId) {
    await setDaycareDatePetKennelMutation(petKennel)
  }
  const internalPetKennelIndex = internalPetKennels.value.findIndex(
    (pet) => pet.id === petKennel.id
  )
  internalPetKennels.value[internalPetKennelIndex] = {
    ...internalPetKennels.value[internalPetKennelIndex],
    kennelId: petKennel.kennelId
  }
}

const setToToday = () => {
  router.push({
    name: 'employeekennellayout',
    params: {
      date: new Date().toISOString().slice(0, 10)
    }
  })
}

const setToTomorrow = () => {
  router.push({
    name: 'employeekennellayout',
    params: {
      date: dateUtil
        .addToDate(new Date(), { days: 1 })
        .toISOString()
        .slice(0, 10)
    }
  })
}

const openPet = (id: number) =>
  router.push({
    path: `/employee/pets/${id}`
  })

onMounted(async () => {
  await executeBuildings()
  await executePets()
})
</script>

<style lang="sass">
.drop-target
  background-color: gainsboro

.drag-enter
  outline-style: dashed
  outline-offset: -2px
</style>

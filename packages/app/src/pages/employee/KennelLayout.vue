<template>
  <q-page padding>
    <div class="row justify-center">
      <date-input
        v-model="selectedDate"
        :label="lang.kennellayout.labels.date"
        format="DD-MM-YYYY"
        required
        clearable
        class="col-auto"
        :date="{
          noUnset: true,
          firstDayOfWeek: '1'
        }"
      />
    </div>
    <div class="row justify-center q-ma-sm">
      <q-btn
        class="col-auto"
        :label="lang.kennellayout.labels.today"
        @click="setToToday"
      />
      <q-btn
        class="col-auto"
        :label="lang.kennellayout.labels.tomorrow"
        @click="setToTomorrow"
      />
      <q-btn icon="print" :to="`/print/kennellayout/${selectedDate}`" />
    </div>
    <div class="row q-col-gutter-md">
      <div class="col-auto">
        <q-badge rounded text-color="black" color="blue-2"></q-badge
        ><a>{{ lang.booking.title }}</a>
      </div>
      <div class="col-auto">
        <q-badge rounded text-color="black" color="yellow-2"></q-badge
        ><a>{{ lang.daycare.title }}</a>
      </div>
      <div class="col-auto">
        <a>{{ lang.kennellayout.messages.dragAndDrop }}</a>
      </div>
    </div>
    <div class="row q-col-gutter-sm" style="height: 150px">
      <div class="col-12 col-md-3">
        <q-card>
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
              @dragstart="onDragStart"
              @open-pet="openPet"
            >
            </pet-chip>
          </q-card-section>
        </q-card>
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
              class="col-6 col-md-3 column"
              :style="{ 'min-height': '120px' }"
            >
              <q-card-section header>
                {{ kennel.name }}
              </q-card-section>
              <q-card-section
                :id="`kennel${kennel.id}`"
                class="col drop-target rounded-borders overflow-hidden"
                @dragenter="onDragEnter"
                @dragleave="onDragLeave"
                @dragover="onDragOver"
                @drop="onDrop"
              >
                <pet-chip
                  v-for="pet in internalPetKennels.filter(
                    (pet) => pet.kennelId === kennel.id
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
                  @dragstart="onDragStart"
                  @open-pet="openPet"
                >
                </pet-chip>
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
import { extend, date as dateUtil } from 'quasar'
import { useLang } from '../../lang/index.js'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { DateInput } from '@simsustech/quasar-components/form'
import PetChip from '../../components/pet/PetChip.vue'

const { useQuery, useMutation } = await createUseTrpc()
const lang = useLang()

const router = useRouter()
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
const internalPetKennels = ref<
  {
    id: number
    name: string
    customer: {
      lastName: string
    }
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

  const draggedId = e.dataTransfer.getData('text')
  const draggedEl = document.getElementById(draggedId)
  let petId: number | undefined
  if (draggedId) petId = Number(draggedId.match(/pet(.*)/).at(1))
  let kennelId: number | undefined | null
  if (e.target.id) {
    if (e.target.id === 'waitlist') kennelId = null
    else kennelId = Number(e.target.id?.match(/kennel(.*)/).at(1))
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
  // internalPetKennels.value = petKennels.value.map((val) => extend({}, val))
})
</script>

<style lang="sass">
.drop-target
  background-color: gainsboro

.drag-enter
  outline-style: dashed
  outline-offset: -2px
</style>

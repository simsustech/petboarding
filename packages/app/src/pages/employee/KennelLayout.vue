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
    <div class="row items-center q-gutter-xs text-subtitle2">
      <q-icon name="i-mdi-gesture-tap" size="sm" />
      <span>{{ lang.kennellayout.messages.selectKennel }}</span>
    </div>
    <div class="grid grid-cols-12 gap-3">
      <q-card class="col-span-12 md:col-span-3">
        <q-card-section id="waitlist">
          <pet-chip
            v-for="pet in internalPetKennels.filter(
              (pet) => pet.kennelId === null
            )"
            :id="`pet${pet.id}`"
            :key="pet.id"
            :model-value="pet"
            :class="getPetChipClasses(pet)"
            :overline="getOverline(pet)"
            show-image
            show-last-name
            show-badge
            :on-open-pet="true"
            clickable
            tabindex="0"
            @click="openPicker(pet)"
            @keydown.enter.prevent="openPicker(pet)"
            @keydown.space.prevent="openPicker(pet)"
            @open-pet="openPet"
          />
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
                class="rounded-borders overflow-hidden"
              >
                <div
                  v-for="pet in internalPetKennels.filter(
                    (pet) => pet.kennelId === kennel.id
                  )"
                  :key="pet.id"
                  class="row justify-center"
                >
                  <pet-chip
                    :id="`pet${pet.id}`"
                    :model-value="pet"
                    :class="getPetChipClasses(pet)"
                    show-badge
                    show-last-name
                    show-image
                    :overline="getOverline(pet)"
                    :on-open-pet="true"
                    clickable
                    tabindex="0"
                    @click="openPicker(pet)"
                    @keydown.enter.prevent="openPicker(pet)"
                    @keydown.space.prevent="openPicker(pet)"
                    @open-pet="openPet"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>

    <responsive-dialog
      ref="pickerDialogRef"
      display
      :title="pickerTitle"
      :icons="{ close: 'i-mdi-close' }"
    >
      <kennel-picker-dialog
        v-if="pickedPetKennel"
        :pet-kennel="pickedPetKennel"
        :buildings="buildings"
        :pet-kennels="internalPetKennels"
        @select="onSelectKennel"
      />
    </responsive-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { extend, Notify, date as dateUtil } from 'quasar'
import { useLang } from '../../lang/index.js'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { DateInput } from '@simsustech/quasar-components/form'
import PetChip from '../../components/pet/PetChip.vue'
import PetLegend from '../../components/pet/PetLegend.vue'
import { useEmployeeGetPetKennelsQuery } from '../../queries/employee/petKennel.js'
import { useEmployeeGetBuildingsQuery } from '../../queries/employee/building.js'
import {
  useEmployeeSetBookingPetKennelForDateMutation,
  useEmployeeSetDaycareDatePetKennelMutation
} from '../../mutations/employee/petKennel.js'
import type { PetKennel } from '../../configuration.js'
import { PET_CHIP_BADGE_COLORS } from '../../configuration.js'
import KennelPickerDialog from '../../components/kennelLayout/KennelPickerDialog.vue'
import { ResponsiveDialog } from '@simsustech/quasar-components'
import { usePublicGetOpeningTimesQuery } from 'src/queries/public.js'

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
const { openingTimes } = usePublicGetOpeningTimesQuery()

// Keep the URL in step with the date field. Without this the picker/field changed
// the queried date but left `:date` at the old value, so the page could not be
// bookmarked, shared or reloaded for the day the user was actually looking at
// (and a back/forward step restored a stale date).
// Guarded both ways: only push when the values genuinely differ, and only for a
// date-shaped value — the field is clearable, and `to.params.date` may be absent
// while the input is momentarily empty.
watch(selectedDate, (value) => {
  if (!value) return
  const current = !Array.isArray(route.params.date) ? route.params.date : ''
  if (value === current) return
  // `replace`, not `push`: adjusting the date refines the current view rather
  // than navigating somewhere new. Pushing stacked a history entry per edit,
  // which made Back land on a half-edited date and left Forward dead.
  router.replace({
    name: 'employeekennellayout',
    params: { date: value }
  })
})

const { mutateAsync: setBookingPetKennelForDateMutation } =
  useEmployeeSetBookingPetKennelForDateMutation()
const { mutateAsync: setDaycareDatePetKennelMutation } =
  useEmployeeSetDaycareDatePetKennelMutation()

watch(
  () => petKennels.value,
  () => {
    if (petKennels.value)
      internalPetKennels.value = petKennels.value.map((val) => extend({}, val))
  }
)

const setPetKennel = async (petKennel: PetKennel) => {
  if (petKennel.bookingId) {
    await setBookingPetKennelForDateMutation({
      bookingId: petKennel.bookingId,
      petId: petKennel.id,
      date: selectedDate.value,
      kennelId: petKennel.kennelId
    })
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

const pickedPetKennel = ref<PetKennel | null>(null)
const pickerDialogRef = ref<typeof ResponsiveDialog>()
// True while an assignment mutation is in flight (double-tap guard).
const assigning = ref(false)

// The dialog title names the *subject* ("Place name3"): the rows are about one
// pet, and a bare name doesn't say what the dialog is for.
const pickerTitle = computed(() =>
  pickedPetKennel.value
    ? lang.value.kennellayout.dialog.placeTitle.replace(
        '{pet}',
        pickedPetKennel.value.name ?? ''
      )
    : ''
)

const openPicker = (pet: PetKennel) => {
  pickedPetKennel.value = pet
  pickerDialogRef.value?.functions.open()
}

const onSelectKennel = async (kennelId: number | null) => {
  const picked = pickedPetKennel.value
  if (!picked) return
  if (kennelId === picked.kennelId) {
    // Same target as the current assignment — just close, no mutation.
    pickerDialogRef.value?.functions.close()
    return
  }

  // Guard concurrent taps: a second row tap while the first mutation is in
  // flight would race two assignments for the same pet.
  if (assigning.value) return
  assigning.value = true

  const previousKennelId = picked.kennelId
  const targetLabel =
    kennelId === null
      ? lang.value.kennellayout.dialog.waitlist
      : (buildings.value
          .flatMap((building) => building.kennels ?? [])
          .find((kennel) => kennel.id === kennelId)?.name ?? '')

  try {
    picked.kennelId = kennelId
    // Existing helper: booking-vs-daycare branching, mutation calls and the
    // optimistic local state update all live here (plan step 3 — reuse, not duplicate).
    await setPetKennel(picked)
    closePickerAndNotify(targetLabel, picked, previousKennelId)
  } catch (error) {
    // Roll the optimistic change back and keep the dialog open so the staff
    // member can retry instead of silently believing the pet moved.
    picked.kennelId = previousKennelId
    await executePets()
    Notify.create({
      message: lang.value.kennellayout.dialog.assignFailed,
      caption: error instanceof Error ? error.message : undefined,
      type: 'negative',
      timeout: 6000
    })
  } finally {
    assigning.value = false
  }
}

const closePickerAndNotify = (
  targetLabel: string,
  picked: PetKennel,
  previousKennelId: number | null
) => {
  pickerDialogRef.value?.functions.close()
  // No silent success: name the PET and the destination (a snackbar reading
  // just "Placed in 2" doesn't say which animal moved), and offer the one-tap
  // way back (ADR 005 removed drag, so a mis-tap is the likelier mistake).
  // The full last name is used here — the chip truncates it for width, but a
  // confirmation message has room and must not abbreviate the animal's name.
  const petLabel =
    `${picked.name ?? ''} ${picked.customer?.lastName ?? ''}`.trim()
  Notify.create({
    message: lang.value.kennellayout.dialog.assignDone
      .replace('{pet}', petLabel)
      .replace('{kennel}', targetLabel),
    color: 'positive',
    timeout: 6000,
    actions: [
      {
        label: lang.value.undo,
        color: 'white',
        handler: () => {
          picked.kennelId = previousKennelId
          setPetKennel(picked).catch(() => {
            executePets()
          })
        }
      }
    ]
  })
}

const getOverline = (pet: PetKennel) => {
  if (pet.arrivalTimeId)
    return `+ ${openingTimes.value?.find((openingTime) => openingTime.id === pet.arrivalTimeId)?.name}`

  if (pet.departureTimeId)
    return `- ${openingTimes.value?.find((openingTime) => openingTime.id === pet.departureTimeId)?.name}`

  return ''
}

const getPetChipClasses = (petKennel: PetKennel) => {
  if (petKennel.bookingId) {
    return 'bg-blue-2'
  } else if (petKennel.daycareDateId) {
    return 'bg-yellow-2'
  }
}

onMounted(async () => {
  await executeBuildings()
  await executePets()
})
</script>

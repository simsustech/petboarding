<template>
  <!-- id prefix `picker` is deliberate: the legacy sweep selectors in
       kennelLayout.spec.ts use [id^="kennel"] / [id^="pet"] and must never
       match dialog rows. -->
  <div id="pickerDialog">
    <q-list v-if="level === null">
      <q-item
        id="pickerWaitlist"
        ref="firstRowRef"
        clickable
        tabindex="0"
        :aria-label="`${lang.kennellayout.dialog.waitlist}, ${waitingCount}`"
        class="picker-row"
        @click="emit('select', null)"
        @keydown.enter="emit('select', null)"
        @keydown.space.prevent="emit('select', null)"
      >
        <q-item-section avatar>
          <!-- Standout: the waitlist is "no place yet", not a building —
               it gets a timer-sand pill on the secondary-container role
               (same token pair the nav rail's active indicator uses,
               NavigationTabs.vue) plus a live count, while buildings stay
               plain rows with a warehouse icon. -->
          <span class="picker-waitlist-pill flex items-center justify-center">
            <q-icon name="i-mdi-timer-sand" size="1.25em" />
          </span>
        </q-item-section>
        <q-item-section>{{ lang.kennellayout.dialog.waitlist }}</q-item-section>
        <q-item-section side>{{ waitingCount }}</q-item-section>
        <q-item-section v-if="isCurrent(null)" side>
          <q-icon name="i-mdi-check" color="positive" />
        </q-item-section>
      </q-item>
      <q-item
        v-for="building in buildings"
        :id="`pickerBuilding${building.id}`"
        :key="building.id"
        clickable
        tabindex="0"
        :aria-label="`${building.name}, ${building.kennels?.length ?? 0}`"
        class="picker-row"
        @click="openBuilding(building)"
        @keydown.enter="openBuilding(building)"
        @keydown.space.prevent="openBuilding(building)"
      >
        <q-item-section avatar>
          <q-icon name="i-mdi-warehouse" size="1.25em" />
        </q-item-section>
        <q-item-section>{{ building.name }}</q-item-section>
        <q-item-section side>
          <div class="row items-center q-gutter-xs">
            <span>{{ building.kennels?.length ?? 0 }}</span>
            <q-icon name="i-mdi-chevron-right" size="sm" />
          </div>
        </q-item-section>
      </q-item>
    </q-list>
    <q-list v-else>
      <div class="row items-center q-gutter-xs q-mb-sm">
        <q-btn
          ref="backRef"
          flat
          dense
          round
          icon="i-mdi-chevron-left"
          :aria-label="lang.kennellayout.dialog.back"
          @click="backToLevel1"
        />
        <span class="text-subtitle1">{{ selectedBuilding?.name }}</span>
        <!-- Availability at a glance: the whole reason the list is scanned is
             "which kennels are free", so the count leads the list. -->
        <span class="col" />
        <span id="pickerSummary" class="text-caption picker-muted">
          {{ freeSummaryText }}
        </span>
      </div>
      <div
        v-if="!(selectedBuilding?.kennels?.length ?? 0)"
        class="text-caption q-pa-md picker-muted"
      >
        {{ lang.kennellayout.dialog.noKennels }}
      </div>
      <div
        v-else
        id="pickerLegend"
        class="text-caption picker-muted q-px-md q-pb-sm"
      >
        {{ legendText }}
      </div>
      <q-item
        v-for="kennel in selectedBuilding?.kennels ?? []"
        :id="`pickerKennel${kennel.id}`"
        :key="kennel.id"
        clickable
        tabindex="0"
        :aria-label="kennelAriaLabel(kennel)"
        class="picker-row"
        @click="emit('select', kennel.id!)"
        @keydown.enter="emit('select', kennel.id!)"
        @keydown.space.prevent="emit('select', kennel.id!)"
      >
        <q-item-section>
          <!-- One line per row: kennel identity leads, state supports. An
               occupied row shows the occupant as a compact chip (same PetChip
               + colour system as the page); an empty row says Free. -->
          <div
            v-if="occupantsOf(kennel.id ?? null).length"
            class="row items-center q-gutter-sm no-wrap"
          >
            <q-item-label class="col-auto">{{ kennel.name }}</q-item-label>
            <pet-chip
              v-for="occupant in visibleOccupants(kennel.id ?? null)"
              :key="occupant.id"
              :model-value="occupant"
              :class="chipColor(occupant)"
              :overline="ratingOverline(occupant)"
              compact
              show-badge
              show-last-name
            />
            <span
              v-if="hiddenOccupantCount(kennel.id ?? null)"
              class="text-caption picker-muted col-auto"
            >
              {{ moreOccupantsText(kennel.id ?? null) }}
            </span>
          </div>
          <div v-else class="row items-center q-gutter-sm no-wrap">
            <q-item-label class="col-auto">{{ kennel.name }}</q-item-label>
            <q-item-label caption class="picker-muted col-auto">
              {{ lang.kennellayout.dialog.free }}
            </q-item-label>
          </div>
        </q-item-section>
        <q-item-section v-if="isCurrent(kennel.id ?? null)" side>
          <q-icon name="i-mdi-check" color="positive" />
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import type { Building } from '@petboarding/api/zod'
import type { PetKennel } from '../../configuration.js'
import PetChip from '../../components/pet/PetChip.vue'
import { useLang } from '../../lang/index.js'

export interface Props {
  petKennel: PetKennel
  buildings: Building[]
  petKennels: PetKennel[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'select', kennelId: number | null): void
}>()

const lang = useLang()

const level = ref<number | null>(null)
const backRef = ref<unknown>(null)
const firstRowRef = ref<unknown>(null)

const selectedBuilding = computed(
  () => props.buildings.find((building) => building.id === level.value) ?? null
)

// Skip the level-2 render's focus loss: when the level changes, focus must land
// inside the new view (the back control) instead of falling back to the page
// behind the modal — otherwise a keyboard user's next Tab starts outside the
// dialog. Same when returning to level 1 (focus the waitlist row).
// Refs hold DOM elements: calling focus() on a Quasar component instance does not
// proxy to the underlying element, so the ref callback resolves `$el` when the
// ref turns out to be a component instance.
const asElement = (target: unknown): HTMLElement | null => {
  const candidate = target as { $el?: unknown } | HTMLElement | null
  if (!candidate) return null
  const el = (candidate as { $el?: unknown }).$el ?? candidate
  return el instanceof HTMLElement ? el : null
}

const openBuilding = async (building: Building) => {
  level.value = building.id!
  await nextTick()
  asElement(backRef.value)?.focus()
}

const backToLevel1 = async () => {
  level.value = null
  await nextTick()
  asElement(firstRowRef.value)?.focus()
}

const isCurrent = (kennelId: number | null) =>
  props.petKennel.kennelId === kennelId

// How a kennel row is announced: name the kennel, then its state. Without this
// a screen reader lands on the occupant chip's raw text and never hears the
// words "kennel", "free", or that the kennel is already in use.
const kennelAriaLabel = (kennel: { id?: number | null; name?: string }) => {
  const occupants = occupantsOf(kennel.id ?? null)
  if (!occupants.length) {
    return `${kennel.name}: ${lang.value.kennellayout.dialog.free}`
  }
  const parts = occupants.map((occupant) => {
    const rating = ratingOf(occupant)
    return rating === null
      ? occupant.name
      : `${occupant.name}, ${ratingBand(rating)}`
  })
  return `${kennel.name}: ${parts.join('; ')}`
}

// Pets currently in a kennel from the picked pet's perspective: everyone in it
// except the picked pet itself (self-exclusion edge case).
const occupantsOf = (kennelId: number | null) =>
  props.petKennels.filter(
    (pet) => pet.kennelId === kennelId && pet.id !== props.petKennel.id
  )

// Row rhythm guard: a kennel holding many pets must not blow up the row.
// Show up to 2 chips, then a "+N" remainder.
const MAX_VISIBLE_OCCUPANTS = 2

const visibleOccupants = (kennelId: number | null) =>
  occupantsOf(kennelId).slice(0, MAX_VISIBLE_OCCUPANTS)

const hiddenOccupantCount = (kennelId: number | null) =>
  Math.max(0, occupantsOf(kennelId).length - MAX_VISIBLE_OCCUPANTS)

const moreOccupantsText = (kennelId: number | null) =>
  `${lang.value.kennellayout.dialog.moreOccupants.replace(
    '{n}',
    String(hiddenOccupantCount(kennelId))
  )}`

// "9 of 10 free" — kennel-count availability. Deliberately says nothing about
// how many pets each kennel holds: a kennel can take several, so "occupied"
// would both imply one pet and count the wrong unit.
const freeSummaryText = computed(() => {
  const kennels = props.buildings.flatMap((building) => building.kennels ?? [])
  const free = kennels.filter(
    (kennel) => occupantsOf(kennel.id ?? null).length === 0
  ).length
  return lang.value.kennellayout.dialog.freeSummary
    .replace('{free}', String(free))
    .replace('{total}', String(kennels.length))
})

// The band words are a code staff must learn; the legend teaches it in one line
// inside the dialog instead of relying on the page's legend behind the scrim.
const legendText = computed(() => {
  const bands = lang.value.kennellayout.dialog.ratingBands
  return lang.value.kennellayout.dialog.legend
    .replace('{poor}', bands.poor)
    .replace('{fair}', bands.fair)
    .replace('{ok}', bands.ok)
    .replace('{good}', bands.good)
    .replace('{great}', bands.great)
})

const waitingCount = computed(
  () => props.petKennels.filter((pet) => pet.kennelId === null).length
)

const ratingOf = (occupant: PetKennel) =>
  props.petKennel.relations?.[occupant.id]?.rating ?? null

// Rating → colour. These ten steps are documented tokens in DESIGN.md
// (`rating-1` … `rating-10`, "The Compatibility Scale Rule"); the class names here
// are the Tailwind steps those tokens record, verified against the generated CSS.
// Keep the two in step — the picker e2e asserts the class per rating.
const tintForRating = (rating: number) => {
  switch (rating) {
    case 1:
      return 'bg-red-600'
    case 2:
      return 'bg-red-500'
    case 3:
      return 'bg-orange-500'
    case 4:
      return 'bg-orange-400'
    case 5:
      return 'bg-yellow-500'
    case 6:
      return 'bg-yellow-400'
    case 7:
      return 'bg-lime-400'
    case 8:
      return 'bg-green-400'
    case 9:
      return 'bg-green-500'
    case 10:
      return 'bg-emerald-600'
    default:
      return undefined
  }
}

// Same colour system as the layout page (KennelLayout getPetChipClasses):
// the relation's rating colour when one exists, otherwise the page's
// booking/daycare base colour. Applied via :class — QBadge's ` color` prop
// prefixes `bg-` and turned "bg-orange-500" into the invalid
// "bg-bg-orange-500" (primary fallback), which is why chips, not badges.
const chipColor = (occupant: PetKennel) => {
  const rating = ratingOf(occupant)
  if (rating !== null) return tintForRating(rating)
  if (occupant.bookingId) return 'bg-blue-2'
  if (occupant.daycareDateId) return 'bg-yellow-2'
  return undefined
}

// Rating surfaced in the chip's overline as "3 · Fair" — a number alone means
// nothing without the scale, and colour alone excludes too much (colour, number
// and word together; the band words are explained by the dialog legend).
const ratingOverline = (occupant: PetKennel) => {
  const rating = ratingOf(occupant)
  if (rating === null) return ''
  return lang.value.kennellayout.dialog.rating
    .replace('{n}', String(rating))
    .replace('{band}', ratingBand(rating))
}

// 1-10 → five bands. Bands, not raw numbers, are what a glance can act on.
const ratingBand = (rating: number) => {
  const bands = lang.value.kennellayout.dialog.ratingBands
  if (rating <= 2) return bands.poor
  if (rating <= 4) return bands.fair
  if (rating <= 6) return bands.ok
  if (rating <= 8) return bands.good
  return bands.great
}
</script>

<style lang="sass">
// Focus must be visible on the picker's rows: Quasar's q-focus-helper renders at
// opacity 0 for these q-items, which left keyboard focus completely invisible
// (measured `outline: solid 0px`). Drawn from the primary token so it tracks the
// runtime theme instead of a hardcoded colour.
.picker-row:focus-visible
  outline: 2px solid var(--q-primary)
  outline-offset: -2px
  border-radius: 8px

// Muted text on the dialog's surfaces uses the MD3 on-surface-variant role
// (DESIGN.md: secondary text, overlines) rather than a raw Quasar grey — the
// neutral ramp carries a teal cast and switches with the theme.
.picker-muted
  color: var(--q-on-surface-variant)

.picker-waitlist-pill
  width: 32px
  height: 32px
  border-radius: 16px
  background-color: var(--light-secondary-container)
  color: var(--q-on-secondary-container)

.body--dark .picker-waitlist-pill
  background-color: var(--dark-secondary-container)
</style>

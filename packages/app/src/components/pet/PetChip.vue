<template>
  <q-chip
    :class="{
      'q-mb-md': $slots['bottom-badge']
    }"
    :style="{
      'max-width': '12em',
      height: '100%'
    }"
  >
    <div
      :style="{
        'white-space': 'normal !important'
      }"
    >
      {{ label }}
    </div>
    <q-icon
      v-if="showImage && modelValue.image"
      name="i-mdi-camera"
      flat
      round
      size="sm"
      @contextmenu.stop="(e) => e.preventDefault()"
      @touchstart.stop="(e) => e.preventDefault()"
    >
      <q-tooltip>
        <div class="column">
          <base64-image
            :style="{
              'min-width': '250px'
            }"
            :model-value="modelValue.image"
          />
        </div>
      </q-tooltip>
    </q-icon>
    <q-menu
      v-if="(onOpenPet && modelValue.id) || $slots['menu-items']"
      context-menu
    >
      <q-item clickable>
        <q-item-section @click="emit('openPet', modelValue.id)">
          {{ lang.pet.labels.open }}
        </q-item-section>
      </q-item>
      <slot name="menu-items"></slot>
    </q-menu>

    <q-badge
      v-if="showBadge || $slots['badge']"
      style="top: -10px"
      floating
      color="transparent"
    >
      <q-badge
        v-if="modelValue.food?.timesADay > 2"
        :style="{
          padding: '0px',
          'padding-left': '3px',
          'padding-right': '3px'
        }"
        :color="PET_CHIP_BADGE_COLORS.food"
        rounded
      >
        <q-icon
          class="q-ma-none q-pa-none"
          :name="PET_CHIP_BADGE_ICONS.food"
          size="0.8em"
        />
      </q-badge>
      <q-badge
        v-if="modelValue.medicines"
        :style="{
          padding: '0px',
          'padding-left': '3px',
          'padding-right': '3px'
        }"
        :color="PET_CHIP_BADGE_COLORS.medicines"
        rounded
      >
        <q-icon
          class="q-ma-none q-pa-none"
          :name="PET_CHIP_BADGE_ICONS.medicines"
          size="0.8em"
        />
      </q-badge>
      <q-badge
        v-if="!modelValue.hasMandatoryVaccinations"
        :style="{
          padding: '0px',
          'padding-left': '3px',
          'padding-right': '3px'
        }"
        :color="PET_CHIP_BADGE_COLORS.vaccinations"
        rounded
      >
        <q-icon
          class="q-ma-none q-pa-none"
          :name="PET_CHIP_BADGE_ICONS.vaccinations"
          size="0.8em"
        />
      </q-badge>
      <slot name="badge"></slot>
    </q-badge>

    <q-badge
      v-if="$slots['bottom-badge']"
      style="bottom: -115%"
      floating
      color="transparent"
    >
      <slot name="bottom-badge"></slot>
    </q-badge>
  </q-chip>
</template>

<script setup lang="ts">
import { Pet as PetType, Customer as CustomerType } from '@petboarding/api/zod'
import { useLang } from '../../lang/index.js'
import Base64Image from '../Base64Image.vue'
import { computed, toRefs } from 'vue'
import {
  PET_CHIP_BADGE_COLORS,
  PET_CHIP_BADGE_ICONS
} from 'src/configuration.js'

type Pet = Pick<
  PetType,
  'id' | 'name' | 'image' | 'hasMandatoryVaccinations' | 'medicines' | 'food'
> & {
  customer?: Pick<CustomerType, 'lastName'>
}

interface Props {
  modelValue: Pick<
    Pet,
    | 'id'
    | 'name'
    | 'customer'
    | 'image'
    | 'hasMandatoryVaccinations'
    | 'medicines'
    | 'food'
  >
  showImage?: boolean
  showLastName?: boolean
  onOpenPet?: unknown
  showBadge?: boolean
}

const props = defineProps<Props>()

const lang = useLang()

const emit = defineEmits<{
  (e: 'openPet', id: number): void
}>()

const { modelValue, showLastName } = toRefs(props)
const truncate = (str: string, n: number) =>
  str.length > n ? str.slice(0, n) + '...' : str

const truncateLastName = (lastName: string) => {
  const parts = lastName.split(' ')
  parts.splice(-1, 1, truncate(parts.at(-1) || '', 3))
  return parts.join(' ')
}

const label = computed(
  () =>
    `${modelValue.value.name} ${showLastName.value ? truncateLastName(modelValue.value.customer?.lastName || '') : ''}`
)
</script>

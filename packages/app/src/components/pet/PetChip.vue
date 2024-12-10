<template>
  <q-chip>
    {{
      `${modelValue.name} ${truncateLastName(modelValue.customer?.lastName || '')}`
    }}
    <q-icon
      v-if="showImage && modelValue.image"
      name="photo_camera"
      flat
      round
      size="sm"
      @contextmenu.stop="(e) => e.preventDefault()"
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
    <q-menu v-if="onOpenPet && modelValue.id" context-menu>
      <q-item clickable>
        <q-item-section @click="emit('openPet', modelValue.id)">
          {{ lang.pet.labels.open }}
        </q-item-section>
      </q-item>
    </q-menu>
  </q-chip>
</template>

<script setup lang="ts">
import { Pet as PetType, Customer as CustomerType } from '@petboarding/api/zod'
import { useLang } from '../../lang/index.js'
import Base64Image from '../Base64Image.vue'

type Pet = Pick<PetType, 'id' | 'name' | 'image'> & {
  customer: Pick<CustomerType, 'lastName'>
}

interface Props {
  modelValue: Pick<Pet, 'id' | 'name' | 'customer' | 'image'>
  showImage?: boolean
  onOpenPet?: unknown
}

defineProps<Props>()

const lang = useLang()

const emit = defineEmits<{
  (e: 'openPet', id: number): void
}>()

const truncate = (str: string, n: number) =>
  str.length > n ? str.slice(0, n) + '...' : str

const truncateLastName = (lastName: string) => {
  const parts = lastName.split(' ')
  parts.splice(-1, 1, truncate(parts.at(-1) || '', 3))
  return parts.join(' ')
}
</script>

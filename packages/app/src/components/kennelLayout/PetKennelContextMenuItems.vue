<template>
  <q-item v-for="building in buildings" :key="building.id" clickable>
    <q-item-section>
      <q-item-label>
        {{ building.name }}
      </q-item-label>
    </q-item-section>
    <q-item-section side>
      <q-icon name="i-mdi-chevron-right" />
    </q-item-section>
    <q-menu anchor="top end" self="top start">
      <q-list>
        <q-item
          v-for="kennel in building.kennels"
          :key="kennel.id"
          clickable
          @click="emit('setPetKennel', { ...petKennel, kennelId: kennel.id! })"
        >
          {{ kennel.name }}
        </q-item>
      </q-list>
    </q-menu>
  </q-item>
</template>

<script setup lang="ts">
import type { Building } from '@petboarding/api/zod'
import type { PetKennel } from '../../configuration.js'

export interface Props {
  petKennel: PetKennel
  buildings: Building[]
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'setPetKennel', petKennel: PetKennel): void
}>()
</script>

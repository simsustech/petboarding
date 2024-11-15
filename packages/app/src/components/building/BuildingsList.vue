<template>
  <q-list>
    <q-item-label header>
      {{ lang.building.title }}
    </q-item-label>
    <q-item v-for="(building, index) in modelValue" :key="index">
      <q-item-section>
        <q-item-label overline>
          {{ building.location }}
        </q-item-label>
        <q-item-label>
          {{ building.name }}
        </q-item-label>
        <q-item-label caption>
          {{ building.description }}
        </q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-btn
          v-if="showEditButton"
          icon="edit"
          @click="emit('update', { data: building })"
        />
        <q-btn
          v-if="showDeleteButton"
          icon="delete"
          color="red"
          @click="emit('delete', { data: building })"
        />
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script lang="ts">
export default {
  name: 'BuildingsList'
}
</script>

<script setup lang="ts">
import { useLang } from '../../lang/index.js'
import { type Building } from '@petboarding/api/zod'

export interface Props {
  modelValue: Building[]
  showEditButton?: boolean
  showDeleteButton?: boolean
}
defineProps<Props>()

const emit = defineEmits<{
  (
    e: 'update',
    {
      data,
      done
    }: {
      data: Building
      done?: (success?: boolean) => void
    }
  ): void
  (
    e: 'delete',
    {
      data,
      done
    }: {
      data: Building
      done?: (success?: boolean) => void
    }
  ): void
}>()

const lang = useLang()
</script>

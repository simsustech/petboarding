<template>
  <q-list>
    <q-item-label header>
      {{ lang.kennel.title }}
    </q-item-label>
    <q-item v-for="(kennel, index) in modelValue" :key="index">
      <q-item-section>
        <q-item-label overline>
          {{ kennel.building.name }}
        </q-item-label>
        <q-item-label>
          {{ kennel.name }}
        </q-item-label>
        <q-item-label caption>
          {{ kennel.description }}
        </q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-btn
          v-if="showEditButton"
          icon="i-mdi-edit"
          @click="emit('update', { data: kennel })"
        />
        <q-btn
          v-if="showDeleteButton"
          icon="i-mdi-delete"
          color="red"
          @click="emit('delete', { data: kennel })"
        />
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script lang="ts">
export default {
  name: 'KennelsList'
}
</script>

<script setup lang="ts">
import { useLang } from '../../lang/index.js'
import { type Kennel } from '@petboarding/api/zod'

export interface Props {
  modelValue: Kennel[]
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
      data: Kennel
      done?: (success?: boolean) => void
    }
  ): void
  (
    e: 'delete',
    {
      data,
      done
    }: {
      data: Kennel
      done?: (success?: boolean) => void
    }
  ): void
}>()

const lang = useLang()
</script>

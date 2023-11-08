<template>
  <q-list>
    <q-item
      v-for="openingTime in modelValue"
      :key="openingTime.id"
      :class="{ 'bg-grey-3': openingTime.disabled }"
    >
      <q-item-section>
        <q-item-label>
          {{ openingTime.name }}
        </q-item-label>
        <q-item-label caption>
          {{ `${openingTime.startTime} - ${openingTime.endTime}` }}
        </q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-btn
          v-if="showEditButton"
          icon="edit"
          @click="emit('update', { data: openingTime })"
        />
        <q-btn
          v-if="showDeleteButton"
          icon="delete"
          color="red"
          @click="emit('delete', { data: openingTime })"
        />
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script lang="ts">
export default {
  name: 'OpeningTimesList'
}
</script>

<script setup lang="ts">
import { ref } from 'vue'
import type { OpeningTime } from '@petboarding/api/zod'

export interface Props {
  modelValue: OpeningTime[]
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
      data: OpeningTime
      done?: (success?: boolean) => void
    }
  ): void
  (
    e: 'delete',
    {
      data,
      done
    }: {
      data: OpeningTime
      done?: (success?: boolean) => void
    }
  ): void
}>()

const variables = ref({
  // header: lang.value.some.nested.prop
})
const functions = ref({
  // submit
})
defineExpose({
  variables,
  functions
})
</script>

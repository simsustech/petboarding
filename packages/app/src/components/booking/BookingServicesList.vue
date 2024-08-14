<template>
  <q-list>
    <q-item v-for="service in modelValue" :key="service.id">
      <q-item-section>
        <q-item-label>
          {{ service.service?.name }}
        </q-item-label>
        <q-item-label caption>
          {{ service.comments }}
        </q-item-label>
      </q-item-section>
      <q-item-section side>
        <price
          :model-value="service.listPrice"
          :currency="configuration.CURRENCY"
        />
        <q-btn
          v-if="showEditButton"
          icon="edit"
          @click="emit('edit', { data: service })"
        />
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script lang="ts">
export default {
  name: 'BookingServicesList'
}
</script>

<script setup lang="ts">
import { BookingService } from '@petboarding/api/zod'
import Price from '../Price.vue'
import { useConfiguration } from '../../configuration.js'

export interface Props {
  modelValue: BookingService[]
  showEditButton?: boolean
}
defineProps<Props>()

const emit = defineEmits<{
  (
    e: 'edit',
    {
      data,
      done
    }: {
      data: BookingService
      done?: (success?: boolean) => void
    }
  ): void
}>()

const configuration = useConfiguration()
</script>

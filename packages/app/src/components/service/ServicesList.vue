<template>
  <q-list>
    <q-item v-for="service in modelValue" :key="service.id">
      <q-item-section>
        <q-item-label overline>
          {{ service.name }}
        </q-item-label>
        <q-item-label>
          {{ service.description }}
        </q-item-label>
        <q-item-label caption>
          <price
            :model-value="service.listPrice"
            :currency="configuration.CURRENCY"
          />
        </q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-btn
          v-if="showEditButton"
          icon="i-mdi-edit"
          data-testid="edit-button"
          @click="emit('update', { data: service })"
        />
        <q-btn
          v-if="showDeleteButton"
          icon="i-mdi-delete"
          color="red"
          data-testid="delete-button"
          @click="emit('delete', { data: service })"
        />
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script lang="ts">
export default {
  name: 'ServicesList'
}
</script>

<script setup lang="ts">
import { ref } from 'vue'
import Price from '../Price.vue'
import { useConfiguration } from '../../configuration.js'
import type { Service } from '@petboarding/api/zod'

export interface Props {
  modelValue: Service[]
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
      data: Service
      done?: (success?: boolean) => void
    }
  ): void
  (
    e: 'delete',
    {
      data,
      done
    }: {
      data: Service
      done?: (success?: boolean) => void
    }
  ): void
}>()

const configuration = useConfiguration()

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

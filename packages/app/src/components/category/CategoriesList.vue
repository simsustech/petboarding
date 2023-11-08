<template>
  <q-list>
    <q-item v-for="category in modelValue" :key="category.id">
      <q-item-section>
        <q-item-label>
          {{ category.name }}
        </q-item-label>
        <q-item-label caption>
          <price :model-value="category.price" />
        </q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-btn
          v-if="showEditButton"
          icon="edit"
          @click="emit('update', { data: category })"
        />
        <q-btn
          icon="delete"
          color="red"
          @click="emit('delete', { data: category })"
        />
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script lang="ts">
export default {
  name: 'CategoriesList'
}
</script>

<script setup lang="ts">
import { ref } from 'vue'
import Price from '../Price.vue'
import type { Category } from '@petboarding/api/zod'

export interface Props {
  modelValue: Category[]
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
      data: Category
      done?: (success?: boolean) => void
    }
  ): void
  (
    e: 'delete',
    {
      data,
      done
    }: {
      data: Category
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

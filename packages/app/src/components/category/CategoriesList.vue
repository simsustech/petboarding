<template>
  <q-list>
    <q-expansion-item v-for="category in modelValue" :key="category.id">
      <template #header>
        <q-item-section>
          <q-item-label>
            {{ category.name }}
          </q-item-label>
          <!-- <q-item-label caption>
          <price
            :model-value="category.price"
            :currency="configuration.CURRENCY"
          />
        </q-item-label> -->
        </q-item-section>
        <q-item-section side>
          <q-btn flat icon="i-mdi-more-vert" data-testid="item-menu-button">
            <q-menu>
              <q-list>
                <q-item
                  v-if="showEditButton"
                  v-close-popup
                  clickable
                  data-testid="edit-button"
                  @click="emit('update', { data: category })"
                >
                  <q-item-section>
                    <q-item-label>
                      {{ lang.update }}
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item
                  v-close-popup
                  clickable
                  @click="emit('addPrice', { data: category })"
                >
                  <q-item-section>
                    <q-item-label>
                      {{ lang.categoryPrice.labels.addPrice }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item
                  v-if="showDeleteButton"
                  v-close-popup
                  clickable
                  data-testid="delete-button"
                  @click="emit('delete', { data: category })"
                >
                  <q-item-section>
                    <q-item-label class="text-red">
                      {{ lang.delete }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </q-item-section>
      </template>
      <q-item
        v-for="price in category.prices"
        :key="price.date"
        :inset-level="1"
      >
        <q-item-section>
          <q-item-label overline>
            {{ price.date }}
          </q-item-label>
          <q-item-label>
            <price
              :model-value="price.listPrice"
              :currency="configuration.CURRENCY"
            />
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn
            icon="i-mdi-delete"
            color="red"
            @click="emit('deletePrice', { data: price })"
          />
        </q-item-section>
      </q-item>
    </q-expansion-item>
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
import { useConfiguration } from '../../configuration.js'
import type { Category } from '@petboarding/api/zod'
import { useLang } from '../../lang/index.js'

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
  (
    e: 'addPrice',
    {
      data,
      done
    }: {
      data: Category
      done?: (success?: boolean) => void
    }
  ): void
  (
    e: 'deletePrice',
    {
      data,
      done
    }: {
      data: { id: number; date: string; listPrice: number }
      done?: (success?: boolean) => void
    }
  ): void
}>()

const configuration = useConfiguration()
const lang = useLang()

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

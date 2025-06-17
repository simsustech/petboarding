<template>
  <q-list>
    <q-item v-for="service in modelValue" :key="service.id">
      <q-item-section>
        <q-item-label>
          <price
            :model-value="service.listPrice"
            :currency="configuration.CURRENCY"
          />
        </q-item-label>
        <q-item-label>
          {{ service.service?.name }}
        </q-item-label>
        <q-item-label caption>
          {{ service.comments }}
        </q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-btn flat icon="i-mdi-more-vert">
          <q-menu>
            <q-list>
              <q-item
                v-if="showEditButton"
                v-close-popup
                clickable
                data-testid="edit-button"
                @click="emit('update', { data: service })"
              >
                <q-item-section>
                  <q-item-label>
                    {{ lang.update }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
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
import { useLang } from '../../lang/index.js'

export interface Props {
  modelValue: BookingService[]
  showEditButton?: boolean
}
defineProps<Props>()

const emit = defineEmits<{
  (
    e: 'update',
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
const lang = useLang()
</script>

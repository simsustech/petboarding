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
          v-if="showEditButton || showDeleteButton"
          icon="i-mdi-more-vert"
          flat
        >
          <q-menu>
            <q-list>
              <q-item
                v-if="showEditButton"
                v-close-popup
                clickable
                data-testid="edit-button"
                @click="emit('update', { data: kennel })"
              >
                <q-item-section>
                  <q-item-label>
                    {{ lang.update }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item
                v-if="showDeleteButton"
                v-close-popup
                clickable
                data-testid="delete-button"
                @click="emit('delete', { data: kennel })"
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
        <!-- <q-btn
          v-if="showEditButton" v-close-popup
          icon="i-mdi-edit"
          data-testid="edit-button"
          @click="emit('update', { data: kennel })"
        />
        <q-btn
          v-if="showDeleteButton" v-close-popup
          icon="i-mdi-delete"
          color="red"
          data-testid="delete-button"
          @click="emit('delete', { data: kennel })"
        /> -->
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

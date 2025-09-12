<template>
  <q-list>
    <q-item-label header>
      {{ lang.announcement.title }}
    </q-item-label>
    <q-item v-for="(announcement, index) in modelValue" :key="index">
      <q-item-section avatar>
        <q-icon
          :name="icon[announcement.type]"
          :color="iconColor[announcement.type]"
        />
      </q-item-section>
      <q-item-section>
        <q-item-label overline>
          {{ announcement.title }}
        </q-item-label>
        <q-item-label>
          {{ announcement.message }}
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
                @click="emit('update', { data: announcement })"
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
                @click="emit('delete', { data: announcement })"
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
          @click="emit('update', { data: announcement })"
        />
        <q-btn
          v-if="showDeleteButton" v-close-popup
          icon="i-mdi-delete"
          color="red"
          data-testid="delete-button"
          @click="emit('delete', { data: announcement })"
        /> -->
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script lang="ts">
export default {
  name: 'AnnouncementsList'
}
</script>

<script setup lang="ts">
import { useLang } from '../../lang/index.js'

export interface Announcement {
  title: string
  message: string
  type: 'general' | 'important' | 'priority'
}

export interface Props {
  modelValue: Announcement[]
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
      data: Announcement
      done?: (success?: boolean) => void
    }
  ): void
  (
    e: 'delete',
    {
      data,
      done
    }: {
      data: Announcement
      done?: (success?: boolean) => void
    }
  ): void
}>()

const lang = useLang()

const icon = {
  general: 'i-mdi-info',
  important: 'i-mdi-warning',
  priority: 'i-mdi-exclamation-thick',
  urgent: 'i-mdi-alert'
}
const iconColor = {
  general: 'blue',
  important: 'yellow',
  priority: 'red',
  urgent: 'red'
}
</script>

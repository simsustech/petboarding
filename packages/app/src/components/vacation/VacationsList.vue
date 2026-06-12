<template>
  <q-list>
    <q-item-label header>
      {{ lang.vacation.title }}
    </q-item-label>
    <q-item v-for="vacation in modelValue" :key="vacation.id">
      <q-item-section avatar>
        <q-icon name="i-mdi-beach" color="primary" />
      </q-item-section>
      <q-item-section>
        <q-item-label>
          {{ vacation.name }}
        </q-item-label>
        <q-item-label caption>
          {{
            `${formatDate(vacation.startDate)} - ${formatDate(vacation.endDate)}`
          }}
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
                @click="emit('update', { data: vacation })"
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
                @click="emit('delete', { data: vacation })"
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
    </q-item>
  </q-list>
</template>

<script lang="ts">
export default {
  name: 'VacationsList'
}
</script>

<script setup lang="ts">
import { ref } from 'vue'
import { useLang } from '../../lang/index.js'
import { useQuasar } from 'quasar'

export interface Vacation {
  id: number
  name: string
  startDate: string
  endDate: string
  surchargePerDay: number
}

export interface Props {
  modelValue: Vacation[]
  showEditButton?: boolean
  showDeleteButton?: boolean
}
defineProps<Props>()

const $q = useQuasar()
const emit = defineEmits<{
  (
    e: 'update',
    {
      data,
      done
    }: {
      data: Vacation
      done?: (success?: boolean) => void
    }
  ): void
  (
    e: 'delete',
    {
      data,
      done
    }: {
      data: Vacation
      done?: (success?: boolean) => void
    }
  ): void
}>()

const lang = useLang()

const dateFormatter = (date: Date, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    dateStyle: 'long',
    timeZone: 'UTC'
  }).format(date)
const formatDate = (date: string | null) => {
  if (date) return dateFormatter(new Date(date), $q.lang.isoName)
  return '-'
}

const variables = ref({})
const functions = ref({})
defineExpose({
  variables,
  functions
})
</script>

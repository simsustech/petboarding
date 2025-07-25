<template>
  <q-list>
    <q-item-label header>
      {{ lang.period.title }}
    </q-item-label>
    <q-item v-for="period in modelValue" :key="period.id">
      <q-item-section avatar>
        <q-icon name="i-mdi-block" color="red"></q-icon
      ></q-item-section>
      <q-item-section>
        <q-item-label overline>
          {{ lang.period.type[period.type] }}
        </q-item-label>
        <q-item-label>
          {{
            `${formatDate(period.startDate)} - ${formatDate(period.endDate)}`
          }}
        </q-item-label>
        <q-item-label caption>
          {{ period.comments }}
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
                @click="emit('update', { data: period })"
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
                @click="emit('delete', { data: period })"
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
          @click="emit('update', { data: period })"
        />
        <q-btn
          v-if="showDeleteButton" v-close-popup
          icon="i-mdi-delete"
          color="red"
          data-testid="delete-button"
          @click="emit('delete', { data: period })"
        /> -->
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script lang="ts">
export default {
  name: 'PeriodsList'
}
</script>

<script setup lang="ts">
import { ref } from 'vue'
import { useLang } from '../../lang/index.js'
import { useQuasar } from 'quasar'
import type { PERIOD_TYPE } from '@petboarding/api/zod'
export interface Period {
  startDate: string
  endDate: string
  type: PERIOD_TYPE
  comments: string
}

export interface Props {
  modelValue: Period[]
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
      data: Period
      done?: (success?: boolean) => void
    }
  ): void
  (
    e: 'delete',
    {
      data,
      done
    }: {
      data: Period
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

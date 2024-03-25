<template>
  <q-list>
    <q-item-label header>
      {{ lang.period.title }}
    </q-item-label>
    <q-item v-for="period in modelValue" :key="period.id">
      <q-item-section avatar>
        <q-icon name="block" color="red"></q-icon
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
          v-if="showEditButton"
          icon="edit"
          @click="emit('update', { data: period })"
        />
        <q-btn
          v-if="showDeleteButton"
          icon="delete"
          color="red"
          @click="emit('delete', { data: period })"
        />
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

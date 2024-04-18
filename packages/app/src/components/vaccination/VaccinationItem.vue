<template>
  <q-item>
    <q-item-section avatar>
      <image-avatar :model-value="modelValue.image" />
    </q-item-section>
    <q-item-section>
      <q-item-label overline>
        <q-badge v-if="hasExpired" color="red">
          <q-icon name="warning" /> {{ lang.pet.vaccination.expired }}</q-badge
        >
      </q-item-label>
      <q-item-label>
        {{ vaccinationsLabel }}
      </q-item-label>
      <q-item-label v-if="!hideExpirationDate" caption>{{
        formatDate(modelValue.expirationDate)
      }}</q-item-label>
    </q-item-section>
    <q-item-section side>
      <q-btn
        v-if="showEditButton"
        icon="edit"
        flat
        rounded
        @click="updateVaccination"
      />
    </q-item-section>
  </q-item>
</template>

<script lang="ts">
export default {
  name: 'VaccinationItem'
}
</script>

<script setup lang="ts">
import { computed, toRefs } from 'vue'
import { date as dateUtil, useQuasar } from 'quasar'
import { useLang } from '../../lang/index.js'
import { Vaccination as VaccinationType } from '@petboarding/api/zod'
import ImageAvatar from '../ImageAvatar.vue'

export interface Vaccination extends VaccinationType {
  image?: string
}

export interface Props {
  modelValue: Vaccination
  hideExpirationDate?: boolean
  showEditButton?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update', vaccination: Vaccination): void
}>()

const lang = useLang()
const $q = useQuasar()

const { modelValue } = toRefs(props)

const dateFormatter = (date: Date, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    dateStyle: 'long',
    timeZone: 'UTC'
  }).format(date)
const formatDate = (date: string | null) => {
  if (date) return dateFormatter(new Date(date), $q.lang.isoName)
  return '-'
}

const hasExpired = computed(() => {
  const currentDate = dateUtil.formatDate(new Date(), 'YYYY-MM-DD')
  return modelValue.value.expirationDate < currentDate
})

const vaccinationsLabel = computed(() => {
  return modelValue.value.types
    .map((vaccination) => lang.value.pet.vaccination.types[vaccination])
    .join(', ')
})

const updateVaccination = () => emit('update', modelValue.value)
</script>

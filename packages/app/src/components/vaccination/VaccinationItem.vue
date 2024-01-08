<template>
  <q-item>
    <q-item-section side>
      <image-avatar :model-value="modelValue.image" />
    </q-item-section>
    <q-item-section>
      <q-item-label overline>
        <q-badge color="red" v-if="hasExpired">
          <q-icon name="warning" /> {{ lang.pet.vaccination.expired }}</q-badge
        >
      </q-item-label>
      <q-item-label>
        {{ vaccinationsLabel }}
      </q-item-label>
      <q-item-label caption>{{
        formatDate(modelValue.expirationDate)
      }}</q-item-label>
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
import { date as dateUtil } from 'quasar'
import { useLang } from '../../lang/index.js'
import { Vaccination as VaccinationType } from '@petboarding/api/zod'
import ImageAvatar from '../ImageAvatar.vue'

export interface Vaccination extends VaccinationType {
  image?: string
}

export interface Props {
  modelValue: Vaccination
}

const props = defineProps<Props>()

const lang = useLang()

const { modelValue } = toRefs(props)
const formatDate = (date: string | null) => {
  if (date) return dateUtil.formatDate(new Date(date), 'DD MMM YYYY')
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
</script>

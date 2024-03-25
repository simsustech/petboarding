<template>
  <q-item>
    <q-item-section>
      <q-item-label overline>
        {{ lang.booking.status[modelValue.status] }}
      </q-item-label>
      <q-item-label v-if="modelValue.startTime && modelValue.endTime">
        {{
          formatDates(
            modelValue.startDate,
            modelValue.startTime!.name,
            modelValue.endDate,
            modelValue.endTime!.name
          )
        }}
        -
        <a class="text-italic">
          {{ `${modelValue.days} ${lang.booking.days}` }}
        </a>
        -
        <a v-if="petNames" class="text-italic">
          {{ petNames.join(',') }}
        </a>
        -
        <a v-if="modelValue.comments" class="text-italic">
          {{ modelValue.comments }}
        </a>
        <q-item-label caption>
          {{ formatDate(modelValue.modifiedAt) }}
        </q-item-label>
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script lang="ts">
export default {
  name: 'BookingStatusItem'
}
</script>

<script setup lang="ts">
import { date as dateUtil } from 'quasar'
import { useLang } from '..//../lang/index.js'
import { BookingStatus, Pet } from '@petboarding/api/zod'
import { computed } from 'vue'
import { toRefs } from 'vue'
import { formatBookingDates } from './BookingItemContent.vue'
import { useQuasar } from 'quasar'

export interface Props {
  modelValue: BookingStatus
  pets?: Pet[]
}
const props = defineProps<Props>()

const lang = useLang()
const $q = useQuasar()

const { modelValue, pets } = toRefs(props)
const formatDates = (
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string
) => {
  return formatBookingDates({
    startDate,
    startTime,
    endDate,
    endTime,
    lang: lang.value,
    locale: $q.lang.isoName
  })
}

const petNames = computed(() => {
  let names: string[] = []
  if (pets?.value) {
    names = pets.value
      .filter((pet) => modelValue.value.petIds.includes(pet.id))
      .map((pet) => pet.name)
  }
  return names
})

const formatDate = (date: string | null) => {
  if (date) return dateUtil.formatDate(new Date(date), 'DD MMM YYYY HH:mm')
  return '-'
}
</script>

<template>
  <q-page padding>
    <div class="row">
      <availability-card v-if="periods" :periods="periods" />
    </div>
  </q-page>
</template>

<scirpt lang="ts">
export default {
  name: 'AvailabilityPage'
}
</scirpt>

<script setup lang="ts">
import { onMounted } from 'vue'
import AvailabilityCard from '../components/AvailabilityCard.vue'
import { usePublicGetPeriodsQuery } from 'src/queries/public.js'

const { periods, refetch: executePeriods } = usePublicGetPeriodsQuery()

onMounted(async () => {
  executePeriods()
})
</script>

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
import { createUseTrpc } from '../trpc.js'
import { onMounted } from 'vue'
import AvailabilityCard from '../components/AvailabilityCard.vue'
const { useQuery } = await createUseTrpc()

const { data: periods, execute: executePeriods } = useQuery('public.getPeriods')

onMounted(async () => {
  executePeriods()
})
</script>

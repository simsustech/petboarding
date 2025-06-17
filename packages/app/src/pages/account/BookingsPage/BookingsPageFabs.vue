<template>
  <navigation-rail-fabs
    v-if="pets?.length"
    :bus-emits="busEmits"
    :icons="icons"
    type="add"
  />
</template>

<script lang="ts" setup>
import { NavigationRailFabs } from '@simsustech/quasar-components/md3'
import { onMounted, ref } from 'vue'
import { createUseTrpc } from '../../../trpc.js'
const { useQuery } = await createUseTrpc()

const busEmits = ref({
  add: 'account-open-bookings-create-dialog'
})

const icons = ref({
  add: 'i-mdi-add',
  edit: 'i-mdi-edit'
})

const { data: pets, execute: executePets } = useQuery('user.getPets', {
  // immediate: true
})

onMounted(async () => {
  await executePets()
})
</script>

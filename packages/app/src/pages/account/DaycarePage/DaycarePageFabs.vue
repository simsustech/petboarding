<template>
  <navigation-rail-fabs
    v-if="pets"
    :bus-emits="busEmits"
    :icons="icons"
    type="add"
    :seek-attention="!daycareDates?.length"
  />
</template>

<script lang="ts" setup>
import { NavigationRailFabs } from '@simsustech/quasar-components/md3'
import { onMounted, ref } from 'vue'
import { useAccountGetPetsQuery } from 'src/queries/account/pet.js'
import { useAccountGetDaycareDatesQuery } from 'src/queries/account/daycare.js'

const busEmits = ref({
  add: 'account-open-daycare-create-dialog'
})

const icons = ref({
  add: 'i-mdi-add',
  edit: 'i-mdi-edit'
})

const { pets, refetch: executePets } = useAccountGetPetsQuery()
const { data: daycareDates, refetch: executeDaycareDates } =
  useAccountGetDaycareDatesQuery()

onMounted(async () => {
  await executePets()
  await executeDaycareDates()
})
</script>

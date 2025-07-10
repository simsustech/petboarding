<template>
  <navigation-rail-fabs
    v-if="pets"
    :bus-emits="busEmits"
    :icons="icons"
    type="add"
  />
</template>

<script lang="ts" setup>
import { NavigationRailFabs } from '@simsustech/quasar-components/md3'
import { onMounted, ref } from 'vue'
import { useAccountGetPetsQuery } from 'src/queries/account/pet.js'

const busEmits = ref({
  add: 'account-open-daycare-create-dialog'
})

const icons = ref({
  add: 'i-mdi-add',
  edit: 'i-mdi-edit'
})

const { pets, refetch: executePets } = useAccountGetPetsQuery()

onMounted(async () => {
  await executePets()
})
</script>

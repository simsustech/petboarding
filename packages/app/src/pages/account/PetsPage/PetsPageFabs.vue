<template>
  <navigation-rail-fabs
    v-if="contactPeople?.length"
    :bus-emits="busEmits"
    :icons="icons"
    type="add"
    :seek-attention="!pets?.length"
  />
</template>

<script lang="ts" setup>
import { NavigationRailFabs } from '@simsustech/quasar-components/md3'
import { useAccountGetContactPeopleQuery } from 'src/queries/account/contactperson'
import { useAccountGetPetsQuery } from 'src/queries/account/pet.js'
import { onMounted, ref } from 'vue'
const busEmits = ref({
  add: 'account-open-pets-create-dialog'
})

const icons = ref({
  add: 'i-mdi-add',
  edit: 'i-mdi-edit'
})

const { contactPeople, refetch: executeContactPeople } =
  useAccountGetContactPeopleQuery()
const { pets, refetch: executePets } = useAccountGetPetsQuery()

onMounted(async () => {
  await executeContactPeople()
  await executePets()
})
</script>

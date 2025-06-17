<template>
  <navigation-rail-fabs
    v-if="contactPeople?.length"
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
  add: 'account-open-pets-create-dialog'
})

const icons = ref({
  add: 'i-mdi-add',
  edit: 'i-mdi-edit'
})

const { data: contactPeople, execute: executeContactPeople } = useQuery(
  'user.getContactPeople',
  {
    // immediate: true
  }
)

onMounted(async () => {
  await executeContactPeople()
})
</script>

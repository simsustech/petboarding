<template>
  <navigation-rail-fabs
    v-if="customer"
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
  add: 'account-open-contact-people-create-dialog'
})

const icons = ref({
  add: 'i-mdi-add',
  edit: 'i-mdi-edit'
})

const { data: customer, execute: executeCustomer } = useQuery(
  'user.getCustomer',
  {
    // immediate: true
  }
)

onMounted(async () => {
  await executeCustomer()
})
</script>

<template>
  <navigation-rail-fabs
    :bus-emits="busEmits"
    :icons="icons"
    :type="customerData ? 'edit' : 'add'"
  />
</template>

<script lang="ts" setup>
import { NavigationRailFabs } from '@simsustech/quasar-components/md3'
import { ref } from 'vue'
import { createUseTrpc } from '../../../trpc.js'
const { useQuery } = await createUseTrpc()

const busEmits = ref({
  add: 'account-open-customer-create-dialog',
  edit: 'account-open-customer-update-dialog'
})

const icons = ref({
  add: 'i-mdi-add',
  edit: 'i-mdi-edit'
})

const { data: customerData } = useQuery('user.getCustomer', {
  immediate: true
})
</script>

<template>
  <navigation-rail-fabs
    :bus-emits="busEmits"
    :icons="icons"
    :type="customer ? 'edit' : 'add'"
    :seek-attention="!customer"
  />
</template>

<script lang="ts" setup>
import { NavigationRailFabs } from '@simsustech/quasar-components/md3'
import { ref, inject } from 'vue'
import { createUseTrpc } from '../../../trpc.js'
import { EventBus } from 'quasar'

const bus = inject<EventBus>('bus')!
bus.on('account-get-customer', () => {
  executeGetCustomer()
})

const { useQuery } = await createUseTrpc()

const busEmits = ref({
  add: 'account-open-customer-create-dialog',
  edit: 'account-open-customer-update-dialog'
})

const icons = ref({
  add: 'i-mdi-add',
  edit: 'i-mdi-edit'
})

const { data: customer, execute: executeGetCustomer } = useQuery(
  'user.getCustomer',
  {
    immediate: true
  }
)
</script>

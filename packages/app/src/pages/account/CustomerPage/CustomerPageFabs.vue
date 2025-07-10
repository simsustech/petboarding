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
import { EventBus } from 'quasar'
import { useAccountGetCustomerQuery } from 'src/queries/account/customer.js'

const bus = inject<EventBus>('bus')!
bus.on('account-get-customer', () => {
  executeCustomer()
})

const busEmits = ref({
  add: 'account-open-customer-create-dialog',
  edit: 'account-open-customer-update-dialog'
})

const icons = ref({
  add: 'i-mdi-add',
  edit: 'i-mdi-edit'
})

const { customer, refetch: executeCustomer } = useAccountGetCustomerQuery()
</script>

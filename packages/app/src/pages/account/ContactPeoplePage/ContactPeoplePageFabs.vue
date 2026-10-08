<template>
  <navigation-rail-fabs
    v-if="customer"
    :bus-emits="busEmits"
    :icons="icons"
    type="add"
    :seek-attention="!contactPeople?.length"
  />
</template>

<script lang="ts" setup>
import { NavigationRailFabs } from '@simsustech/quasar-components/md3'
import { useAccountGetCustomerQuery } from 'src/queries/account/customer'
import { useAccountGetContactPeopleQuery } from 'src/queries/account/contactperson'
import { onMounted, ref } from 'vue'

const busEmits = ref({
  add: 'account-open-contact-people-create-dialog'
})

const icons = ref({
  add: 'i-mdi-add',
  edit: 'i-mdi-edit'
})

const { customer, refetch: executeCustomer } = useAccountGetCustomerQuery()
const { contactPeople, refetch: executeContactPeople } =
  useAccountGetContactPeopleQuery()

onMounted(async () => {
  await executeCustomer()
  await executeContactPeople()
})
</script>

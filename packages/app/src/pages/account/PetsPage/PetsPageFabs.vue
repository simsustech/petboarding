<template>
  <navigation-rail-fabs :bus-emits="busEmits" :icons="icons" type="add" />
</template>

<script lang="ts" setup>
import { NavigationRailFabs } from '@simsustech/quasar-components'
import { ref } from 'vue'

const busEmits = ref({
  add: 'account-open-pets-create-dialog'
})

const icons = ref({
  add: 'i-mdi-add',
  edit: 'i-mdi-edit'
})
</script>

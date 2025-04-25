<template>
  <router-view v-slot="{ Component }">
    <Suspense>
      <template #default>
        <component :is="Component" />
      </template>
      <template #fallback>
        <div>Loading...</div>
      </template>
    </Suspense>
  </router-view>
</template>

<script lang="ts">
export default {
  name: 'App'
}
</script>

<script setup lang="ts">
import { provide } from 'vue'
import '@simsustech/quasar-components/css'
import { useConfiguration } from './configuration.js'
import {
  useMeta,
  QBtn,
  QBtnDropdown,
  QBtnToggle,
  QInput,
  QSelect,
  QField,
  QChip
} from 'quasar'
import { setDefaultPropsMd3 } from 'unocss-preset-quasar/styles'
import { EventBus } from 'quasar'

const bus = new EventBus<{
  'account-open-customer-create-dialog': () => void
  'account-open-customer-update-dialog': () => void
  'account-open-contact-people-create-dialog': () => void
  'account-open-pets-create-dialog': () => void
  'account-open-bookings-create-dialog': () => void
  'account-open-daycare-create-dialog': () => void
}>()
provide<EventBus>('bus', bus)

const configuration = useConfiguration()
useMeta(() => {
  return {
    title: configuration.value.TITLE
  }
})

setDefaultPropsMd3({
  QBtn,
  QBtnDropdown,
  QBtnToggle,
  QInput,
  QSelect,
  QField,
  QChip
})
</script>

<style>
[v-cloak] {
  display: none;
}
</style>

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
import { useConfiguration } from './configuration.js'
import { useMeta } from 'quasar'
import { EventBus } from 'quasar'
import { generateTheme, setThemeColors } from 'unocss-preset-quasar/theme'

const bus = new EventBus<{
  'account-open-customer-create-dialog': () => void
  'account-open-customer-update-dialog': () => void
  'account-open-contact-people-create-dialog': () => void
  'account-open-pets-create-dialog': () => void
  'account-open-bookings-create-dialog': () => void
  'account-open-daycare-create-dialog': () => void
  'administrator-open-announcements-create-dialog': () => void
  'administrator-open-periods-create-dialog': () => void
  'administrator-configuration-open-buildings-create-dialog': () => void
  'administrator-configuration-open-kennels-create-dialog': () => void
  'administrator-configuration-open-categories-create-dialog': () => void
  'administrator-configuration-open-opening-times-create-dialog': () => void
  'administrator-configuration-open-services-create-dialog': () => void
  'administrator-configuration-open-daycare-subscriptions-create-dialog': () => void
}>()
provide<EventBus>('bus', bus)

const configuration = useConfiguration()
if (configuration.value.THEME_COLORS) {
  setThemeColors(configuration.value.THEME_COLORS)
}

useMeta(() => {
  return {
    title: configuration.value.TITLE
  }
})
</script>

<style>
[v-cloak] {
  display: none;
}

.bg-light-surface {
  background-color: #ffffff;
}
</style>

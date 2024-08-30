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
import { useMeta } from 'quasar'
useMeta(() => ({
  titleTemplate: (title) => `${title} - Petboarding`,
  meta: {
    description: {
      name: 'description',
      content: 'Easy, fast and reliable pet boarding booking system.'
    },
    keywords: {
      name: 'keywords',
      content:
        'petboarding, saas, pets, dogs, cats, software, booking, bookings, reservation, reservations, daycare, appointment'
    },
    equiv: {
      'http-equiv': 'Content-Type',
      content: 'text/html; charset=UTF-8'
    }
  }
}))
</script>

<template>
  <blog-post v-bind="{ url }">
    <template #title>
      Unavailable daycare dates now disabled for customers
    </template>
    <template #date>{{ formatDate('2025-03-27') }}</template>
    <p>
      Daycare dates which are unavailable, either due to a holiday or an
      unavailable period, are now disabled in the daycare form for customers.
    </p>
    <q-img
      v-if="!url"
      src="/blog/2025-03-27-unavailable-daycare-dates/holidays.png"
      width="500px"
    />
    <q-img
      v-if="!url"
      src="/blog/2025-03-27-unavailable-daycare-dates/calendar.png"
      width="500px"
    />
  </blog-post>
</template>

<script setup lang="ts">
import BlogPost, { Props } from '../../components/BlogPost.vue'
import { formatDate } from '../../tools.js'
defineProps<Props>()
</script>

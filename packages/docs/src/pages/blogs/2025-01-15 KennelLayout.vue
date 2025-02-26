<template>
  <blog-post v-bind="{ url }">
    <template #title> Improved kennel layout </template>
    <template #date>{{ formatDate('2025-01-15') }}</template>
    <p>
      The kennel layout page has been improved! This means that you can now drop
      the pet chips on other pet chips in kennels and it will work flawlessly.
    </p>
    <q-img
      v-if="!url"
      src="/blog/2025-01-15-kennel-layout/draganddrop.gif"
      width="500px"
    />
  </blog-post>
</template>

<script setup lang="ts">
import BlogPost, { Props } from '../../components/BlogPost.vue'
import { formatDate } from '../../tools.js'
defineProps<Props>()
</script>

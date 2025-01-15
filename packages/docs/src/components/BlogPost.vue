<template>
  <q-card class="blog-post">
    <q-card-section>
      <div class="text-h6">
        <slot name="title" />
      </div>
      <div class="text-subtitle2"><slot name="date" /></div>
    </q-card-section>

    <q-card-section class="q-pt-none blog-post__content">
      <slot name="default" />
    </q-card-section>

    <q-card-actions>
      <q-btn v-if="url" :to="url" flat>Read more</q-btn>
    </q-card-actions>
  </q-card>
</template>

<script lang="ts">
export interface Props {
  url?: string
}
</script>
<script setup lang="ts">
defineProps<Props>()
</script>

<style>
.blog-post {
  max-width: 750px;
}
.blog-post__content > p {
  white-space: nowrap;
  overflow: hidden;
  text-wrap: auto;
  text-overflow: ellipsis;
}
</style>

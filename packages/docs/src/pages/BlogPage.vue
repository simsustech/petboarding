<template>
  <q-page padding>
    <div class="row q-col-gutter-lg">
      <div v-for="[name, post] in blogPosts" :key="name" class="col-md-3">
        <component
          :is="post.default"
          :url="`${name.replace('.vue', '').replaceAll(' ', '-')}`"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
const blogPosts = Object.entries(
  import.meta.glob('./blogs/*.vue', {
    eager: true
  })
).sort((a, b) => (b[0] > a[0] ? 1 : 0))
</script>

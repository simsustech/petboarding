<template>
  <q-card
    :style="{
      'max-width': '300px'
    }"
  >
    <q-item>
      <q-item-section avatar>
        <q-avatar>
          <img :src="`/testimonials/${id}.jpg`" />
        </q-avatar>
      </q-item-section>

      <q-item-section>
        <q-item-label>{{ company }}</q-item-label>
        <q-item-label caption>{{ owner }}</q-item-label>
      </q-item-section>
    </q-item>

    <q-card-section>
      <a>{{ content }}</a>
    </q-card-section>

    <q-card-section>
      <a :href="url">{{ url }}</a>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
interface Props {
  id: string
  company: string
  owner: string
  url: string
  content: string
}

defineProps<Props>()
</script>

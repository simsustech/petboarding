<template>
  <q-card
    :style="{
      'max-width': '300px'
    }"
  >
    <q-item>
      <q-item-section v-if="image" avatar>
        <q-avatar>
          <img :src="image" />
        </q-avatar>
      </q-item-section>

      <q-item-section>
        <q-item-label>{{ company }}</q-item-label>
        <q-item-label caption>{{ name }}</q-item-label>
        <q-item-label caption>{{ url }}</q-item-label>
      </q-item-section>
    </q-item>

    <q-card-section>
      <a>{{ content }}</a>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
interface Props {
  id: string
  image?: string
  company?: string
  name: string
  url?: string
  content: string
}

defineProps<Props>()
</script>

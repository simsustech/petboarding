<template>
  <q-card
    :style="{
      'max-width': '300px'
    }"
    flat
    bordered
  >
    <q-img style="height: 150px" fit="scale-down" :src="imgSrc" />

    <q-card-section>
      <div class="text-h5 q-mt-sm q-mb-xs">{{ title }}</div>
      <div class="text-caption text-grey">
        {{ content }}
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
export interface Props {
  title: string
  content: string
  imgSrc: string
}

defineProps<Props>()
</script>

<template>
  <q-img
    class="cursor-pointer"
    :src="modelValue"
    fit="contain"
    style="max-height: 60vh"
  >
    <q-icon v-if="!modelValue" name="i-mdi-camera" />
  </q-img>
</template>

<script lang="ts">
export default {
  name: 'Base64Image'
}
</script>

<script setup lang="ts">
export interface Props {
  modelValue?: string
}

defineProps<Props>()
</script>

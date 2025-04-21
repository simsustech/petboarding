<template>
  <q-page padding>
    {{ service }} <q-icon name="i-mdi-check" color="green" />
  </q-page>
</template>

<script lang="ts">
export default {
  name: 'RedirectAuthenticatedPage'
}
</script>
<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref } from 'vue'

const route = useRoute()

const service = ref(route.path.split('/').at(-1))
</script>

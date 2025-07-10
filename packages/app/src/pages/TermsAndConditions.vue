<template>
  <q-markdown class="q-pa-md" :src="termsAndConditions" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { QMarkdown } from '@quasar/quasar-ui-qmarkdown'
import '@quasar/quasar-ui-qmarkdown/dist/index.css'
import { usePublicGetTermsAndConditionsQuery } from 'src/queries/public'

const { termsAndConditions, refetch: execute } =
  usePublicGetTermsAndConditionsQuery()

onMounted(async () => {
  execute()
})
</script>

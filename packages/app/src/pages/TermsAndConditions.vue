<template>
  <q-markdown class="q-pa-md" :src="termsAndConditions" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { QMarkdown } from '@quasar/quasar-ui-qmarkdown'
import '@quasar/quasar-ui-qmarkdown/dist/index.css'
import { createUseTrpc } from 'src/trpc'
const { useQuery } = await createUseTrpc()

const { data: termsAndConditions, execute } = useQuery(
  'public.getTermsAndConditions'
)

onMounted(async () => {
  execute()
})
</script>

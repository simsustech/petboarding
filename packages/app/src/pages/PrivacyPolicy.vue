<template>
  <q-markdown class="q-pa-md" :src="privacyPolicy" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { QMarkdown } from '@quasar/quasar-ui-qmarkdown'
import { usePublicGetPrivacyPolicyQuery } from 'src/queries/public'

const { privacyPolicy, refetch: execute } = usePublicGetPrivacyPolicyQuery()

onMounted(async () => {
  execute()
})
</script>

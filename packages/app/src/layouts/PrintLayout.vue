<template>
  <div v-show="ready">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useOAuthClient, user, oAuthClient } from '../oauth.js'
import { useRoute, useRouter } from 'vue-router'
import { useLang, loadLang } from '../lang/index.js'
import { loadConfiguration, useConfiguration } from '../configuration.js'

import { loadLang as loadComponentsFormLang } from '@simsustech/quasar-components/form'
import { loadLang as loadModularApiQuasarComponentsCheckoutLang } from '@modular-api/quasar-components/checkout'
import { initializeTRPCClient } from 'src/trpc.js'

const router = useRouter()
const route = useRoute()
const lang = useLang()

const $q = useQuasar()

const language = ref($q.lang.isoName)

await loadConfiguration(language)
const configuration = useConfiguration()
await initializeTRPCClient(configuration.value.API_HOST)

if (lang.value.isoName !== $q.lang.isoName) loadLang($q.lang.isoName)
watch($q.lang, () => {
  loadLang($q.lang.isoName)
  loadComponentsFormLang($q.lang.isoName)
  loadModularApiQuasarComponentsCheckoutLang($q.lang.isoName)
})

const authenticatedRoutes = ['/account', '/employee', '/admin', '/user']
const isAuthenticatedRoute = (route: string) => {
  return authenticatedRoutes.some((authenticatedRoute) =>
    route.includes(authenticatedRoute)
  )
}

const ready = ref(false)
onMounted(async () => {
  if (__IS_PWA__) {
    await import('../pwa.js')
  }
  await loadConfiguration(language)
  await useOAuthClient()
  await oAuthClient.value?.getUserInfo()

  if (oAuthClient.value?.getAccessToken()) {
    user.value = await oAuthClient.value?.getUser()
    if (!user.value && isAuthenticatedRoute(route.path))
      router.push({ path: '/' })
  } else if (isAuthenticatedRoute(route.path)) {
    router.push({ path: '/' })
  }

  ready.value = true
})
</script>

<style>
.wrapper {
  padding: 16px;
}
</style>

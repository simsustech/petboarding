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
import { loadLang } from '../lang/index.js'
import {
  loadConfiguration,
  useConfiguration,
  quasarLanguageMap
} from '../configuration.js'

import {
  loadLang as loadComponentsFormLang,
  type Locales
} from '@simsustech/quasar-components/form'
import { loadLang as loadModularApiQuasarComponentsCheckoutLang } from '@modular-api/quasar-components/checkout'
import { initializeTRPCClient } from 'src/trpc.js'

const router = useRouter()
const route = useRoute()

const $q = useQuasar()

const locale = ref<Locales>($q.lang.isoName as Locales)
const updateLocale = (val: Locales) => {
  locale.value = val
  $q.localStorage.set('locale', val)
}

watch(locale, (newVal, oldVal) => {
  const quasarLang = quasarLanguageMap[newVal]
  if (quasarLang && newVal !== oldVal) {
    loadLang(quasarLang)
    loadComponentsFormLang(quasarLang)
    loadModularApiQuasarComponentsCheckoutLang(quasarLang)

    // @ts-expect-error string
    languageImports.value[quasarLang]().then((lang) => {
      $q.lang.set(lang.default)
    })
  }
})

await loadConfiguration(locale)
const configuration = useConfiguration()
await initializeTRPCClient(configuration.value.API_HOST)

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

  if ($q.localStorage.getItem('locale'))
    locale.value = $q.localStorage.getItem('locale') as Locales

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

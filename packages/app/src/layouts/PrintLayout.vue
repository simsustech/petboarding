<template>
  <!-- Deliberately shell-less: without pinned light tokens it inherits `body--dark`
       and prints dark-on-dark (audit: frontend-audit-dark/print-privacypolicy.png). -->
  <div v-show="ready" class="print-root">
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

.print-root {
  color-scheme: light;
  /* Force light tokens below so a dark session still prints black-on-white. The
     surface-container family is pinned too: `.q-card` paints from
     `--q-card-surface` → `--q-surface-container-low`, which stayed dark and put
     a near-black card under near-black text (measured 1.04:1, audit
     2026-10-06, /print/overview in a dark session). */
  --q-surface: #ffffff;
  --q-surface-container-lowest: #ffffff;
  --q-surface-container-low: #ffffff;
  --q-surface-container: #ffffff;
  --q-surface-container-high: #ffffff;
  --q-surface-container-highest: #ffffff;
  --q-background: #ffffff;
  --q-on-surface: #1f1f1f;
  --q-on-surface-variant: #44464f;
  --q-outline-variant: #c3c6cf;
  --q-on-background: #1f1f1f;
  background: var(--q-surface);
  color: var(--q-on-surface);
}
</style>

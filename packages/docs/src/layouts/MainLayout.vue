<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round aria-label="Menu" @click="toggleLeftDrawer">
          <q-icon :name="matMenu" />
        </q-btn>

        <q-avatar
          square
          style="height: 50px; width: 50px"
          :class="{
            'q-mt-xs': true,
            'q-mb-xs': true
          }"
        >
          <img alt="Logo" width="50px" height="50px" :src="logo" />
        </q-avatar>

        <q-toolbar-title shrink> Petboarding </q-toolbar-title>

        <q-space horizontal />
        <q-tabs v-model="tab" class="gt-sm">
          <q-route-tab
            v-for="page in pages[$q.lang.isoName]"
            :key="page.id"
            :name="page.label"
            :to="'/' + page.id"
            :label="page.label"
          ></q-route-tab>
          <q-btn-dropdown
            auto-close
            stretch
            flat
            :label="lang.documentation.title"
          >
            <q-list>
              <q-item clickable @click="goToSubRoute('documentation', 'users')">
                <q-item-section>{{ lang.documentation.users }}</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </q-tabs>
        <q-space horizontal />
        <q-language-select
          v-model="language"
          :language-imports="languageImports"
          :locales="languageLocales"
        />
        <q-btn
          flat
          :icon="fabGithub"
          color="black"
          aria-label="Github"
          href="https://github.com/simsustech/petboarding"
        />
      </q-toolbar>
    </q-header>

    <!-- <q-footer reveal>
      <q-toolbar>
        <q-space horizontal />
        <div class="column">
          <div class="row">
            <a class="text-subtitle1"> Copyright © 2023 simsustech </a>
          </div>
          <div class="row">
            <a href="https://www.simsus.tech"> https://www.simsus.tech </a>
          </div>
        </div>
        <q-space horizontal />
      </q-toolbar>
    </q-footer> -->

    <q-drawer v-model="leftDrawerOpen" bordered>
      <q-list>
        <q-item
          v-for="page in pages[$q.lang.isoName]"
          :key="page.id"
          :to="`/${page.id}`"
        >
          <q-item-section avatar>
            <q-icon :name="page.icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>
              {{ page.label }}
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-expansion-item
          :content-inset-level="1"
          :label="lang.documentation.title"
          icon="menu_book"
        >
          <q-item to="/documentation/users">
            <q-item-section>
              <q-item-label>
                {{ lang.documentation.users }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-expansion-item>
        <q-item href="https://github.com/simsustech/petboarding">
          <q-item-section>
            <q-item-label>
              {{ lang.developers.title }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
      <q-toolbar>
        <q-space horizontal />
        <div class="column">
          <div class="row">
            <div class="text-subtitle1">Copyright © 2025 simsustech</div>
          </div>
          <div class="row">
            <a href="https://www.simsus.tech"> https://www.simsus.tech </a>
          </div>
        </div>
        <q-space horizontal />
      </q-toolbar>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { matMenu } from '@quasar/extras/material-icons'
import { fabGithub } from '@quasar/extras/fontawesome-v6'
import logo from '../assets/logo.svg?url'
import { QLanguageSelect } from '@simsustech/quasar-components'
import { loadLang, useLang } from '../lang/index.js'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
const $q = useQuasar()

const route = useRoute()
const router = useRouter()

watch($q.lang, () => {
  loadLang($q.lang.isoName)
})

const language = ref($q.lang.isoName)
const lang = useLang()

const languageLocales = ref([
  {
    icon: 'i-flagpack-nl',
    isoName: 'nl'
  },
  {
    icon: 'i-flagpack-us',
    isoName: 'en-US'
  }
])

const languageImports = ref({
  nl: () => import(`../../node_modules/quasar/lang/nl.js`),
  'en-US': () => import(`../../node_modules/quasar/lang/en-US.js`)
})

const leftDrawerOpen = ref(false)

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const tab = ref('')
const pages = ref({
  nl: [
    {
      id: 'home',
      label: 'Home',
      icon: 'home'
    },
    {
      id: 'pricing',
      label: 'Prijzen',
      icon: 'euro'
    },
    {
      id: 'testimonials',
      label: 'Testimonials',
      icon: 'reviews'
    },
    {
      id: 'blog',
      label: 'Blog',
      icon: 'rss_feed'
    },
    {
      id: 'contact',
      label: 'Contact',
      icon: 'person'
    }
  ],
  'en-US': [
    {
      id: 'home',
      label: 'Home',
      icon: 'home'
    },
    {
      id: 'pricing',
      label: 'Pricing',
      icon: 'euro'
    },
    {
      id: 'testimonials',
      label: 'Testimonials',
      icon: 'reviews'
    },
    {
      id: 'blog',
      label: 'Blog',
      icon: 'rss_feed'
    },
    {
      id: 'contact',
      label: 'Contact',
      icon: 'person'
    }
  ]
})

const goToSubRoute = (...routePaths: string[]) => {
  tab.value = routePaths[0]
  router.push({
    path: routePaths.join('/')
  })
}

onBeforeRouteUpdate((to, from) => {
  if (from.query.lang && !('lang' in to.query))
    return {
      ...to,
      query: {
        ...from.query
      }
    }
})

onMounted(async () => {
  if (typeof route.query.lang === 'string') language.value = route.query.lang
})
</script>

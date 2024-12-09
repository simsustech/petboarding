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
            'q-mb-xs': true,
            'q-ml-sm': $q.screen.lt.lg,
            'q-ml-md': $q.screen.gt.md
          }"
        >
          <img alt="Logo" :src="logo" />
        </q-avatar>

        <q-toolbar-title :shrink="$q.screen.lt.md">
          Petboarding
        </q-toolbar-title>

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
              <q-item clickable to="/documentation/users">
                <q-item-section>{{ lang.documentation.users }}</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </q-tabs>
        <q-space horizontal />
        <q-language-select
          v-model="language"
          :language-imports="languageImports"
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
        <q-item to="/home">
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>
            <q-item-label>
              {{ lang.home.title }}
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item to="/pricing">
          <q-item-section avatar>
            <q-icon name="euro" />
          </q-item-section>
          <q-item-section>
            <q-item-label>
              {{ lang.pricing.title }}
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item to="/contact">
          <q-item-section avatar>
            <q-icon name="person" />
          </q-item-section>
          <q-item-section>
            <q-item-label>
              {{ lang.contact.title }}
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
            <a class="text-subtitle1"> Copyright © 2024 simsustech </a>
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
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { matMenu } from '@quasar/extras/material-icons'
import { fabGithub } from '@quasar/extras/fontawesome-v6'
import logo from '../assets/logo.svg?url'
import { QLanguageSelect } from '@simsustech/quasar-components'
import { loadLang, useLang } from '../lang/index.js'
import type { QuasarLanguage } from 'quasar'
import { useRoute } from 'vue-router'
const $q = useQuasar()

const route = useRoute()

const quasarLang = import.meta.glob<{ default: QuasarLanguage }>(
  '../../node_modules/quasar/lang/*.js'
)

watch($q.lang, () => {
  loadLang($q.lang.isoName)
})

if (typeof route.query.lang === 'string')
  $q.lang.set(
    (
      await quasarLang[
        `../../node_modules/quasar/lang/${route.query.lang}.js`
      ]()
    ).default
  )

const language = ref($q.lang.isoName)
const lang = useLang()

const languageImports = ref(
  Object.entries(quasarLang).reduce(
    (acc, [key, value]) => {
      const langKey = key.split('/').at(-1)?.split('.').at(0)
      if (langKey) acc[langKey] = value
      return acc
    },
    {} as Record<string, () => Promise<{ default: QuasarLanguage }>>
  )
)

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
      id: 'contact',
      label: 'Contact',
      icon: 'person'
    }
  ],
  'en-US': [
    {
      id: 'Home',
      label: 'Home',
      icon: 'home'
    },
    {
      id: 'pricing',
      label: 'Pricing',
      icon: 'euro'
    },
    {
      id: 'contact',
      label: 'Contact',
      icon: 'person'
    }
  ]
})
</script>

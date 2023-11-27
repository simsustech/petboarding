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
          class="q-mt-xs q-mb-xs q-ml-lg"
        >
          <img alt="Logo" :src="logo" />
        </q-avatar>

        <q-toolbar-title> Petboarding </q-toolbar-title>

        <q-tabs v-model="tab" class="gt-sm">
          <q-route-tab
            v-for="page in pages[$q.lang.isoName]"
            :key="page.id"
            :name="page.label"
            :to="page.id"
            :label="page.label"
          ></q-route-tab>
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
        <q-item v-for="page in pages[$q.lang.isoName]" :to="page.id">
          <q-item-section avatar>
            <q-icon v-if="page.icon" :name="page.icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>
              {{ page.label }}
            </q-item-label>
          </q-item-section>
        </q-item>
        <!-- <q-item to="/">
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>
            <q-item-label> Home </q-item-label>
          </q-item-section>
        </q-item> -->
        <!-- <q-item to="/documentation">

        </q-item> -->
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
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
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { matMenu } from '@quasar/extras/material-icons'
import { fabGithub } from '@quasar/extras/fontawesome-v6'
import logo from '../assets/logo.svg?url'
import { QLanguageSelect } from '@simsustech/quasar-components'
import type { QuasarLanguage } from 'quasar'
const $q = useQuasar()

const language = ref($q.lang.isoName)

const quasarLang = import.meta.glob<QuasarLanguage>(
  '../../node_modules/quasar/lang/*.mjs'
)

const languageImports = ref(
  Object.entries(quasarLang).reduce((acc, [key, value]) => {
    const langKey = key.split('/').at(-1)?.split('.').at(0)
    if (langKey) acc[langKey] = value
    return acc
  }, {} as Record<string, () => Promise<QuasarLanguage>>)
)

const leftDrawerOpen = ref(false)

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const tab = ref('')
const pages = ref({
  nl: [
    {
      id: 'Home',
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

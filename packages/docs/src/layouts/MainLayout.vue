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

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item to="/">
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>
            <q-item-label> Home </q-item-label>
          </q-item-section>
        </q-item>
        <!-- <q-item to="/documentation">

        </q-item> -->
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
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
</script>

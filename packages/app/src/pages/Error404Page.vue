<template>
  <!-- Rendered inside the app shell (no `fullscreen`), clamped so 375px does not
       overflow, at full contrast, with the primary CTA (audit: error404.png). -->
  <q-page class="bg-primary text-white text-center flex flex-center">
    <div>
      <div style="font-size: clamp(6rem, 18vmin, 14rem); line-height: 1">
        404
      </div>

      <div class="text-h2">{{ lang[404] }}</div>

      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="primary"
        unelevated
        to="/"
        :label="lang.goHome"
        no-caps
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useLang } from '../lang/index.js'

const lang = useLang()
</script>

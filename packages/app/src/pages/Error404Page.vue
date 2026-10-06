<template>
  <!-- Rendered inside the app shell (no `fullscreen`), clamped so 375px does not
       overflow, at full contrast, with the primary CTA (audit: error404.png).
       Surface + primary accents rather than a `bg-primary` slab: the primary is a
       light teal in dark mode, so white-on-primary measured 1.71:1 there (audit:
       contrast-probe 2026-10-06). The CTA button already pairs primary with its
       on-primary via the theme, so it flips on its own. -->
  <q-page class="text-center flex flex-center">
    <div>
      <div
        class="text-primary"
        style="font-size: clamp(6rem, 18vmin, 14rem); line-height: 1"
      >
        404
      </div>

      <div class="text-h2">{{ lang[404] }}</div>

      <q-btn
        class="q-mt-xl"
        color="primary"
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

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

      <!-- Flat, primary-coloured label. A filled `bg-primary` button cannot be
           relied on here: Quasar's own `.q-btn { background-color: transparent }`
           is loaded after the preset's utilities and only loses in dark mode,
           where `.body--dark .bg-primary` out-specifies it — a `color="primary"`
           button measured transparent in light (2026-10-06). The label reads at
           6.5:1 in light and 10:1 in dark. -->
      <q-btn
        class="q-mt-xl"
        color="primary"
        flat
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

<script setup lang="ts">
import DefaultTheme from "vitepress/theme";
import { useData, inBrowser } from "vitepress";
import { watchEffect } from "vue";

const { lang } = useData();

watchEffect(() => {
  if (inBrowser) {
    // Sets the language cookie to persist user choice
    document.cookie = `nf_lang=${lang.value}; path=/; max-age=31536000`;
  }
});
</script>

<template>
  <DefaultTheme.Layout />
</template>

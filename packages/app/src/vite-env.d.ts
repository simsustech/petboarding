/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/vue" />

/**
 * Vue single-file component module declaration.
 *
 * `vue-tsc` supplies this implicitly, but plain TypeScript language servers (editors,
 * and the pi-lens check) do not — so `src/router/routes.ts`, which imports every page
 * from `../pages/*.vue`, reported 65 "Cannot find module" errors under the lens while
 * `vue-tsc --noEmit` stayed clean. Types only: no runtime or build behaviour.
 *
 * Added with the owner's approval during the /implement run of
 * `2026-09-23-playwright-screenshot-every.md` (file outside plan §(a)) — see the
 * sibling `.evaluation.md`.
 */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<
    Record<string, never>,
    Record<string, never>,
    unknown
  >
  export default component
}

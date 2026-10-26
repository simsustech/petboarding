/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/vue" />
/**
 * Side-effect CSS subpath export of `@simsustech/quasar-components` — `vite/client`
 * only types specifiers ending in `.css`. Types only; the build resolves the real file.
 */
declare module '@simsustech/quasar-components/css'

/**
 * Vue SFC module declaration: `vue-tsc` supplies it implicitly, but plain TypeScript
 * language servers (editors, the pi-lens check) do not. Types only.
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

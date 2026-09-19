# 2026-08-21 Handoff: Petboarding layout broken (double CSS / missing Quasar styles)

## Problem

The petboarding Docker build produces a page where:
- Header background is transparent (`rgba(0,0,0,0)` instead of themed color)
- Header z-index is `auto` instead of `2000`
- All `.q-icon` elements are empty (11 icons, all empty)
- Login button is not right-aligned
- Half the Quasar component CSS is missing

**Before our changes** (commit `e65f26e1`): layout was correct — header bg `oklab(...)`, z-index `2000`. Icons were also empty (pre-existing, unrelated).

## Root Cause Investigation

### What we checked
1. **Built CSS has Quasar rules** — `pinia-CQErt72U.css` (278KB) contains `.q-header`, `.q-btn`, `.q-toolbar__title` rules. CSS IS present in the build output.
2. **Browser loads 2921 CSS rules** from 5 stylesheets — Quasar rules ARE loaded at runtime.
3. **`disableSass: true` is set** in `vitrify.config.ts` line 164. The Quasar plugin in vitrify (`packages/vitrify/src/node/plugins/quasar/index.ts` line 229) returns `sass: undefined` when `disableSass: true`, preventing `quasar/src/css/index.sass` from being injected.
4. **No Quasar dist CSS in container** — `find /app -name 'quasar.css'` returns nothing.
5. **The user reports double `.q-toolbar__title`** — same rule appears twice, suggesting Quasar's own SASS is being loaded alongside the UnoCSS preset.

### Key vitrify SASS mechanism (`packages/vitrify/src/node/index.ts`)
- Lines 374-384: global SASS is injected into every `<style lang="sass">` block via regex replace
- Line 411: `globalSass = config.vitrify?.sass?.global || []`
- When `disableSass: true`, Quasar plugin sets `sass: undefined`, so `globalSass` stays `[]`
- **BUT**: the regex `/<style lang="sass">(.*?)<\/style>/` matches `<style lang="sass">` blocks in Vue SFCs — if any component has such a block, the (empty) sass string is still injected, effectively replacing the block content

### What's different between working and broken
- **Working**: clean commit `e65f26e1` with original `pnpm-lock.yaml`, no LINKED_VITRIFY_PATH
- **Broken**: same git state but with `LINKED_VITRIFY_PATH`, `LINKED_MODULAR_API_*` env vars set for Docker build
- The linked vitrify and modular-api packages may behave differently from their npm-published versions

### Dockerfile regex issue (separate from CSS)
- The node -e script in the Dockerfile has regex `/^overrides:[\s\S]*?(?=\n\S|$)/m`
- With `m` flag, `$` matches end-of-line, so the lazy `*?` stops immediately — only replaces the `overrides:` header, not the full block
- This means the old indented content stays as root-level keys, and new overrides are prepended
- Despite this, the build DID find 12 workspace projects (linked packages were found)
- The `pnpm deploy --prod` step creates a flat copy that strips link overrides from the deployed `pnpm-workspace.yaml`

### Not the cause
- The `--q-size-*` token collision fix (preset `_tokenPreflight.ts`) — only affects sizing tokens, not component CSS
- The Md3Layout changes — petboarding doesn't use Md3Layout
- The QBtn fab fix — would only affect fab buttons, not header/toolbar

## Where to look next

1. **Check if the linked vitrify produces different CSS output** — compare the vitrify dist from `node_modules/.pnpm/vitrify@0.27.0` (npm) vs the linked local vitrify. The SASS injection mechanism in `packages/vitrify/src/node/index.ts` lines 374-384 might differ.

2. **Check the quasar-components vite plugin** — `QuasarComponentsPlugin` from `@simsustech/quasar-components/vite-plugin` might be pulling in Quasar's CSS. Compare the npm version vs linked version.

3. **Compare the built CSS between working and broken** — rebuild WITHOUT linked vitrify (just preset + quasar-components) and compare the `pinia-*.css` file.

4. **Check for `<style lang="sass">` in any component** — if any Vue SFC has `<style lang="sass">`, vitrify's regex will replace its content with the (empty) globalSass. This could be stripping component-specific styles.

5. **The doubled `.q-toolbar__title` the user sees** — fetch `https://petboarding.localhost/assets/pinia-CQErt72U.css` and grep for `q-toolbar__title` to find both instances and identify their sources.

## What was committed
- `e65f26e1` (petboarding dev) — NaN fixes, already committed before this session
- The Dockerfile has NO changes (reverted all edits)
- `pnpm-workspace.yaml` has NO changes (reverted)

## What's NOT committed (our work in other repos)
- `quasar-components` `6ed03e25` / `c7a35916` / `22a25427` / `2c322be7` — Md3Layout overlay, close icon, drawer-header slot, menu button alignment
- `unocss-preset-quasar` `a33ec67` — skip `--q-size-*` tokens + QBtn fab fix + regression test
- `quasar-testing-harness` `f690b341` / `5d85fb49` / `db27e833` — Md3Layout spec + page + route + coverage doc
- `slimfact` `84baa457` — drawer-header slot in MainLayout

## Docker build command
```bash
export SIMSUSTECH_NPM_TOKEN=$(cat ./env/SIMSUSTECH_NPM_TOKEN)
export LINKED_QUASAR_COMPONENTS_PATH=/home/stefan/Projects/quasar-components/packages/components
export LINKED_UNOCSS_PRESET_QUASAR_PATH=/home/stefan/Projects/unocss-preset-quasar/packages/preset
export LINKED_VITRIFY_PATH=/home/stefan/Projects/vitrify
export LINKED_MODULAR_API_API_PATH=/home/stefan/Projects/modular-api/packages/api
export LINKED_MODULAR_API_FASTIFY_CHECKOUT_PATH=/home/stefan/Projects/modular-api/packages/fastify-checkout
export LINKED_MODULAR_API_FASTIFY_OIDC_PATH=/home/stefan/Projects/modular-api/packages/fastify-oidc
export LINKED_MODULAR_API_QUASAR_COMPONENTS_PATH=/home/stefan/Projects/modular-api/packages/components
docker compose -f docker-compose.test.yaml down --volumes
docker compose -f docker-compose.test.yaml build --no-cache app
docker compose -f docker-compose.test.yaml up -d --wait
```
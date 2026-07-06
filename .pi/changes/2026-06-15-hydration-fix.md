# Changes: Hydration mismatch fix (2026-06-15)

## Root cause
`Md3Layout.vue` used `v-show="ready"` — the server rendered the full layout tree (with `$q.screen.width=0, height=0`) inside a hidden div. Vue's hydration detected 9 mismatches per page: drawer visibility, layout min-heights, padding offsets, image classes. Fix: changed to `v-if="ready"` on `<q-layout>`, so the server renders nothing and the client creates the tree from scratch on mount.

## Modified files

| File | Description |
|------|-------------|
| `Dockerfile` | Added `linked-*` BuildKit context support — copies local packages from `additional_contexts`, builds and `pnpm link`s them |
| `docker-compose.test.yaml` | Added `additional_contexts` with all linkable packages (quasar-components, vitrify, etc.), defaults to `.docker/empty/` |
| `packages/api/tests/e2e/setup.ts` | Added `console.warning` capture to log Vue hydration mismatch details in test output |

## New files

| File | Description |
|------|-------------|
| `.docker/empty/.gitkeep` | Empty fallback context for when a local package isn't being linked |

## New files (not staged — external package)

| File | Description |
|------|-------------|
| `@simsustech/quasar-components` `Md3Layout.vue` | Changed `v-show="ready"` → `v-if="ready"` on `<q-layout>` |

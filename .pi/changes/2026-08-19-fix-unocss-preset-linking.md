# Changes: Fix unocss-preset-quasar linking + all-pointer-events dropdown bug (2026-08-19)

## New files

| File | Description |
|------|-------------|

## Modified files (all hunks accepted)

| File | Lines | Description |
| ------ | ------- | ------------- |
| `.npmrc` | +1 | Add `force-legacy-deploy=true` so pnpm deploy keeps `link:` overrides intact (matches slimfact strategy) |
| `Dockerfile` | ~41 | Port slimfact's local-package linking strategy: copy local packages into `/build/packages/*` (inside workspace glob), inject `link:` overrides into `pnpm-workspace.yaml` before install, use `--no-frozen-lockfile` when linked packages present, build local packages after install. Replaces broken `pnpm link`-after-frozen-install approach |
| `pnpm-lock.yaml` | ~288 | Regenerated after unocss 66.8.0 + `unocss-preset-quasar` link override |
| `pnpm-workspace.yaml` | 2 | Replace `unocss: 66.7.5` override with `unocss-preset-quasar: link:../unocss-preset-quasar/packages/preset` |

## Root causes fixed

1. **Docker build failed** (`ERR_MODULE_NOT_FOUND @simsustech/quasar-components`): petboarding's Dockerfile copied local packages to `/build/local-packages/` (outside the workspace glob) and used `pnpm link` after a `--frozen-lockfile` install — so the app resolved the published registry version, not the linked local package. Ported slimfact's strategy (copy into workspace + inject `link:` overrides + `--no-frozen-lockfile`).

2. **Dropdown options unclickable** (q-field__bottom intercepting pointer events): Quasar's QDialog menu portal uses class `all-pointer-events`, but the CSS rule was never generated. Root cause: `@unocss/preset-wind4`'s `scopeMatcher("all", " ")` variant consumes the `all-` prefix of `all-pointer-events`, so the preset's rule never matches (`parseToken` returns null). Fixed in `~/Projects/unocss-preset-quasar/packages/preset/src/core/mouse.unocss.ts` by moving `all-pointer-events` from `rules` to `preflights` (bypasses token matching).

3. **unocss version mismatch** (transformer-directives 66.7.5 vs vite 66.8.0): local preset updated to unocss 66.8.0; app package.json uses unocss 66.8.0; linked preset resolves 66.8.0 everywhere.

## Verification

- `pnpm run build` — passes (app + api + tools)
- `pnpm run lint` — passes (pre-existing warnings only)
- `pnpm run format:check` — passes
- `pnpm vitrify test` (packages/api) — 66 passed
- `pnpm run test:e2e` (packages/api) — 45 passed, 2 skipped (slimfact integration) on fresh DB
- Docker image builds with `LINKED_UNOCSS_PRESET_QUASAR_PATH=/home/stefan/Projects/unocss-preset-quasar/packages/preset`

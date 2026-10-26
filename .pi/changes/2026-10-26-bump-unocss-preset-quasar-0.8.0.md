# Changes: bump unocss-preset-quasar to 0.8.0 (2026-10-26)

Brings in the preset's `itemMediaCss`: an item row whose trailing slot holds a
state control (`q-rating`, `q-toggle`, `q-checkbox`, `q-radio`) stacks below
599.98px instead of squeezing its label to an ellipsis. Reported as the
PetRelation QSelect hiding the pet's name behind the stars on phones.

## New files

| File | Description |
|------|-------------|
| `.changeset/preset-0-8-0-item-side-control.md` | Patch changeset for `@petboarding/app` + `@petboarding/api`, with the measured before/after and the selector's boundary. |

## Modified files (all hunks accepted)

| File | Lines | Description |
|------|-------|-------------|
| `packages/app/package.json` | 1 | `unocss-preset-quasar` `0.7.4` → `0.8.0` (exact pin). |
| `packages/api/package.json` | 1 | `^0.7.4` → `^0.8.0` (caret, as the API imports `generateTheme`). |
| `pnpm-workspace.yaml` | 4 | `minimumReleaseAgeExclude` gains `|| 0.8.0`; the folded-entry comment says twelve versions. |
| `pnpm-lock.yaml` | 31 | Both importers resolve `unocss-preset-quasar@0.8.0`. |

## Verification

- `pnpm install` resolved 0.8.0 for both importers (`packages/app/node_modules/unocss-preset-quasar/package.json` → `0.8.0`).
- `pnpm run lint`, `pnpm run format:check`, `pnpm run build` clean; `packages/app` unit tests 13/13.
- Built stylesheet carries the rule: `packages/app/dist/ssr/client/assets/unocss-DyI3WrA0.css` contains the three `.q-item:has(> .q-item__section--side :is(…))` declarations (`lightningcss` minification preserved them).
- Inside the running image, the bundle path names `unocss-preset-quasar@0.8.0`, and the app's shipped `unocss-CB4YSP6R.css` carries the same three rules.
- Full e2e on a freshly built stack: **125 passed, 6 skipped, 0 failed**.

## Not in this commit

Pre-existing local modifications under `packages/api/tests/e2e/`
(`auth-state.ts`, `setup.ts`, `slimfact.spec.ts`) and the untracked scratch files
(`.impeccable/`, `.pi/handoffs/`, `docker-compose.test.nl.yaml`, …) are unrelated
and left untouched.

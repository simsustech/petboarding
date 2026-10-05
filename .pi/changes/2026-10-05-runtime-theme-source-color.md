# Changes: runtime theme source color via `unocss-preset-quasar` 0.6.2 (2026-10-05)

## Root cause

`setThemeColors(THEME_COLORS)` (run from `/configuration`'s `THEME_COLORS`, derived
from `VITE_SOURCE_COLOR`) only wrote the `--light-*` / `--dark-*` primitives onto
`document.body`. Every component reads the semantic `--q-*` tokens, and the
preset's token preflight emits those as build-time **literals** at `:root`. The
runtime write therefore landed on a variable nothing consumed: the default scheme
(`--q-primary: #005faf`) always won over the configured teal (`#00696d`).

Verified live against the running test stack: `:root --q-primary = #005faf`
while `body --light-primary = #00696d`.

## Fix

Fixed in the preset (`unocss-preset-quasar` 0.6.2): `setThemeColors` now also
emits the semantic `--q-*` tier into one injected stylesheet — light roles on
`:root`, dark roles scoped to `body.body--dark`. Petboarding picks it up by moving
the pin from `0.6.1` to `0.6.2`.

## New files
| File | Description |
|------|-------------|
| `.changeset/runtime-theme-source-color.md` | Changeset for the dependency bump + the fixed behaviour. |

## Modified files (all hunks accepted)
| File | Lines | Description |
|------|-------|-------------|
| `packages/app/package.json` | 1 | `unocss-preset-quasar`: `0.6.1` → `0.6.2`. |
| `packages/api/package.json` | 1 | `unocss-preset-quasar`: `^0.6.1` → `^0.6.2`. |
| `pnpm-workspace.yaml` | 1 | `minimumReleaseAgeExclude` covers `0.6.2`. |
| `packages/api/tests/e2e/frontend/palette.spec.ts` | +40 | Regression test: `--q-primary` equals `/configuration`'s `THEME_COLORS.light.primary` (light) and `dark.primary` under `body.body--dark`. Red on 0.6.1, green on 0.6.2. |
| `pnpm-lock.yaml` | — | Resolves `unocss-preset-quasar@0.6.2`. |

## Verification

- Regression test red against the 0.6.1 stack (`Expected #00696d, Received #005faf`),
  green after rebuilding the image with 0.6.2.
- Full `frontend/palette.spec.ts`: 8 passed.

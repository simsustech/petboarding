# Changes: unocss-preset-quasar 0.7.0, drop devcert, drop SigMap (2026-10-12)

## New files
| File | Description |
|------|-------------|
| — | — |

## Modified files (all hunks accepted)
| File | Lines | Description |
|------|-------|-------------|
| `packages/app/package.json` | deps | `unocss-preset-quasar` 0.6.6 → 0.7.0; remove `devcert`; add `@vitejs/plugin-basic-ssl@^2.3.0` |
| `packages/api/package.json` | deps | `unocss-preset-quasar` ^0.6.6 → ^0.7.0 |
| `pnpm-workspace.yaml` | 39 | add `unocss-preset-quasar@0.7.0` to `minimumReleaseAgeExclude` (folded scalar to stay ≤80 cols) |
| `pnpm-lock.yaml` | — | resolve 0.7.0, drop `devcert` and its transitive tree |
| `packages/app/vitrify.config.ts` | 1-22, 28-36, 44-50, 104, 127-139 | use `quasarIconSet('mdi-v7')` (replace the hand-written icon map); pass `provider.iconSet` + self-contained `iconMapFn` to Quasar; pass `iconSet: 'mdi-v7'` to `QuasarPreset`; replace `devcert`'s `certificateFor` with `@vitejs/plugin-basic-ssl`'s `getCertificate`; drop the unused `command` param |
| `.gitignore` | 15-18 | remove the SigMap-generated-context block (`packages/**/AGENTS.md`, `.contextignore`, `**/.github/context*.md`); keep `**/.pnpm-store/**` |

## Deleted files
| File | Reason |
|------|--------|
| `.github/copilot-instructions.md` | SigMap-generated |
| `gen-context.config.json` | SigMap config |
| `packages/{api,app,docs,tools}/.github/copilot-instructions.md` | SigMap-generated |
| `packages/{api,app,docs,tools}/AGENTS.md` | SigMap-generated (gitignored, working-tree only) |
| `.contextignore` | SigMap ignore file (gitignored, working-tree only) |

## Verification
- `pnpm run lint` → 0 errors (warnings pre-existing); `pnpm run format:check` → clean
- `pnpm run build` (tools → app SSR → api SSR) → exit 0
- `vue-tsc --noEmit` (app) → only the pre-existing `baseUrl` deprecation error
- Full e2e: **117 passed / 5 skipped / 4 failed** — the 4 failures are pre-existing and
  unrelated to this change (they assert the "profileless admin" empty state, but commit
  `aa7e1b74e` now seeds `admin@petboarding.app` with a customer profile):
  - `daycareMonthNavigation.spec.ts:6` (240s timeout, fragile fixed-delay test)
  - `frontend/account-empty-states.spec.ts:59`
  - `frontend/layout-audit.spec.ts:171`
  - `frontend/palette.spec.ts:276`

## Notes
- The docker image build requests host networking (`docker-compose.test.yaml` `build.network: 'host'`),
  which nono blocks. The suite was run with a temporary compose overlay setting `build.network: default`;
  the resulting image is equivalent.

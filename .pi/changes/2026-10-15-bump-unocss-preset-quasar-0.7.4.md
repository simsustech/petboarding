# Changes: pin `unocss-preset-quasar` 0.7.4 (2026-10-15)

The preset was released at `0.7.4` (`2026-10-15T14:49:51Z`) and the dependency was updated
after it appeared on the registry. It carries the two built-CSS defects reported from a
client's staging deployment: an unplaced popup painted at its static position, and the
individual transform properties being dropped by Lightning CSS.

Nothing in this app's own source changed — only the pins, the release-age exemption and the
lockfile.

## New files

| File | Description |
| --- | --- |
| `.changeset/pin-preset-0-7-4.md` | Changeset for both packages that consume the preset (`@petboarding/app`, `@petboarding/api`), with the before/after rules. |

## Modified files (all hunks accepted)

| File | Lines | Description |
| --- | --- | --- |
| `packages/app/package.json` | 1 | `unocss-preset-quasar` `0.7.3` → `0.7.4` (exact pin). |
| `packages/api/package.json` | 1 | `unocss-preset-quasar` `^0.7.3` → `^0.7.4`. |
| `pnpm-workspace.yaml` | +4/−1 | `0.7.4` added to `minimumReleaseAgeExclude` — pnpm's `minimumReleaseAge: 1440` would otherwise refuse a 24-hour-old release. Folded into a `>-` scalar: the eleven-version line is 110 characters and trips the YAML line-length rule. |
| `pnpm-lock.yaml` | +16/−15 | Resolves `unocss-preset-quasar@0.7.4` for both importers (integrity `sha512-xxoLj3+w…`). Also re-keys two unrelated snapshots (`vitrify`, `vue-router`) — same versions, pnpm's peer-key fingerprints. |

## Verification

- `pnpm install` → lockfile passes the supply-chain policy with the new exemption, and both
  importers resolve 0.7.4 (`node -e` on each `node_modules` copy, plus the lockfile).
- `pnpm run lint` (pre-existing warnings only), `pnpm run format:check`, `pnpm run build`,
  `packages/app` unit tests (13/13).
- Built CSS, host and test image: `.q-position-engine{…;visibility:hidden}` present; zero
  rules carrying both `transform` and `rotate`/`scale`/`translate`; zero `.body--dark
  .q-badge` twin rules.
- The image was rebuilt with the registry package (no `LINKED_UNOCSS_PRESET_QUASAR_PATH`), so
  the stack really ran 0.7.4 — confirmed by the preset path inside
  `/app/dist/server/virtual_vitrify-hooks.mjs`.
- Full e2e on freshly recreated containers → **125 passed, 6 skipped, 0 failed** (131). The
  preset-sensitive `frontend/palette.spec.ts`, `layout-audit.spec.ts` and `layout-polish.spec.ts`
  all pass.

## Note for the next bump

`layout-audit.spec.ts`'s comment says its three upstream-gated assertions "skip by design"
while the pinned preset is pre-fix. That is stale for 0.7.3: `0.7.3` already dropped the
`.body--dark .q-badge` companion (see the comment in the preset's `components/badge/rules.ts`
at that tag), so those tests run and pass on both 0.7.3 and 0.7.4.

# Changes: squash-merge feat/pet-alerts-redesign into dev (2026-10-15)

## What landed

`feat/pet-alerts-redesign` (11 commits, tip `18309073c`, already level with `dev`) is
squash-merged into `dev` as **one commit** — same pattern the kennel-layout picker landed with
(`20a8f3fec`). The branch was verified on its own tree before the squash, so the single commit
carries exactly that tree.

Four changesets ride along, already counted by `changeset status`:
`pet-alerts-row` (app minor), `status-colour-tokens` (app minor), `pin-preset-0-7-3` (app patch),
`pin-quasar-components-0-12-14` (app patch).

- **Alert rows.** The pet card's alerts are dated rows with per-row actions instead of the flat
  list: `PetAlertsForm`, `PetCard` (+299), `PetChip`, `PetItem`, `PetLegend`, `PetSelect`,
  `AgendaChip`, `AgendaLegend`, `OpeningTimesList`, `CustomerDaycareSubscriptionsList`.
- **Colour tokens.** Status / alert / category / glyph colours are tokens with a *value per scheme*
  (`packages/app/src/theme-tokens.ts`, +192) rather than a single hardcoded value; the decision is
  `docs/adr/005-status-colour-pairs.md` and the gate is `theme-tokens.test.ts` + a rewritten
  `configuration.test.ts` (contrast ratios, both schemes).
- **Two dependency pins.** `unocss-preset-quasar` 0.7.3 safelists the MD3 role classes (so
  `bg-error`, `text-on-error`, `bg-surface-container-highest` exist in the app's built CSS) and
  `@simsustech/quasar-components` 0.12.14 drops `QStyledCard`'s 300px cap (so the pets,
  contact-people and account grids fill their columns instead of hugging their content). Both
  upstream fixes were released and inspected before this branch pinned them.
- **Docs.** ADR 005, the design critique, the running recap, and the regenerated
  `employee-pet-alerts` capture. The pinned-date client report and its crops stay in
  `.pi/reports/` **untracked** (see `.gitignore`) — binary artefacts do not belong in
the repo.

## New files

| File | Description |
|------|-------------|
| `packages/app/src/theme-tokens.ts` | Per-scheme status / alert / category / glyph colour tokens (192 lines). |
| `packages/app/src/theme-tokens.test.ts` | The contrast gate for those tokens (209 lines). |
| `packages/api/tests/e2e/frontend/pet-alerts.spec.ts` | E2E guard for the alert rows (356 lines). |
| `docs/adr/005-status-colour-pairs.md` | ADR: one colour value per scheme (298 lines). |
| `.changeset/{pet-alerts-row,status-colour-tokens,pin-preset-0-7-3,pin-quasar-components-0-12-14}.md` | The four queued release notes. |
| `.pi/changes/2026-10-14-pet-alerts-redesign.md` | The branch's running recap, carried over with its measurements. |
| `.pi/reports/2026-10-14-pet-alerts-redesign.{pdf,typ}` + 9 PNGs | The client-facing approval report and its crops — deliberately **not tracked** (`.pi/reports/` is ignored). |
| `.impeccable/critique/2026-10-14T16-19-00Z__packages-app-src-components-pet-petcard-vue.md` | The design critique behind the row layout. |
| `.pi/changes/2026-10-15-merge-pet-alerts-into-dev.md` | This recap. |

## Modified files (all hunks accepted)

| File | Lines | Description |
|------|-------|-------------|
| `packages/app/src/components/pet/PetCard.vue` | +299/−? | Alerts render as dated rows with per-row actions. |
| `packages/app/src/configuration.ts` | +147/−? | Token wiring for the per-scheme colours. |
| `packages/app/src/configuration.test.ts` | +38/−? | Assertions rewritten to the token source. |
| `packages/app/vitrify.config.ts` | +86/−? | Preset / components wiring for the pins. |
| `DESIGN.md` | +88/−? | The token families and the Status Ink / Foreground rules. |
| `packages/app/src/components/pet/PetLegend.vue`, `pet/PetAlertsForm.vue`, `pet/PetChip.vue`, `pet/PetItem.vue`, `employee/PetSelect.vue`, `AgendaChip.vue`, `agenda/AgendaLegend.vue`, `openingTime/OpeningTimesList.vue`, `daycareSubscription/CustomerDaycareSubscriptionsList.vue`, `App.vue` | small | Consumers moved onto the tokens. |
| `packages/app/src/lang/{en-US,nl,index}.ts` | +8/+8/+6 | Copy for the alert rows. |
| `packages/tools/src/constants/index.ts` | +16/−? | `PET_ALERTS` colours driven by the tokens. |
| `packages/api/src/zod/pet.ts` | +4 | Alert-condition shape used by the new spec. |
| `packages/api/tests/e2e/frontend/agenda.spec.ts` | +10/−? | Agenda assertions follow the token colours. |
| `packages/app/package.json`, `packages/api/package.json` | +5/+1 | The two dependency pins. |
| `pnpm-workspace.yaml`, `pnpm-lock.yaml` | +4/−? · +1647/−? | The pins' lockfile half and the `minimumReleaseAgeExclude` entries. |
| `packages/docs/public/screenshots/employee-pet-alerts.png` | Bin | Regenerated capture; embeds the new render date. |

## Verification

| Gate | Result |
|------|--------|
| App unit tests (`cd packages/app && pnpm vitrify test`) | 3 files / **13 tests** pass |
| Workspace `pnpm run lint` + `pnpm run format:check` + `pnpm run build` | clean · clean · exit 0 |
| Full e2e on the merged branch tree | **122 passed / 0 failed / 2 skipped** |
| Contrast, alert tile / calendar / chips | ≥ 4.5:1 in **both** schemes, asserted by the gate |
| Pin effect | preset 0.7.3: `bg-error` etc. missing → present in the built CSS · quasar-components 0.12.14: `max-width: "300px"` in `QStyledCard` 1 → 0 |
| Full e2e on `dev` after the squash | **122 passed / 0 failed / 5 skipped** (9.1 m, 39 files) |
| Workspace `pnpm run lint` / `format:check` / `build` after the squash | exit 0 · exit 0 · exit 0 |
| App unit tests after the squash | 3 files / 13 tests pass |

The post-merge run is `cd packages/api && pnpm run test:e2e` on this commit: **122 passed / 0 failed /
5 skipped** in 9.1 m. The three extra skips against the branch's 122/0/2 are the *uncommitted* Dutch
`cancelationCosts.spec.ts`, which is present in the working tree but gates itself out without
`VITE_LANG=nl-NL` + `PLAYWRIGHT_SLIMFACT`; the other two are the usual gated `bookings.spec.ts`
concurrent-invoice case and `frontend/availability.spec.ts`. The merge's own new spec,
`frontend/pet-alerts.spec.ts`, ran and passed (2 tests), as did the older `employee/petAlerts.spec.ts`
(1 test). `git status` after everything still shows only the untouched cancelation files from the
other session, so nothing here left a side effect behind.

## Notes

- The branch had already merged `dev` into itself (`18309073c`), so this is a squash, not a
  three-way merge: `git merge --squash feat/pet-alerts-redesign`. `dev` was an ancestor of the
  branch tip, and the incoming tree touched no file that was dirty in the checkout, so nothing was
  resolved by hand.
- The recap `.pi/changes/2026-10-15-cancelation-e2e-coverage.md` and the three modified e2e files
  (`auth-state.ts`, `setup.ts`, `slimfact.spec.ts`) belong to the separate cancelation session and
  were **left uncommitted** — they are not in this commit.
- `modular-api`'s `pnpm-lock.yaml` (unrelated `oxlint` 1.87 → 1.88) was deliberately left out of
  the modular-api commit `a1042661`, per the handoff.
- One env-only snag while running the gates on the main checkout: `packages/api/dist/server/jwks/` was
  **root-owned** (an artifact of something running as root at 08:43 that day), and `pnpm run build`
  failed on it with `EACCES` because vitrify re-writes the whole `dist/server` tree. `nono why`
  reported the path ALLOWED, so it was Unix ownership, not the sandbox; with `sudo` blocked by the
  no-new-privileges flag and overlayfs refusing a cross-directory rename of an entry I do not own,
  the whole `packages/api/dist` tree was renamed to `dist-stale/` (excluded locally via
  `.git/info/exclude`) and the build recreated it as `stefan`. The leftover is safe to
  `sudo rm -rf packages/api/dist-stale` at leisure; no tracked file was touched.
- Still owed from the handoff: the docs screenshot regeneration (blocked on the rotted
  `screenshots-customer.spec.ts`), the `slimfact` commit, the petboarding cancelation commit, the
  `@modular-api/fastify-checkout` 0.12 publish + dependency bump, and the custom-surcharge-holidays
  issue.

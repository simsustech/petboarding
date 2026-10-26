# Changes: config-template removal, `.pi/reports` untracking and the dependency refresh (2026-10-15)

Four things landed on `dev`, one of them a history rewrite. Nothing is pushed.

## 1. `bb7a90840` dropped (history rewrite)

`fix(config): restore parity between the client config template and api.config.ts` existed only to
keep `configs/api.config.mjs` in step with `src/api.config.ts`. With the template deleted (§2) the
commit is dead history, so it was dropped.

- The 10 tracked modifications were parked first with **explicit paths** (this repo carries older
  unrelated stashes at `stash@{0}`/`stash@{1}` — never a bare `git stash` here), then
  `git rebase --onto bb7a90840^ bb7a90840 dev`, then popped. The replayed commits applied with **no
  conflict**.
- Proof the rewrite was surgical: `git diff 221078ff8 77d2e8289` reports **only**
  `packages/api/configs/api.config.mjs` (4 insertions, 7 deletions — exactly the dropped commit's own
  delta). Every other path is byte-identical.
- The pet-alerts squash was amended in place first (`9cefb859f` → `221078ff8` → replayed as
  `77d2e8289`) so that §3 could ride in the same rewrite.

## 2. The mountable config template and its test overlay are gone

- `packages/api/configs/api.config.mjs` (465 lines) deleted.
- `docker-compose.test.config.yaml` (122 lines) deleted with it: a copy of `docker-compose.test.yaml`
  whose only real difference was the bind mount of that file, and the last live reference to it
  (`git grep -n "docker-compose.test.config"` now matches only historical recaps).
- `.changeset/tidy-owls-cancel.md` drops its parity bullet — that work is gone, and the changeset is
  still unreleased.
- `packages/api/src/api.config.test.ts`'s comment now points at the private
  `DEFAULT_SURCHARGE_HOLIDAYS` constant in `./api.config.ts` instead of the deleted copy.

Nothing loads the template: no build or runtime path reads `configs/`, and the e2e compose file never
mounted it. A deployment that needs structural overrides can base one on `src/api.config.ts`, which is
the canonical source.

## 3. `.pi/reports/` is no longer tracked

The 11 report artefacts (the client PDF, its `.typ` source and 10 crops) were added by the pet-alerts
squash commit and are now **removed from that commit**, so they never enter history. `.gitignore` gains
`.pi/reports/`; the recap inside the squash commit now records that the report stays local.

## 4. Dependency refresh

| Group | Changes |
| --- | --- |
| `@modular-api` train | `fastify-checkout` ^0.11.2 → **^0.12.0**, `api` ^0.6.42, `fastify-oidc` ^0.9.31, `event-bus` 0.2.4, `quasar-components` 0.3.45 |
| Frontend | Quasar 2.34.0 → 2.35.1, Vue 3.5.43 → 3.5.44, vue-router 5.3.1 → 5.4.0, pinia ^4.1.0, `@pinia/colada` 1.4.8, unocss + presets 66.11.0, `unocss-preset-quasar` ^0.7.3 |
| Tooling | vite 8.3.4, `@vitejs/plugin-vue` 6.0.10, beasties 0.5.5, `@playwright/test` 1.64.1, vitrify ^0.28.3, oxfmt 0.73.0, oxlint 1.88.0, `@types/node` 26.5 |
| Server | fastify ^5.12.7, the `@fastify/*` set, pg-boss ^12.38.0, zod ^4.6.7 |

`pnpm-workspace.yaml` gains the versions still inside the 24 h `minimumReleaseAge` window
(`@modular-api/*`, `vitrify`, the `@playwright/test` trio); existing entries are **extended**, never
replaced.

## Verification

| Gate | Result |
| --- | --- |
| `pnpm install --frozen-lockfile` | exit 0, supply-chain policy passes |
| `pnpm run lint` / `format:check` / `build` | exit 0 · clean · exit 0 |
| `pnpm run test:e2e` (full suite, on the refreshed deps) | **122 passed / 0 failed / 5 skipped** (8.1 m) |
| Rebase sanity | `git diff 221078ff8 77d2e8289` touches only the dropped commit's file |
| `bb7a90840` gone | `git log dev \| grep -c bb7a90840` → 0 |

vitrify 0.28.3 is the release that broke slimfact's HTML shell (a title-drop matcher that is not
comment-aware). It is safe here — this app's template carries a real `<title></title>` and no commented
`<title>` — and the matcher is fixed upstream in `simsustech/vitrify` (`1d781779`).

## Modified and deleted files

| File | Lines | Description |
| --- | --- | --- |
| `packages/api/configs/api.config.mjs` | deleted (465) | The mountable runtime config template. |
| `docker-compose.test.config.yaml` | deleted (122) | Its only live consumer. |
| `.changeset/tidy-owls-cancel.md` | −3 | Parity bullet dropped. |
| `packages/api/src/api.config.test.ts` | +2/−2 | Comment now points at `./api.config.ts`. |
| `.gitignore` | +2 | `.pi/reports/` ignored. |
| `package.json`, `packages/{api,app,docs,tools}/package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml` | +1058/−962 | The refresh. |
| `.pi/changes/2026-10-15-merge-pet-alerts-into-dev.md` | +5/−3 | Records that the client report stays untracked. |
| `.pi/reports/*` (11 files) | removed from the squash commit | Never enter history now. |
| `.pi/changes/2026-10-15-config-template-removal-and-deps.md` | this file | The recap. |

## Still open

- **Publish vitrify 0.28.4** (the fix is on `master` locally, unpushed; `release.yaml` publishes through
  CI on a `master` push), then bump the `vitrify` pin here and in slimfact.
- The cancelation session's e2e work (`cancelationCosts.spec.ts`, `slimfact-integration.ts`,
  `docker-compose.test.nl.yaml`, the three modified e2e files, the handoff, the collision recap) remains
  **uncommitted and untouched**, as it was before this batch.

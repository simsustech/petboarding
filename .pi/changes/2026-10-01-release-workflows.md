# Changes: release + changesets workflows (2026-10-01)

Adopt slimfact's release-PR model and fix the two verified defects that made the
release path non-functional (`changeset status` crash, private packages silently
excluded), plus the prod-image build-context regression and the staging guard gap.

## New files
| File | Description |
|------|-------------|
| `.github/scripts/verify-build-contexts.sh` | Ported verbatim from slimfact (project-agnostic): fails when `Dockerfile` copies from a build context the workflow does not declare in `LINKED_BUILD_CONTEXTS` |
| `.github/scripts/verify-build-contexts.test.sh` | Ported regression tests; the removed-context case uses petboarding's `linked-modular-api-fastify-checkout` |
| `.github/scripts/act-release-workflows.test.sh` | Ported `act` end-to-end test of the `verify-build-contexts` job (staging + production); repository payload is petboarding |
| `.github/workflows/release.yaml` | Production build on `v*.*.*` tags only: `verify-build-contexts` job + `build-and-push-image` (`target: api`) sharing one `LINKED_BUILD_CONTEXTS` env |
| `packages/api/tests/e2e/stack-lifecycle.ts` | Pure helpers: `E2E_OWN_STACK_ENV`, `shouldOwnStack(env)`, `composeFiles(env)` |
| `packages/api/tests/e2e/stack-lifecycle.test.ts` | Vitest unit tests for the guard and compose-file resolution (no docker) |
| `packages/api/tests/e2e/global-setup.ts` | Env-guarded global setup that owns the test stack (resets volumes, builds `app`, ups the stack) |
| `.pi/changes/2026-10-01-release-workflows.md` | This change note |

## Modified files (all hunks accepted)
| File | Lines | Description |
|------|-------|-------------|
| `.changeset/config.json` | 2, 13-16 | Add `privatePackages: { version: true, tag: false }` (unblock api/app bumps); bump `$schema` to the installed `@changesets/config@4.0.0` |
| `packages/docs/package.json` | 3-4 | Add `private: true` and `version: "0.7.1"` — the `fixed` group member with no `version` was crashing `changeset status` |
| `.github/workflows/release staging.yaml` | 11-14, 19-36, 37-64 | Hoist the inline contexts to `env.LINKED_BUILD_CONTEXTS` (7 petboarding contexts, dropping the stale `linked-modular-api`), add `concurrency`, add the `verify-build-contexts` job with `needs`, add `persist-credentials: false`; no `target: api` change |
| `.github/workflows/version-and-release.yaml` | 10-12, 42-110 | Replace the hand-rolled direct-push steps with `changesets/action@v1` (release PR) plus the slimfact tail (tag + GitHub Release on the merged bump); `pull-requests: write` added; no `npx changeset`, no root `CHANGELOG.md`, no push to `main` |
| `.github/workflows/test staging.yaml` | 40-79 | Add pnpm-store and Playwright-browser caches; replace the compose up/build step with a network-only prep step (`global-setup` now owns the stack); run `pnpm run test:e2e` with the npm token |
| `packages/api/vitest.config.ts` | 16-18 | Collect `tests/e2e/**/*.test.ts`; exclude `tests/e2e/**/*.spec.ts` so Playwright specs are never collected by vitest |
| `packages/api/playwright.config.ts` | 8-10 | Add `globalSetup` and explicit `testMatch: '**/*.spec.ts'` (Playwright's default also matched the new vitest `*.test.ts`) |
| `packages/api/tsconfig.json` | 16 | Drop `rootDir: "./src"` — pre-existing mismatch with `include: ["tests", …]` produced 45 `TS6059` errors before this change |
| `AGENTS.md` | 22-26 | "Full quality check" now runs `pnpm run test:e2e` with `global-setup` owning the stack; documents the `PLAYWRIGHT_SLIMFACT` / `PLAYWRIGHT_ALLOW_SCREENSHOTS` guard escape hatch |

## Deleted files
| File | Description |
|------|-------------|
| `.github/workflows/docker-publish.yaml` | Superseded by `release.yaml`; the removed `build-contexts` block was why the prod image could not build |

## Not yet done
- Pre-flight P1/P2: enable *Settings → Actions → "Allow GitHub Actions to create and approve pull requests"* and create the `GH_RELEASE_TOKEN` secret (PAT with `contents: write` + `pull-requests: write`).
- `release staging.yaml` must land on `main` before its `verify-build-contexts` job actually guards staging (`workflow_run` runs the default-branch copy).
- `packages/api/tests/e2e/stack-lifecycle.test.sh`'s `main:Dockerfile` case stays red until `dev` is promoted to `main` (main's Dockerfile still copies from `linked-modular-api`).
- Full-suite E2E gate: **green** (100 passed / 0 failed / 4 skipped). The one order-dependent failure found during the run was root-caused and fixed — see “Follow-up” below.

## Follow-up: E2E gate root-caused and fixed

The full-suite E2E gate was red on one order-dependent test. Root cause was measured, not inferred:
`public.getUnavailableDaycareDates` returns holidays plus `UNAVAILABLE_FOR_ALL` / `UNAVAILABLE_FOR_DAYCARE`
periods, and `administrator/periods.spec.ts` left behind the cross-month period it created
(`2026-10-01 → 2026-11-01`), which disabled every adjacent-month day in the daycare calendar. Its
`Update period` / `Delete period` tests both acted on `getByRole('listitem').last()` — the last row of
page 1, i.e. a **seeded** row — so they mutated/deleted seed data while the created period survived.

| File | Lines | Description |
|------|-------|-------------|
| `packages/api/tests/e2e/administrator/periods.spec.ts` | 86-92, 103-109 | `Update period` / `Delete period` now target the row carrying this spec's unique comments instead of `listitem.last()`; the trio is self-cleaning and no longer destroys a seeded period |
| `packages/api/playwright.config.ts` | 19-22, 30-36 | Move `timeout: 60000` out of `use:` (where it is not a Playwright option and was silently inert, leaving tests on the 30s default) to the valid root level; also the earlier `globalSetup` + `testMatch` additions from this batch |

Evidence: `getUnavailableDaycareDates` was 54 dates (incl. all of Oct 2026 + 2026-11-01) after a
`periods.spec.ts` run, and is 24 dates (all 2030 seed) after the fix. Full `pnpm run test:e2e` went from
99 passed / 1 failed / 4 skipped to **100 passed / 0 failed / 4 skipped**.

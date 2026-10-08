# Changes: squash-merge daycare-calendar-ux into dev (2026-10-08)

## Result
- Branch `feature/daycare-calendar-ux` (7 commits) squashed into **one** commit on `dev`:
  `55f44207e feat(app): daycare calendar UX discoverability`
- Exactly **1** commit added (`git rev-list --count 06fe04240..HEAD` = 1).
- Rollback point before the merge: `06fe04240` (dev's own unpushed
  `chore: update dependencies`, preserved above the squash).
- Full e2e on merged dev: **121 passed / 5 skipped / 0 failed**.

## Conflicts and how they were resolved (6 files)

`dev` was **106 commits ahead** of the branch point, so several files had moved
underneath the branch. Each resolution kept dev's newer work:

| File | Resolution |
|---|---|
| `.gitignore` | **Union.** Kept dev's `.worktrees/**`, `.pi/fff`, `.scratch/` **and** the branch's showcase artifact rules. |
| `packages/api/playwright.config.ts` | **Took dev.** dev's version is a strict superset: same `testMatch`, plus `globalSetup` and the `PLAYWRIGHT_TEST_FEATURES` gate. The branch's version also referenced `PLAYWRIGHT_ALLOW_SCREENHOTS` — a **typo** (missing S) that would have silently disabled the screenshot gate. |
| `lang/en-US.ts`, `lang/nl.ts`, `lang/index.ts` | **Merged both.** Kept dev's new `selectDaysHint` copy (added independently on dev) **and** the branch's new keys; dropped `addDaycareDates`/`unavailableDate` which the branch deliberately removed. |
| `components/daycare/DaycareForm.vue` | **Merged both.** Kept dev's `selectDaysHint` caption (made `v-if` so it appears with the calendar) **and** the branch's `v-if` fix + first-step prompt. |

## Method (nothing was done blind)
1. Rehearsed the whole squash in a throwaway `git worktree` on `dev`, so the
   conflicts were known and resolvable before touching the real branch.
2. Resolved there, then **reused the exact resolved files** on the real `dev`
   merge — no second guesswork.
3. Verified no conflict markers survived anywhere before committing.
4. A `selectDaysHint`-without-trailing-comma bug I introduced in rehearsal was
   caught and fixed before it reached `dev`.

## Verification
- `pnpm run lint` = 0 · `format:check` = 0 · `PI_RTK_BYPASS=1 pnpm run build` = 0.
- Feature present in dev after merge: new i18n keys (`selectPetToStart`,
  `datesAddedSummary`, `selectDateForDaycare`) and all five `seek-attention` FABs.
- **121 passed / 5 skipped / 0 failed.** The 5 skips are env-gated
  (`PLAYWRIGHT_ALLOW_SCREENSHOTS` / `TEST_FEATURES` / `SLIMFACT`), which is why
  the count is 5 rather than the 3 seen in earlier feature-only runs — the
  merged showcase spec is 4 of them, correctly skipped by default.

## Notes
- The pre-commit hook **rejected** the first commit attempt on `format:check`
  (hand-resolved conflicts weren't formatter-clean). Fixed with
  `format:write` and re-committed; no `--no-verify` at any point.
- Lens reported cascades claiming `PET_ALERTS`/`PET_ALERT_CONDITIONS` missing
  from `@petboarding/tools`. **Verified false** — they exist in tools source and
  in the runtime bundle; the analyzer was reading a **stale `packages/tools/dist`**
  (0 occurrences before a rebuild, 1 after). `build=0` throughout.
- Answer to the earlier question: the **food input fix is already on `dev`** as
  `f08728339 fix(app): render the pet food field at the standard input height`
  (and `11e26681b fix(PetFoodInput): remove negative margin hack`), so it is not
  on a separate branch.

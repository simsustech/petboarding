# Changes: Agenda calendar UX pass (2026-10-01)

Executes plan `/home/stefan/.pi/plans/2026-09-30-agenda-calendar-ux-pass.md` (6 findings;
step 5's (d1) clause amended 2026-10-01 with the plan owner's authorization — the original
"chip is wider than 12em" was unachievable while PetChip keeps `max-width: 12em`).

## New files

| File | Description |
|------|-------------|
| `packages/api/tests/e2e/frontend/agenda.spec.ts` | E2E guards, one per finding: quiet week keeps controls, grid fills the page, mobile reachability, zero counts silent, legend behind a button, day-view measure, badges do not overlap the name (294 lines) |

## Modified files (all hunks accepted)

| File | Lines | Description |
|------|-------|-------------|
| `packages/app/src/components/AgendaComponent.vue` | 131 changed | `emptyPeriod` + `day-container` quiet message; outer `q-scroll-area`/resize-observer removed, calendar `class="col"` + `min-height: 20rem`; `lt-md` swipe hint; `> 0` count guards; Legend `q-btn` + `q-menu`; day-slot `q-mx-auto` 48rem measure |
| `packages/app/src/components/pet/PetChip.vue` | 145 changed | Badge set moved from `q-badge floating` (`top: -10px`) into a wrapped `row items-center q-gutter-xs` inside the label block; all `v-if`s, `max-width: 12em`, `q-mb-md` bottom-badge reservation kept |
| `packages/app/src/pages/employee/AgendaPage.vue` | 27 changed | Empty-state `v-if`/`v-else` q-list and `emptyAgenda` computed removed; `q-page` becomes `class="column"` (fill-height variant: no inline `min-height: 0` — checkpoint-approved deviation from (f)) |
| `packages/app/src/lang/index.ts` | 3 added | `agenda.emptyDay`, `agenda.swipeHint`, `agenda.legend` in the typed interface |
| `packages/app/src/lang/en-US.ts` | 5 changed | English strings for the three new keys |
| `packages/app/src/lang/nl.ts` | 5 changed | Dutch strings for the three new keys |

## Verification

- Per-step red→green E2E + cumulative `(d2)`; final full gate on a fresh stack:
  **89 passed / 6 failed / 4 skipped / 5 not run** — the documented baseline 4
  (`frontend/controls` ×2, `header-titles`, `nav-drift`) plus `account › Add booking` and
  `administrator/periods › Create period`, both **reproduced at HEAD** via stash/rebuild A/B
  (date-dependent q-date commit; they explode on 2026-10-01, baseline was measured 09-30).
  All 7 `agenda.spec.ts` tests pass in the full run.
- `pnpm run lint`, `pnpm run format:check`, `PI_RTK_BYPASS=1 pnpm run build` all pass.
- `impeccable detect` on the three touched components: exit 0, no findings.
- Captures: `packages/api/test-results/ux-verify/step6-final-{desktop,mobile}-{week,day,quiet}.png`.

## Follow-up (same day): day-view measure uses the full 48rem

The visual round caught that the `#day` wrapper hugged content (135px) instead of
filling the measure: `.q-calendar-agenda__day` is `display: flex`, and `q-mx-auto`'s
auto margins disable cross-axis stretch. Fixed by adding `width: 100%` to the wrapper
(same tactic, flex-correct); the step-5 test gained a floor assertion
(`≥ 48rem − 24px`, plan (d1) row amended with the same authorization) — red at 134.8px
before the fix, green at 768px / gaps 203-203 after.

Re-verified: lint/format/build pass; fresh-stack full suite **92 passed / 6 failed /
4 skipped / 2 did not run** — same expected set (baseline 4 + the two HEAD-A/B-proven
date-bombs); all 7 agenda guards green. Day captures re-taken.

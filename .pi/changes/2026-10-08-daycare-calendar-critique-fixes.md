# Changes: daycare calendar critique fixes (2026-10-08)

Implements the fixes from `.impeccable/critique/2026-10-08T15-20-10Z__pages-account-daycarepage-daycarepage-vue-9d9fb49f.md`
(score **23/40**, 2×P1, 4×P2) on `feature/daycare-calendar-ux`.

User decisions: P1s first · **keep the FAB and add the attention animation** ·
everything including minors · nothing off-limits.

## What changed and why

| Change | Reason |
|---|---|
| **Dialog no longer reserves the calendar's space** | `daycare-calendar-month` was `v-show`-hidden until a pet was chosen, but the inner `q-scroll-area` keeps its last measured height — so the create dialog opened as ~600px of blank panel. Switched to `v-if` (**verified: calendar absent from the DOM when no pet is chosen**) and filled the space with a prompt: paw icon + "Select a pet above to start picking dates." |
| **Loading state actually reaches the button** | `submitting` was tracked in `DaycarePage.vue` (314/335/337/350/388) but never passed to `<daycare-form>`, so `:loading="submitting"` was permanently false and the async commit gave no in-flight feedback. Now `:submitting="submitting"`. |
| **Submit moved INSIDE `<q-form>`** | The button declared `type="submit"` while sitting outside the form (form closed at line 22; button at 81-99), so the attribute was inert and Enter never submitted — the commit action was mouse-only. Now inside the form, exactly one submit button. |
| **`seek-attention` on four FABs** | Per user request: pulse the FAB while the thing it creates is still empty — pets, bookings, contact people, daycare. `CustomerPageFabs.vue` already did this for a missing customer; the pattern is extended, not invented. Driven by the real list query so it stops as soon as data exists. |
| **Success copy is one sentence** | Was assembled from three keys into "2 dates were for pets name1". Now `datesAddedSummary(n, pets)` → "2 daycare dates were added for name1." Also dropped `html: true`, removing an XSS path that interpolated user-controlled pet names into HTML. |
| **Stale `+` tooltip replaced** | The calendar's day tooltip still read "Use the + button at the top to add dates." — advice pointing at the exact pattern this branch replaced. Now "Add this date to the daycare request." |
| **Phantom class removed** | `sticky-bottom-buttons` was used in `DaycareForm.vue` and defined in **no** stylesheet (independently corroborated by both assessments), so the "sticky" footer never stuck. |
| **CTA bar made visible** | `bg-grey-1` (#fafafa) on a white card read as a disabled band. Now uses the M3 container token via a real scoped class, paired light/dark the way `NavigationTabs` does — **verified rendered in the regenerated screenshot**. |
| **Dead i18n key removed** | `unavailableDate` was added by this branch and rendered nowhere. |

## Modified files (all hunks accepted)
| File | Lines | Description |
|------|-------|-------------|
| `packages/app/src/components/daycare/DaycareForm.vue` | ±60 | Calendar `v-show`→`v-if` + empty prompt; submit moved inside the form; phantom class removed; duplicate button deleted. |
| `packages/app/src/pages/account/DaycarePage/DaycarePage.vue` | +30 | `:submitting` passed; success message rewritten; stale tooltip replaced; `cta-bar` class + scoped style. |
| `packages/app/src/pages/account/{PetsPage,BookingsPage,ContactPeoplePage}/…Fabs.vue` | +4 each | `seek-attention` wired to the page's own list query. |
| `packages/app/src/pages/account/DaycarePage/DaycarePageFabs.vue` | +5 | Same. |
| `packages/app/src/lang/{en-US,nl,index}.ts` | ±12 each | `selectPetToStart`, `datesAddedSummary`, `selectDateForDaycare` added; `datesAddedCount`, `forPets`, `addDaycareDates`, `unavailableDate` removed. |
| `showcase/daycare-calendar-ux/after/*.png` | 4 files | Regenerated against the fixed app via the showcase spec. |

## Verification (measured on a freshly rebuilt image + fresh DB)
- **FAB pulse**: `#fabAdd` computed `animation-name: uneTada`, `iteration-count: infinite`; transform matrix changes between samples (`0.978` → `1.099` scale), so the animation genuinely runs. Off on pages that already have data — checked all five account routes against the seed.
- **Dialog**: calendar **absent from the DOM** with no pet (`count: 0`), present with 25 enabled day buttons after choosing one.
- **Counter + gating**: chip "1 date selected"; submit `disabled: true` → `false` once a date exists.
- **CTA bar**: confirmed cyan M3 container in the regenerated screenshot.
- **Type safety**: `vue-tsc` reports **zero** errors in every file I touched. The only two it reports are pre-existing config errors (`vitrify/client` types, `baseUrl` deprecation) — **proved pre-existing** by running `vue-tsc` on a stashed clean tree and getting identical output.
- Gates: `lint`=0 · `format:check`=0 · `build`=0 · frontend e2e **44 passed / 0 failed** · showcase **4 passed**.

## Not fixed, deliberately (documented rather than claimed)
- **The ~852px dialog frame.** The frame height comes from the shared `ResponsiveDialog` (`q-layout view="LHh lpR fff"`, `min-width: 85vw`). Fixing it means patching `@simsustech/quasar-components`, which **ADR 002 forbids**. My change removed the *silence* (a prompt now explains the step) — the frame is still larger than its content. This needs an upstream changeset.
- **Enter-to-submit.** I moved the button inside the form, which is correct, but I could **not** confirm Enter submits end-to-end, because the terms checkbox would not tick under any interaction (click, forced click, raw mouse at centre, Space). I verified the **same checkbox fails in the booking dialog** — a feature I never touched — so this is pre-existing and app-wide, not a regression from this work. It needs its own investigation.
- **The 0-selectable-dates state I chased was runtime data, not code**: `periods.id=13` (2026-10-07→2026-11-01, `unavailableforall`) was created at 15:51 via the API, one minute after the seed, and blocked the whole current month. Cleared by `down --volumes`; the fresh DB has 0 blocking periods. The seed itself only creates 2030-06-* periods.

## Notes
- The **app image is built from source**, so frontend edits need `docker compose build app` before browser evidence is trustworthy. I caught a stale image mid-run (served bundle had the old strings, none of the new) — the same trap that produced a false "running app" finding earlier.
- `impeccable detect` on the changed files: exit 0, **0 findings**.

---
target: daycare calendar UX (feature/daycare-calendar-ux @ cce178826)
total_score: 23
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:/home/stefan/Projects/petboarding/packages/app/src/pages/account/DaycarePage/DaycarePage.vue"
target_fingerprint: "sha256:1aa1aa108421e48d9b07e1a2dc939865925ef78551202f6ff5d16a35f709182f"
target_path: /home/stefan/Projects/petboarding/packages/app/src/pages/account/DaycarePage/DaycarePage.vue
timestamp: 2026-10-08T15-20-10Z
slug: pages-account-daycarepage-daycarepage-vue-9d9fb49f
---
## Design Health Score

Method: dual-agent (A: delegate/623cd3e5 design review · B: delegate/f091a14e detector+browser), plus parent verification against a freshly rebuilt app. Assessment B's browser evidence was voided as STALE (the running image predated the branch); the parent rebuilt and re-captured before synthesis.

Target: daycare calendar UX discoverability, branch `feature/daycare-calendar-ux`, commit `cce178826`.

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Counter chip, success dialog, error notify all work (verified live). Loading state never shows: `submitting` is tracked in DaycarePage.vue but never passed to `<daycare-form>`. |
| 2 | Match System / Real World | 2 | Success copy is a broken sentence: "2 dates were for pets name1". `selectDatesThenSave` says "tap Add" while the button says "Add daycare". |
| 3 | User Control and Freedom | 2 | Create dialog is `persistent`, so Esc/backdrop cannot dismiss it; the only exit is the small X. |
| 4 | Consistency and Standards | 2 | Customer CTA bar (icon+title+subtitle+button) vs admin's bare chip; count formatted two ways. Three triggers for one action on the customer page. |
| 5 | Error Prevention | 2 | Submit is disabled until dates are picked (good). But the disabled tooltip is the only instruction and needs a forced hover; validation error text has a typo ("acccept"). |
| 6 | Recognition Rather Than Recall | 3 | The branch's real win: empty state + CTA bar make the entry point visible instead of remembered. |
| 7 | Flexibility and Efficiency | 2 | Button is `type="submit"` but sits OUTSIDE `<q-form>`, so it is inert for keyboard/Enter submission; mouse click is the only path. Also no loading state to re-tap against. |
| 8 | Aesthetic and Minimalist Design | 3 | Selected count appears three times in one dialog (chip + "(N)" on button + success dialog). |
| 9 | Error Recovery | 1 | On mutation failure the notify dumps `e.message` raw, which is not user-facing language. |
| 10 | Help and Documentation | 2 | Inline hints are good, but the original "+ button" tooltip string still ships and now points at an older mental model. |
| **Total** | | **23/40** | **Acceptable** |

## Design Specificity Verdict

**Mostly authored-for-this-product at the domain level, category-interchangeable in execution.** The vocabulary is genuinely Petboarding's (daycare subscriptions, Pending/Approved/Standby/Rejected legend, "for pets {names}"). But the treatment is a generic washed `bg-grey-1` CTA bar + default Quasar primary button + text-only chip. Swap two strings and it would work unchanged on any booking app.

**LLM assessment**: The branch solved the stated problem at the page level and solved it well. The craft problem is that the fix is *additive*: it introduced new CTAs without retiring the old `+` affordance, so the page now offers three triggers for one action (persistent M3 `+` FAB via `DaycarePageFabs.vue`, the new CTA bar, and the in-dialog submit). The origin complaint was "the + button is too hidden" — and the `+` FAB is still there.

**Deterministic scan**: `impeccable detect --json` on the three changed files — exit 0, **0 findings**. The detector is clean; every finding below came from review and live measurement.

**Visual overlays**: none. Assessment B confirmed mutation was available but the detector reported 0 findings, so there was nothing to overlay.

## Overall Impression

A real fix for a real complaint, undermined by additive duplication and unfinished states. The happy path now works end-to-end and is verifiably better than before (I drove it: select pet → pick 2 days → chip reads "2 dates selected" → submit enables → success dialog "Daycare dates added / 2 dates were for pets name1"). The single biggest opportunity is to *subtract*: remove the now-redundant `+` FAB once the CTA bar exists, and stop the empty dialog from presenting 600px of void.

## What's Working

1. **The core complaint is genuinely fixed.** Empty state and CTA bar turn a bare `+` into a labelled primary action with an explanatory subtitle. Verified live at both 1440x900 and 390x844.
2. **Live feedback closes the loop.** The counter chip ("2 dates selected") plus the success dialog naming count and pets is a real improvement in system status.
3. **The submit is correctly gated.** Disabled until a date exists, with an inline hint chip ("Click a date to select it.") — verified: chip appears, submit enabled only after selection.

## Priority Issues

- **[P1] The create dialog opens as a mostly-empty void.** Measured: desktop dialog ~810px tall with content in the top third; mobile full-screen with ~540px empty. Cause: the calendar is `v-show`-hidden until a pet is selected, but the dialog still reserves its height. First-time users tap the new prominent CTA and meet a blank screen with one floating button.
  - **Why it matters**: it converts the branch's headline improvement into a confusing first impression at exactly the moment the branch was built to fix.
  - **Fix**: collapse the reserved space (`v-if` or a sized placeholder), or front-load the pet step so the dialog's content matches its frame.
  - **Suggested command**: `/impeccable layout`

- **[P1] Loading state is wired but never shows.** `submitting` is tracked in `DaycarePage.vue:314-388` but never passed to `<daycare-form>` (163-175), so `:loading="submitting"` (DaycareForm.vue:88) is permanently false during the network round-trip.
  - **Why it matters**: no in-flight feedback invites double-taps on an async mutation.
  - **Fix**: pass `:submitting="submitting"`, and/or drive the button's loading off the submit handler directly.
  - **Suggested command**: `/impeccable harden`

- **[P2] The primary button cannot submit by keyboard.** It is declared `type="submit"` but rendered *outside* `<q-form>` (form closes at DaycareForm.vue:22; button is at 81-99), so `type="submit"` is inert and Enter does not submit. The working path is a mouse click.
  - **Why it matters**: keyboard users cannot complete the primary task; the attribute also misleads maintainers into thinking it is connected.
  - **Fix**: move the button inside the form, or drop `type="submit"` and emit through the dialog's real submit path.
  - **Suggested command**: `/impeccable harden`

- **[P2] Three triggers for one action; the original `+` was never retired.** `DaycarePageFabs.vue` still emits `account-open-daycare-create-dialog`, alongside the new CTA bar and the dialog submit.
  - **Why it matters**: the complaint was "the `+` is too hidden"; leaving it in place means users must now choose between redundant affordances with no reason to prefer one.
  - **Fix**: retire the FAB on this route now the CTA bar carries the action.
  - **Suggested command**: `/impeccable distill`

- **[P2] Success copy does not parse.** Renders "2 dates were for pets name1" (assembled from `datesAdded` + `datesAddedCount` + `forPets` in DaycarePage.vue:365-367).
  - **Why it matters**: confirmation copy is the last thing read and it reads as broken.
  - **Fix**: one template per locale, e.g. "Added {n} daycare dates for {pets}." / "2 dates were added for pets name1."
  - **Suggested command**: `/impeccable clarify`

- **[P2] Stale string still shipped.** `addDaycareDates` — "Use the + button at the top to add dates." — remains in en-US.ts/nl.ts/index.ts and renders as the calendar day tooltip, pointing users at the very pattern the branch replaced.
  - **Why it matters**: it preserves the confusing mental model the branch was raised to remove.
  - **Fix**: replace with an action-naming string ("Select this date for daycare") or delete the key.
  - **Suggested command**: `/impeccable clarify`

## Persona Red Flags

**Alex (Power User)**: Enter does not submit — the primary button is outside the form, so the fast path is mouse-only. No keyboard accelerator for "select today" or repeated dates.

**Jordan (First-Timer)**: Opens the dialog from the new CTA and finds ~600px of whitespace (desktop) / ~540px (mobile) with one button; nothing states that a pet must be chosen before the calendar appears. The dialog is `persistent`, so Esc does not close it.

**Sam (Accessibility)**: Calendar day cells expose bare numbers without an action label, so a screen reader hears "8" not "Select 8 October". The only instruction ("Click a date to select it.") sits on a *disabled* button; it is reachable by hover (I verified it renders), but not by keyboard focus, so it is invisible to keyboard users.

**Riley (Stress Tester)**: Double-tap risk on submit with no loading state. Also note `datesAdded` uses `daycareDates[0]?.petIds` for the pet list, so a multi-pet selection reports names from the first entry only.

**Casey (Mobile)**: Mobile dialog is full-screen with the primary action in the middle of the viewport and large empty regions above/below; the bottom tab bar sits under the dialog.

## Minor Observations

- `sticky-bottom-buttons` (DaycareForm.vue:81) is a **phantom class with no definition anywhere** — corroborated independently by both assessments. The button is not sticky.
- The count is shown three times in the dialog: chip "2 dates selected", button "(2)", and the success dialog.
- `unavailableDate` i18n key is defined but never rendered — dead string.
- The CTA bar's `bg-grey-1` (#fafafa) is near-invisible against the white card, so the primary call to action reads as a disabled band.
- The showcase spec (`showcase-daycare-calendar-ux.spec.ts`) contains **0 assertions** — it is screenshot-only, so none of the above is regression-guarded.
- Locale metaphor drift: en "Tap the button below" vs nl "Klik op de knop hieronder".
- **Pre-existing, not this branch**: the validation string "You need to acccept the terms and conditions." has a typo (three c's), traced to the initial `feat: petboarding` commit.

## Questions to Consider

- If the complaint was "the `+` is too hidden", why does the `+` FAB still exist on the same screen as its replacement?
- Should the dialog exist before a pet is chosen, or is the pet the real first step?
- Why does the commit button show no in-flight state when the branch's purpose is making this action trustworthy?
- Is the count needed in three places, or does one authoritative position suffice?

## Corrected during verification

Two plausible defects were **disproved** by measurement and are deliberately not reported as issues: (a) the disabled-button tooltip *does* render on real hover; (b) validation failure is *not* silent — an inline error appears. Assessment A asserted both as defects; live testing corrected them.

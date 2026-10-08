---
target: kennel picker dialog
total_score: 24
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:/home/stefan/Projects/petboarding/packages/app/src/components/kennelLayout/KennelPickerDialog.vue"
target_fingerprint: "sha256:fb7941f1d2af324665a7c602e5c1d6b0aafafff67e4558e9a1412de174bb8454"
target_path: /home/stefan/Projects/petboarding/packages/app/src/components/kennelLayout/KennelPickerDialog.vue
timestamp: 2026-10-08T06-48-51Z
slug: nents-kennellayout-kennelpickerdialog-vue-9cd162ea
closed: true
---
# Critique — Kennel Picker Dialog

Target: packages/app/src/components/kennelLayout/KennelPickerDialog.vue (+ call site packages/app/src/pages/employee/KennelLayout.vue)

Method: dual-agent (A: delegate/bb2b3405 — design review, re-run after the first A timed out 30min on a broken stack; B: delegate/400c3338 — detector + browser evidence) + parent browser evidence.
Provenance note: Assessment B ran before an environment repair (its stack had a crashed app container plus a running dev stack, so #pickerDialog never rendered for it). The dev stack was stopped, the e2e test stack recreated with a fresh seed, the dialog verified opening (repo spec 3/3; then first-hand capture). B's dialog-open observation is superseded and excluded from findings; its CLI and console evidence stands.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | No confirmation after assign; unhandled mutation errors; no loading state |
| 2 | Match System / Real World | 3 | Domain vocabulary fits; "Rating: N" is not operational language |
| 3 | User Control and Freedom | 3 | Back/close/Escape/overlay present; no undo, no confirmation |
| 4 | Consistency and Standards | 2 | Overline token reused for a score (DESIGN.md violation); ADR 005 copy drift; hardcoded ramp |
| 5 | Error Prevention | 3 | Self-exclusion + same-target no-op; no guard on a rating-1 conflict |
| 6 | Recognition Rather Than Recall | 1 | Colour ramp is a memorised code with no in-dialog legend; pet identity only in the title |
| 7 | Flexibility and Efficiency | 3 | Keyboard works; kennel list unsearchable, no free-only filter |
| 8 | Aesthetic and Minimalist Design | 3 | Calm and on-brand; empty kennel list is dead space |
| 9 | Error Recovery | 2 | No error surface; failed mutation closes silently |
| 10 | Help and Documentation | 2 | No inline legend or tooltip for the rating |
| Total | | 24/40 | Acceptable — significant improvements needed |

Mode applicability: Operate surface, all ten heuristics scored, maximum 40.

## Design Specificity Verdict

Product-specific. Structural evidence: PetChip is reused verbatim so an occupant is the same chip the page behind renders; the page colour system is mirrored; and the dialog encodes a boarding-specific concept — the picked pet's compatibility rating with this occupant (petKennel.relations) — surfaced as chip tint plus an overline. The dialog is also the product's WCAG 2.5.7 answer (ADR 005), so it is load-bearing rather than decorative.

Deterministic scan: impeccable detect --json on both files returned [] (exit 0, zero findings). Browser console during the live pass reported 10 anti-patterns: layout-transition x3, gray-on-color x7, nested-cards x2. The gray-on-color group agrees with the review and with measurement: the rating overline renders #3f4949 (Slate Ink) on orange-500, measured about 3:1, below AA 4.5:1 at 12px. nested-cards hits are the q-card composition inside the dialog (arguable/intentional). layout-transition fires on the two-level swap.

Visual overlays: none available for this run (Assessment B's injection predated the environment repair; the parent pass captured evidence only). No user-visible overlay is claimed.

## Overall Impression

The interaction is right; the decision support is backwards. Staff get a clean, accessible, product-native path to a per-kennel choice, and then the signal that makes the choice informed (compatibility) is rendered in the lowest-emphasis token, only where a kennel is already taken, using a colour code nothing on screen explains. The kennels they will actually pick — the empty ones — are ten identical numbers with no focus ring (measured outline: solid 0px) and no hover fill.

## What's Working

1. One interaction for mouse, touch and keyboard: tap to open the picker, rows with tabindex=0 and Enter/Space, replacing HTML5 drag & drop that never worked on touch. Verified live: chip renders q-chip--clickable cursor-pointer q-hoverable with tabindex=0.
2. Colour continuity with the page: same PetChip, same booking/daycare base colours, and the rating tint visibly renders — measured chip background rgb(249,115,22) (orange-500) for rating 3; all rating classes verified present in the built CSS.
3. The two embarrassing-bug edge cases are handled and commented: self-exclusion (verified live: own kennel shows 0 chips) and the same-target no-op close. The waitlist pill uses the exact secondary-container / on-secondary-container pair (measured rgb(204,232,233) / rgb(4,31,32)), and the dialog does not widen the document at 375px.

## Priority Issues

[P1] Compatibility is the least legible thing on the surface.
- What: "Rating: N" renders as the 12px/2px-tracked overline token in #3f4949 on the rating tint (measured ~3:1 on orange-500), subordinate to the chip's food line; present only for occupied kennels; no in-dialog legend (PetLegend is behind the dialog).
- Why it matters: This is the reason staff open the picker; burying it risks the bad placement the feature exists to prevent.
- Fix: Promote the rating to a defined label (14px/500) or a semantic word (Poor/OK/Good), with a contrast-safe pairing; add a compact in-dialog legend.
- Suggested: /impeccable clarify then /impeccable colorize.

[P1] Available and occupied kennels are one flat list of ten numbers.
- What: 56px bare numerals; the occupied row is ungrouped and the word "occupied" appears nowhere. Measured row heights: occupied 133px vs empty 56px (a page-scale chip 127x96 sits in one row).
- Why it matters: The most common action (find a free kennel) is a pure number scan; the chip size makes list rhythm read as "row 2 is broken".
- Fix: Make occupancy explicit and dense (compact chip variant, "Free 8 - Occupied 2" summary or split, self-describing row state).
- Suggested: /impeccable layout then /impeccable distill.

[P1] No confirmation, no undo, no error surface on assign.
- What: onSelectKennel awaits setPetKennel then closes; success is silent, rejection unhandled, and ADR 005 records "no undo".
- Why it matters: Tap-driven 38-56px rows; the drag-parity justification for no undo no longer holds.
- Fix: Snackbar with Undo (Notify.create pattern already exists) and surface mutation errors.
- Suggested: /impeccable harden.

[P2] Keyboard/AT semantics and focus management incomplete.
- What: rows are tabindex=0 divs with no role/accessible name; no focus move on the level-1 to level-2 transition; icon-only close has no aria-label; the waitlist pill meaning is unaudible; measured focus ring outline: solid 0px.
- Why it matters: The feature's justification is accessibility; Sam and Alex cannot use it reliably.
- Fix: Move focus on level change; add roles and accessible names ("Kennel 4, free" / "Kennel 2, occupied by name4, rating 3"); aria-label the close button; ensure a visible focus ring.
- Suggested: /impeccable audit.

[P2] Loading/empty states blank; the rating ramp bypasses the token system with no dark counterpart.
- What: opening before data resolves renders an empty dialog with no indicator; a 0-kennel building is a bare chevron; the ramp is hardcoded Tailwind classes rather than semantic rating tokens.
- Why it matters: DESIGN.md forbids hardcoded hexes and requires dark parity; blank first paint reads as broken.
- Fix: Lightweight loading/empty line per level; move the ramp to documented semantic tokens with a dark variant.
- Suggested: /impeccable harden then /impeccable document.

[P3] ADR 005 copy drift and cramped mobile chip.
- What: ADR 005 line 62 still quotes "Tap a pet to place it in a kennel." while en-US.ts:624 now reads "Click on a pet, then choose a kennel or the waiting list." (verified). At 375px the occupant chip's overline abuts the chip edge.
- Why it matters: The discoverability affordance and its decision record disagree; the mobile chip is cramped.
- Fix: Reconcile the ADR line with shipped copy; give the picker a compact chip variant on mobile.
- Suggested: /impeccable clarify.

## Persona Red Flags

Alex (power user): Enter opens the picker, but on the level transition focus stays on the unmounted building row so subsequent Tabs land unpredictably; no kennel search/type-ahead; no free-only filter; current-kennel mark is a small colour-only check.

Sam (screen reader/keyboard): rows expose no role or action; the first content a reader reaches per row is the chip's "Rating: 3, name4 las..., 2x 239 gr. Generic" — never "occupied" or "kennel"; the close button is icon-only without an accessible name; the rating's meaning is colour-only; measured focus ring solid 0px.

Casey (one-handed 375px): close and back both top-left (opposite a right thumb); back control ~32px; rows 56px with a 133px occupied band; an accidental tap commits instantly with no undo and no confirmation, on a surface whose ADR removed drag for touch safety.

## Minor Observations

- False positive to discard: the concern that Tailwind rating classes might not be emitted is disproven — all rating classes are present in the built CSS and orange renders live.
- False positive to discard: an apparent translucent dialog was a fade frame; settled measurement shows opaque Paper rgb(250,253,252) on a rgba(0,0,0,0.4) scrim.
- Level-1 row counts show bare numbers ("10") with no unit; the current-assignment check uses positive green, outside the five fixed status meanings.
- Pre-existing (not this feature): KennelLayout.vue passes both :overline and a literal overline="{{ getOverline(pet) }}" — a dead prop that can render the literal braces.
- The waitlist pill's 32px/16px are correct values but hardcoded rather than size tokens.

## Questions to Consider

1. If the most common action is "put this pet in a free kennel", is a rating-colour system optimised for the wrong case — and should empty kennels become the louder state?
2. Is "Rating: 3" actionable without a legend? If not, the ramp is the interface and belongs inside the dialog, not on the page behind it.
3. Why is there still no undo, when the interaction changed from a deliberate drag to a 56px tap?
4. What should a screen reader hear on landing at kennel 2 — and is that sentence currently even constructible from the DOM as built?

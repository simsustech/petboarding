---
target: the PetAlerts block on the PetCard
total_score: 13
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 2
target_identity: "file:/home/stefan/Projects/petboarding/.worktrees/pet-alerts-redesign/packages/app/packages/app/src/components/pet/PetCard.vue"
timestamp: 2026-10-14T16-19-00Z
slug: packages-app-src-components-pet-petcard-vue
---
# Critique — PetAlerts on the PetCard (`packages/app/src/components/pet/PetCard.vue`, lines 176–218)

Method: dual-agent (A: reviewer/deepseek-v4.1-flash:high — full design review · B: delegate/deepseek-v4.1-flash — detector + browser evidence). B's child hit the 30-minute cap while stopping its `live-server` and was killed before writing prose; its measured artifacts (`test-results/petalerts-b/evidence.json`, `clean.json`, screenshots) are read directly, and its numbers are cross-confirmed by the supervisor's own instrumented run against a private stack (`petalerts.localhost:8443`, byte-identical `PetCard.vue`).

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|:-----:|-----------|
| 1 | Visibility of system status | 1 | The row's whole text is `Alerts Aggressive Diabetic` — no date, no in-force state. Expired and live alerts render identically. |
| 2 | Match system / real world | 2 | Vocabulary is right and bilingual, but the real-world object is a *window*; the UI shows an undated attribute. |
| 3 | User control and freedom | 2 | Create and confirm-gated delete exist, but there is no edit: correcting a window means delete + recreate. |
| 4 | Consistency and standards | 1 | No accessible name on any control in the block (both × plus the `+`), where the repo requires one; `dense` is not a `QBadge` prop; 12px chip label vs the design system's 14px/500 chip; a 48px control inside a 16px chip. |
| 5 | Error prevention | 1 | Clicking the × painted on "Aggressive" opens the delete confirmation for "Diabetic" — proven. |
| 6 | Recognition rather than recall | 1 | The dates are revealed only inside the delete confirmation; the fastest way to read a window is to attempt destruction. |
| 7 | Flexibility and efficiency | 1 | No edit, no sort/filter by window, no bulk; every window change is delete + re-create + confirm. |
| 8 | Aesthetic and minimalist design | 2 | The chips are calm and compact and do pop at scan distance, but a teal 13.7px glyph sits on a red pill, and hovering it paints a 48px overlay on a 16px chip. |
| 9 | Error recovery | 1 | A failed delete produces nothing at all — no toast, no state, no undo. |
| 10 | Help and documentation | 1 | The `title` repeats the visible label verbatim; nothing explains what an alert is. |
| **Total** | | **13/40** | **Poor** |

(Assessment A scored 14/40, giving 2 to heuristics 3 and 5. Heuristic 5 drops to 1 here because the wrong-record delete is measured, not inferred.)

## Design Specificity Verdict

**Identity-specific data wearing category-interchangeable chrome.** The data layer is genuinely this product's: a closed set of four kennel conditions in staff language ("Loops", "Aanvallend"), each bound to one colour, icon and i18n key from a single source (`PET_ALERT_CONDITIONS`, `configuration.ts:39–54`). The pixels are not: what renders is the generic "tag list with remove" pattern, assembled from library defaults — a 12px Quasar badge, a 13.7px close-circle glyph in the primary teal, a 48px control, and `q-item-label header` where every sibling field uses `q-item-label overline`. A competitor could lift the markup verbatim.

**Deterministic scan.** `impeccable detect --json src/components/pet/PetCard.vue` → `[]`, exit 0 (no static findings). The in-page overlay **did** load (script fetched from `http://localhost:8400/detect.js`, `scriptLoaded: true`, `scriptErrored: false`, no mixed-content block) and reported **5 anti-patterns** on `/employee/pets/2`:

- `low-contrast` — 2.8:1 (need 4.5:1) — text `#ffffff` on `#f87171` ← the "Aggressive" chip
- `low-contrast` — 2.5:1 (need 4.5:1) — text `#ffffff` on `#60a5fa` ← the "Diabetic" chip
- `wide-tracking` — `letter-spacing: 0.17em` on body text ← **false positive**: that is `text-overline`, which `DESIGN.md` names as a deliberate token ("The Overline Rule … never 'fix' it to a body face")
- `layout-transition` ×2 — `transition: max-width` (page-level, not from this block)

The detector found the contrast failures and nothing else about this block; it did not and cannot see the date gap, the ambiguous glyph, or the mis-targeted control — those came from the browser measurements.

**Visual overlays.** Injection succeeded, so the flag were reported through the page console; the overlay server was stopped and a stray instance killed. No overlay is left running.

## Overall Impression

The section knows *what* it is and has the right data; it renders none of the facts that make an alert actionable, and its single control is mis-aimed, unnamed and mis-sized. The biggest opportunity is not decoration — it is turning one line of chips into a readable, dated record with an explicit action.

## What's Working

1. **One source of truth for the vocabulary.** `PET_ALERT_CONDITIONS` drives colour, icon and label; a new condition cannot ship without all three.
2. **Structural conformity.** The block reuses the exact Vaccinations/Relations skeleton (`q-list` → `q-item` → label + side action), so the card scans predictably.
3. **Colour spent on meaning.** The chips are the only saturated pixels in the lower card, and each also carries an icon and a text label — never hue alone.

## Priority Issues

### P0 — The × painted on "Aggressive" deletes "Diabetic"
**What:** the delete control is a Quasar `q-btn` whose box is **48×48** (`min-height/min-width: var(--q-control-height)`) inside a **16px-tall** chip (`q-badge { height: 16px }`). It overflows its chip by 16px above and 16px below, while consecutive chips sit **4px** apart, so the two buttons overlap by ~35×28px.
**Proof:** clicking the centre of the visible glyph on the *Aggressive* chip (234.5, 813.6) hits `span.q-btn__content` inside the **Diabetic** chip, and the confirmation dialog reads `Alerts Diabetic (name2) — - → -`. Playwright itself refuses to hover that button: "subtree intercepts pointer events".
**Why it matters:** it is a wrong-record destructive action on a safety record, one confirm-dialog "OK" away.
**Fix:** take the control out of the chip and give each alert its own row action, sized to the row (the card's other row actions are 48px).
**Command:** `/impeccable harden`

### P0 — The date window is never rendered
**What:** the row's entire text is `Alerts Aggressive Diabetic`; `dateish: []`. `startDate`/`endDate` exist, are collected by the form, and are already formatted for the *delete* dialog.
**Why it matters:** the window *is* the alert. "Loops" is a ~3-week window; an expired alert is indistinguishable from a live one, so staff over- or under-react — the two failure modes the feature exists to prevent. It also contradicts PRODUCT.md principle 5 ("Compliance is product surface").
**Fix:** render the window as an overline per The Overline Rule, with words for open-ended windows (`Ongoing`, `since`, `until`) instead of `- → -`.
**Command:** `/impeccable clarify`, then `/impeccable layout`

### P1 — No control in the block has an accessible name
**What:** `accName: ""` for both delete buttons **and** the `+` add button; the icon is `aria-hidden` and the `title` sits on the badge, not the button. The repo's own standard (PRODUCT.md) requires accessible names on icon buttons.
**Fix:** `aria-label` + tooltip on each row action, and one on the add button.
**Command:** `/impeccable harden`, then `/impeccable audit`

### P1 — White label on every status fill fails contrast
**Measured:** red `#f87171` **2.77:1** · blue `#60a5fa` **2.54:1** · pink `#f472b6` **2.65:1** · yellow `#facc15` **1.53:1** — all below 4.5:1 for 12px/500 text (and below 3:1). The teal `#00696d` glyph itself measures 2.34–2.55:1 on red/blue/pink.
**Fix:** the design system already answers this — `chip-status` is a status fill with **ink** text (`text-on-surface`), which measures 6.2:1 (red), 6.7:1 (blue/pink), 12.2:1 (yellow). Dark mode must be re-measured either way.
**Command:** `/impeccable colorize`, then `/impeccable distill`

### P2 — The window is readable only through destruction, and adjacent defects cluster around it
- No edit path, although `useEmployeeUpdateAlert` and `PetAlertsForm.functions.setValue` both exist and are unused (dead code + missing feature).
- `createAlert` merges the *form payload*, not the server row, so a just-added alert has `id: undefined`: its delete silently no-ops (`if (alert.id && modelValue.value.id)`) and `:key="alert.id || alert.condition"` can collide with an existing alert of the same condition.
- `dense` on `q-badge` is not a prop → dead attribute in the DOM.
- The section label uses `q-item-label header` where the card's other fields use `q-item-label overline`.
- The dialog's confirm button is the default "OK", not a verb, and its title repeats "Alerts" instead of naming the action.
- `PetAlertsForm` validates only `condition`, never `endDate >= startDate`, and never resets between opens (a second alert can inherit the previous one's dates).
- The form's `format="DD-MM-YYYY"` disagrees with the read path's locale long-date.
**Command:** `/impeccable clarify`, then `/impeccable harden`

## Persona Red Flags

**Facility staff (the operate-mode tie-breaker user):** cannot answer "is this in force?"; cannot fix a mistyped window; the fastest way to read a window is to attempt deletion; and one of the two × buttons acts on the other alert.

**Sam (screen reader / keyboard):** both delete buttons and the add button announce as unnamed "button"; the confirm dialog's action is "OK"; the only route to the dates is the destructive one.

**Casey (mobile, one-handed):** the hit box is 48px (meets the floor) but the *visible* target is a 13.7px glyph on a 16px pill, and the neighbouring alert's button covers it — so the thing you can see and the thing that receives the tap are different records.

## Minor Observations

1. `PET_ALERT_COLORS[...]` composed into `bg-${...}` is a latent on-demand-CSS trap: the four `bg-*` classes exist only because those class names happen to appear statically elsewhere in the app (the same hazard `configuration.ts` already documents for icons). A literal class map would make it structural.
2. `PET_ALERTS` gives "Needs rest" the colour `yellow`, which `DESIGN.md` reserves for "reserve"/standby — the same card can show yellow for two meanings.
3. `formatDate` returns long dates ("January 5, 2024") and `'-'` for null; reused in a 300px row it needs a compact form and a word for "no window".
4. The delete confirmation repeats the pet's name inside a per-pet card and prints a raw `→`.
5. Deceased pets render the card on `bg-grey-5`; the chip colours were not re-checked against that surface.

## Questions to Consider

1. Why is the delete dialog the only place a window is allowed to be read?
2. Why does an empty field ("Chip number") get a full labelled row, while a live safety alert gets a 16px pill with a 1.53:1 label?
3. The vaccination section already shows a dated compliance fact well — why invent a chip-with-an-x instead of following it?
4. If "Needs rest" and "Standby" can both be yellow with opposite meanings, what does "yellow always means reserve" still mean?

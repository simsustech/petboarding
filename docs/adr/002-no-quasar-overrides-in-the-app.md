# ADR 002: no Quasar or preset overrides in the app

- Status: accepted
- Date: 2026-09-28
- Context: the z-index override chain (`.q-header { z-index: 7100 !important }` forcing
  `.q-dialog { z-index: 7200 !important }` after it), the frontend audit's 13 `!important`
  declarations across 5 files, and the 7 files carrying `:deep(.q-*)` rules

## Context

Petboarding accumulates local overrides of Quasar's own CSS. Each one starts as a real
defect: the preset's overlay drawer sat at z-index 7000, above the app bar's 2000, so at
375px the open drawer covered the header's controls and the header was raised to 7100.
That put the header above Quasar's dialog layer (6000), and `ResponsiveDialog` renders
fullscreen with its Submit button at y<50, so ten create/edit e2e specs burnt their budget
on `text=Submit` and the dialog was raised to 7200 after it.

Raising a z-index to fix one conflict therefore *creates* the next one, and the fixes only
make sense in the order they were written. The audit found the same shape elsewhere: 13
`!important` declarations across 5 files, and 7 files carrying `:deep(.q-*)` rules. Two of
them made the pattern undeniable — `DaycareCalendarMonth.vue` and `OccupancyPage.vue` held
byte-identical `.q-calendar-month__body` overrides, and `PetLabel.vue` and
`BookingLabel.vue` held byte-identical `.q-field--standard` control overrides. A duplicate
rule in two files is a shared defect nobody owns.

## Decision

**A defect in Quasar or in `unocss-preset-quasar` is fixed there, with a changeset. The app
keeps only what is app policy.**

- The preset owns layering. `unocss-preset-quasar` ADR 0007 sets overlay drawer 1500 <
  marginals 2000 < menus/dialogs 6000, so neither `.q-header` nor `.q-dialog` needs a local
  z-index; both overrides are deleted.
- The preset owns the ported-library port. The two divergences this sweep found —
  `.q-calendar-month__body { overflow-x: auto }` and `.q-field__before:empty { display:
  none }` — ship there with a changeset (`.changeset/calendar-body-scrolls.md`,
  `.changeset/field-empty-before-hidden.md`) and a comment naming the upstream source.
- The app keeps only what is app policy, each with a comment saying why it cannot be
  generic: this app's toolbar height (`.q-drawer--fixed { top: 50px }`), a display variant
  it chose (transparent `.q-field--standard` controls), one component's own layout
  (`.pet-food-input`), and a class Quasar does not ship (there is no navigation-rail
  component, so `.navigation-rail` is this app's).
- No new opt-in surface is invented for the preset. Its only hooks are `plugins` and
  `appExtensions`, and `appExtensions` is for third-party Quasar UI libraries whose CSS the
  preset ports; there is no "consumer turns this variant on" precedent, so a rule either
  belongs to everyone or stays local.

### Why not

Raising the layer locally again — it recreates the chain ADR 0007 removes and the next
conflict lands one z-index higher. Hiding the duplicate in a second copy of the rule — the
two copies drift, and the shared defect stays unowned upstream.

## Consequences

- The app's remaining overrides are enumerated here with their reasons:

  - `layouts/MainLayout.vue` — `.q-drawer--fixed { top: 50px !important }`: this app's
    toolbar height; no universal value the preset could use.
  - `layouts/NavigationTabs.vue` — 4 rail rules (`.q-tab__content`, `.q-tab__indicator`,
    the dark indicator, `.q-tab--active` colour): Quasar ships no navigation-rail component,
    and the preset's `.q-tab--active { color: primary }` is a faithful port that is correct
    for tabs and wrong for a rail.
  - `components/pet/PetLabel.vue`, `components/booking/BookingLabel.vue` —
    `:deep(.q-field--standard) .q-field__control { background: transparent }`: a display
    variant this app chose; making standard controls transparent by default would change
    every consumer of the preset.
  - `components/pet/PetFoodInput.vue` — **no longer overrides Quasar.** The field now
    renders native `<input>`/`<select>` controls inside the outer `q-field`, so its two
    remaining rules (the stacked-label band height and the zeroed native padding) are the
    component's own geometry, not restatements of a preset rule.
  - `components/pet/PetChip.vue` — inline `white-space: normal !important`: this label's
    content needs to wrap.
  - `components/AvailabilityCard.vue` — `.q-date__header*` rules plus `--availability-hint`:
    app content injected into Quasar's date header, keyed off this app's `.range-empty`
    state class.

- **A new Quasar conflict is a hole in the preset's scale, not a local patch.** The answer
  is a changeset upstream.
- The preset must not acquire petboarding-specific knowledge: a rule is accepted there only
  where the behaviour is wrong for *every* Quasar installation.
- The mobile `.q-drawer-container { pointer-events: none }` guard was measured redundant
  under both cascades and deleted rather than migrated — with the guard on, with it off,
  and under ADR 0007's scale, `document.elementFromPoint` returned the header button, so
  the layering and not the pointer-events is what keeps the controls hittable.
- `packages/api/tests/e2e/frontend/layout-polish.spec.ts` guards the migrated rules (header
  controls hittable at 375px, month grid scrolls instead of clipping, the labels search
  field on the toolbar centre line), so a regression fails the suite first.

# ADR 005: kennel assignment is tap→picker, not drag & drop

- Status: accepted
- Date: 2026-10-07
- Context: `packages/app/src/pages/employee/KennelLayout.vue`, this plan
  (`~/.pi/plans/2026-10-07-kennellayout-click-dialog.md`), WCAG 2.2 SC 2.5.7

## Context

The kennel layout assigned pets to kennels by native HTML5 drag & drop
(`onDragStart`/`onDrop`, ancestor-walk drop resolution). Three problems were
established before this change:

- **Touch never worked.** Native HTML5 DnD does not fire on touch screens; the
  shipped mobile screenshot (`packages/docs/public/screenshots/employee-kennellayout-mobile.png`)
  shows the dead end — a wall of waitlist chips under a "Drag and drop…" instruction,
  with no way to place any of them.
- **It was an accessibility defect.** WCAG 2.2 SC 2.5.7 (Dragging Movements, AA)
  requires every dragging functionality to have a single-pointer alternative. The
  W3C's own canonical example of the compliant pattern is exactly what replaced it:
  "a task board that allows users to drag and drop items between columns also
  provides an additional pop-up menu after tapping or clicking on items for moving
  the selected element to another column."
- **It crashed.** Dropping a chip onto an occupied kennel's chip threw
  `TypeError: Cannot read properties of null (reading 'at')` inside `onDrop` — the
  ancestor walk stopped on the `petN` row wrapper (which carried the same id). The
  regression test for that crash existed only because drop resolution was so fragile.

## Decision

**The tap→picker dialog is the one assignment mechanism.** Tapping/clicking a pet
chip opens the two-level kennel picker (waitlist row + building rows → kennel rows;
every occupant is shown as a rating-coloured badge — the picked pet's relation to
that occupant, name + ★ + rating — while the row itself stays neutral); tapping
a row assigns and closes. Drag & drop, its handlers, its `.drop-target`/`.drag-enter`
styling, and the building→kennel context-menu submenu
(`PetKennelContextMenuItems.vue`) are removed from both the employee and the print
pages. The chip's right-click menu stays, carrying only PetChip's built-in
"Open pet." item.

## Why not

- **Keep DnD alongside the dialog (feature parity on desktop)** — two interaction
  paths, two code paths, a double test matrix, and the touch failure remains for any
  code path that stays.
- **A drag handle + ARIA keyboard mode** — solves keyboard and keeps touch broken;
  orders of magnitude more machinery than a picker for the same outcome.
- **Keep the context-menu submenu as the single-pointer alternative** — it was
  right-click only (poorly discoverable, awkward on touch) and nested two levels in
  a menu rather than showing occupancy/compatibility at decision time.

## Consequences

- One interaction works identically for mouse, touch, and keyboard (rows are
  `tabindex="0"` with Enter/Space activation); the dialog auto-maximises below the
  `md` breakpoint (`ResponsiveDialog`), so phones get a full-screen sheet.
- The four drag-driven e2e scenarios in `tests/e2e/kennelLayout.spec.ts` were
  rewritten dialog-driven (the two that used to *skip* on the empty 2024-01-02
  waitlist now execute for real); the drop-on-chip TypeError test was deleted with
  the code it guarded; the colour tests were renamed to
  `tests/e2e/features/kennelLayoutChipColors.spec.ts`.
- The hint copy became `kennellayout.messages.selectKennel` ("Click on a pet,
  then choose a kennel or the waiting list." / "Klik op een huisdier en kies
  daarna een kennel of de wachtlijst.") — the string names the tappable target
  and the two destinations rather than the removed drag gesture.
- Assignment is confirmed and reversible: a success snackbar names the destination
  and offers **Undo**, and a failed mutation rolls the optimistic change back,
  resyncs and keeps the dialog open so the staff member can retry. The original
  "no undo (parity with drag)" position was reversed on 2026-10-08: removing drag
  replaced a deliberate gesture with a 56px tap, so a mis-tap became the likelier
  mistake and the parity argument no longer applied.

## Related

- `docs/adr/002-no-quasar-overrides-in-the-app.md`
- `CONTEXT.md` (the kennel picker rule)
- `packages/api/tests/e2e/features/kennelPicker.spec.ts`

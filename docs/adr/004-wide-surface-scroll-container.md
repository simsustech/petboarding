# ADR 004: a wide data surface scrolls inside a container it owns

- Status: accepted
- Date: 2026-10-02
- Context: `packages/app/src/components/AgendaComponent.vue`, the 2026-10-01 agenda UX pass
  (`.pi/changes/2026-10-01-agenda-calendar-ux-pass.md`), `DESIGN.md` (Layout)

## Context

`DESIGN.md` (Layout) already states the rule: wide data surfaces — the month calendar and the
agenda — keep a `min-width: 600px` canvas **inside horizontal scroll** rather than shrinking
below legibility. `DaycareCalendarMonth.vue` honours it. The agenda stopped honouring it when
the 2026-10-01 UX pass removed the outer `q-scroll-area` (to make the grid fill the page
height), leaving the 600px canvas to overflow the document on a phone.

Measured at a 412px viewport, against the real `QCalendarAgenda` + `QLayout`/`QPageContainer`/
`QHeader`/`QFooter` and the project's built CSS:

- `document.scrollingElement.scrollWidth` was **612px**. `QHeader`/`QFooter` are
  `position: fixed` at viewport width, so a phone pans the layout viewport and drags the fixed
  bars along with the content — the reported "header/footer stretch".
- Quasar ships **no** `overflow` rule for `.q-page-container` or `.q-page`, so nothing between
  the canvas and the document contained it.
- The wrapper that fixes it measures **412px** and keeps the grid filling the page (12px gap,
  inside the `grid fills the page` guard's `≤24px` bound).

## Decision

**The scroll container belongs to the surface that owns the wide canvas, not to the shell.**
`AgendaComponent` wraps the calendar in
`<div class="col column overflow-x-auto overscroll-x-contain agenda-scroll" tabindex="0">`,
and the canvas rule is view-scoped: the week keeps `min-width: 600px`, the day view (a single
column) fits the phone.

- The shell keeps no overflow rule: no `.q-page`/`.q-page-container` override (ADR 002) and no
  document-level horizontal scroll.
- `.agenda-scroll` is the named container, marked for tests and for a future reader.

## Why not

- **A page-level override** (`overflow-x: hidden` on a Quasar class) — ADR 002 forbids it, and
  `hidden` clips the canvas instead of making it reachable.
- **Restore `q-scroll-area`** (the shape `DaycareCalendarMonth` still uses). Measured: its
  `__content` is `position: absolute` and JS-sized, so the calendar inside can never be
  flex-grown. In all four shapes tried — `.col`, `height: 100%`,
  `contentStyle: { height: '100%' }`, and the `ResizeObserver`-sized shape — the grid stays at
  its 320px floor (gap 399px, failing the `grid fills the page` guard); in the `.col` shape its
  scroller reports `clientHeight: 0`.
- **Shrink the canvas to fit** — contradicts the `DESIGN.md` rule this ADR implements.
- **A shell-level guard only** (assert the document never widens, fix nothing) — the canvas
  would still be unreachable on a phone.

## Consequences

- `.col` and `.column` are both load-bearing on the wrapper: `.col` contributes
  `max-width: 100%` (Tailwind v4's `flex-1` has none — measured 612px again when dropped) and
  `.column` provides `flex-direction: column` so the calendar can be flex-grown (without it
  the grid collapses to its 20rem floor).
- The day view no longer scrolls sideways, so the week-only swipe hint stays correct. No i18n
  change.
- Enforcement is by e2e guard, not by convention:
  `packages/api/tests/e2e/frontend/agenda.spec.ts` (document width, container scrollability,
  head/body alignment, day view fits) and
  `packages/api/tests/e2e/frontend/mobile-shell.spec.ts` (a route matrix asserting no mobile
  destination widens the document at 375px, plus focusability of the scroll container).
- A second surface that wants a canvas wider than a phone should reuse this shape rather than
  invent a new one; a surface specific to one page stays out of the preset (ADR 002).

## Related

- `docs/adr/002-no-quasar-overrides-in-the-app.md`
- `DESIGN.md` (Layout — "Wide data surfaces … inside horizontal scroll")
- `CONTEXT.md` (the wide-surface rule)

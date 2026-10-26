# Changes: agenda canvas contained in a scroll container it owns (2026-10-02)

Executes plan `~/.pi/plans/2026-10-02-agendapage-wide-mobile.md` (5 steps, all green).

At a 412px viewport the agenda's 600px canvas widened the document to **612px**: `QHeader`/
`QFooter` are `position: fixed` at viewport width, so a phone panned the layout viewport and
dragged the fixed header/footer along with the content (the reported "header/footer stretch").
`DESIGN.md` (Layout) already required the opposite — a wide surface keeps its canvas **inside
horizontal scroll** — and `DaycareCalendarMonth.vue` still honoured it; the agenda stopped when
the 2026-10-01 UX pass removed its outer `q-scroll-area`.

## New files

| File | Description |
|------|-------------|
| `docs/adr/004-wide-surface-scroll-container.md` | Why the scroll container belongs to the surface that owns the wide canvas, not to the shell; with the measurements (612px baseline, the four `QScrollArea` shapes at the 320px floor, `.col`'s `max-width: 100%` being load-bearing) |

## Modified files (all hunks accepted)

| File | Lines | Description |
|------|-------|-------------|
| `packages/app/src/components/AgendaComponent.vue` | 303 changed (155±/145±) | Calendar wrapped in `div.col.column.overflow-x-auto.overscroll-x-contain.agenda-scroll[tabindex=0]`; the canvas rule moved into a `calendarStyle` computed and scoped to the week view so the day view fits the phone. Most of the line count is oxfmt re-indenting the wrapped block by one level |
| `packages/api/tests/e2e/frontend/agenda.spec.ts` | 106 added | `mobile reachability` extended with the document-width and scroll-container assertions (canvas 600 wide, container narrower, `scrollLeft` reaches `scrollWidth - clientWidth`, weekday header scrolls with the day columns); new `day view fits the phone` guard |
| `packages/api/tests/e2e/frontend/mobile-shell.spec.ts` | 84 added | Route matrix at 375×812 asserting no mobile destination widens the document, plus the agenda's container is scrollable and keyboard-reachable (`tabindex="0"`) |
| `CONTEXT.md` | 19 added | The wide-surface rule ("a wide data surface scrolls inside a container it owns"), with the `*Avoid*` line and the ADR 004 cross-link |

## Verification

- **Red→green per step**, all three code steps observed red first:
  - step 1 — `the agenda widens the document to 612px on a 412px viewport` → `(d2)` agenda spec
    **7 passed**;
  - step 2 — `the day canvas is 600px wide` → `(d2)` agenda spec **8 passed**;
  - step 3 — `/employee/agenda → 612px on a 375px viewport`, reproduced by stashing step 1's
    wrapper, rebuilding and re-running the matrix → `(d2)` full suite.
- **Full suite** (`cd packages/api && pnpm run test:e2e`): **103 passed / 0 failed / 4 skipped
  (5.9m)** — better than the baseline recorded on 2026-10-01 (92 passed / 6 failed / 4 skipped,
  the documented 4 plus two date-bomb specs); none of those failures reproduce today, so nothing
  was masked. The new guard's describe block is present in `test-results.json`.
- **Sweep result: no other route widens the document.** All 10 matrix routes (`/employee/agenda`,
  `/employee/overview`, `/employee/bookings`, `/employee/pets`, `/employee/customers`,
  `/admin/bookings`, `/admin/daycare`, `/admin/occupancy`, `/admin/configuration`, `/account`)
  render a `.q-page` and hold viewport width; only the agenda failed pre-fix.
- `pnpm run lint` — 20 pre-existing warnings, no errors. `pnpm run format:check` — clean after
  one `format:write` auto-fix per flagged file. `PI_RTK_BYPASS=1 pnpm run build` — all three
  stages wrote fresh artifacts. `vue-tsc` on the app: **448 errors, identical to the pre-change
  baseline** (the four `AgendaComponent.vue` errors are pre-existing; the `:view="view"` one
  shifted 93 → 102 by exactly the 9 lines added).
- **No `PAUSE:` checkpoint was triggered**: `mobile reachability`'s pre-existing footer/row
  geometry assertion still holds with the wrapper, so it was not retargeted.

## Notes for next time

- The e2e stack serves the **built image**, so every app-source change needs
  `down --volumes` → `build app` → `up -d --no-build` before `(d2)`. Host ports 80/443 were held
  by an unrelated `slimfact` compose project, so the stack was brought up without its own caddy
  (`E2E_OWN_STACK=0`) and the label-driven caddy already on the `web` network proxied
  `petboarding.localhost` to it — that is the repo's supported external-stack path
  (`tests/e2e/stack-lifecycle.ts`).

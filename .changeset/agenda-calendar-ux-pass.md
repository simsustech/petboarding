---
'@petboarding/app': minor
---

Agenda calendar UX pass — six findings from the 2026-09-30 audit, plus the day-measure follow-up:

- A quiet period no longer swaps the whole agenda for one sentence: the calendar, date picker, Status filter, Day/Week toggle, prev/next/Today and legends stay mounted, and the quiet message renders inside the grid (new `agenda.emptyDay` wording for day view).
- The grid fills the page (the content-sized outer scroll area and its resize observer are gone; the calendar is a flex child with a 20rem floor), the page scrolls instead of squeezing the grid, and a swipe hint (`lt-md`) announces the week's horizontal scroll on phones.
- Empty cells stay silent: `Bookings 0` / `Daycare 0` labels and their separators only render when the count is above zero.
- Both legends moved behind a `Legend` button (menu, keyboard-reachable, Escape/outside-click closes); the Last-name toggle stays inline, so the grid is no longer pushed below the fold on mobile.
- Day view lays its sections on a centred 48rem measure instead of a 12em island in a 1174px band.
- PetChip badges (food, medicines, vaccinations, pet alerts, `#badge`) wrap in a row below the label instead of floating at `top: -10px` over the name; `#bottom-badge` badges are untouched.

Guarded by `packages/api/tests/e2e/frontend/agenda.spec.ts` (7 E2E tests).

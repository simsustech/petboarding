---
'@petboarding/app': minor
---

feat(app): add an upcoming-dates list to the account daycare page, and load every upcoming date

`/account/daycare` showed a customer's dates only as chips inside the month grid:
windowed to the visible month, unreadable for a plan that reaches into next year,
and impossible to act on without first finding the right cell.

- The page now renders a **chronological list of all upcoming dates** under the
  grid, grouped by month with that month's count, and one row per date carrying
  the date as an overline, the pet names, a status pill (the fixed status colour
  **and** its word) and a cancel action that reuses the existing confirmation
  dialog.
- `useAccountGetDaycareDatesQuery` no longer narrows to a window: it loads from
  today with no upper bound, so the grid and the list read from one set. Its
  `from`/`until` refs were not part of its cache key, so a fetch used to depend on
  whichever month had been navigated last — and @pinia/colada shares those refs
  with `DaycarePageFabs`, which is how the same customer could get different data
  on consecutive loads.
- One consequence worth naming: the grid no longer draws chips for past months,
  and the FAB's "seek attention" pulse now means "no **upcoming** dates".

Grid + agenda is the pairing Apple Calendar, Google Calendar and Fantastical all
ship: the grid answers "how does my month look", the list answers "when am I
booked, and what is its status" without navigating. The row's longest copy (the
Dutch `Wacht op goedkeuring.`) was measured at 375px: no horizontal overflow.

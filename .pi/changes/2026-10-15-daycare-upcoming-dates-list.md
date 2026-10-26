# Changes: upcoming-dates list on the account daycare page (2026-10-15)

## What changed

`/account/daycare` showed a customer's daycare dates only as chips inside the month
grid. The grid answers "how does my month look", but not "when am I booked, and what
is the status of each date" — and the data behind it was windowed, so a customer with
dates outside the shown month could not see them at all.

1. **A chronological list of all upcoming dates**, under the grid, in the same card:
   month group headers with a per-month count, one row per date with the date as an
   MD3 overline, the pet names, a status pill (the fixed status colour *and* its word)
   and a per-row cancel.
2. **`useAccountGetDaycareDatesQuery` loads every upcoming date** (`from` = today,
   `until` = `''` = no upper bound) instead of the calendar's window. Its `from`/
   `until` refs were not part of its cache key, and `DaycarePage.onChangeDate` wrote
   them while the FAB's own `onMounted` refetch read them — so consecutive loads of the
   same page could return different data. The page no longer widens or narrows its own
   fetch (admin and employee keep their windowed queries, which *do* key on the range).

Design decisions, all confirmed by the operator before building: grid on top with the
list beneath; row = date + pets + status pill; month groups with counts; per-row
cancel. Points worth recording:

- The status pill applies `DAYCARE_DATE_BUTTON_BG_CLASSES[status]` — the fill **and**
  its `text-on-status-*` ink as one pair (ADR 005). A fill with inherited ink measures
  under 2.5:1 in the dark scheme.
- The per-row cancel and the grid's bulk cancel now share one `confirmCancel(ids)`
  helper, so both paths show the same `verifyCancelation` dialog listing the dates.
- `Intl.DateTimeFormat` with `{ weekday: 'short', day: 'numeric' }` renders `20 Tue`
  in en-US and `di 20` in nl-NL — that is ICU's own pattern per locale, not a bug, and
  hardcoding one order would break the repo's locale rule.
- Cancelling keeps the row and flips its status to `Canceled` (the API updates rather
  than deletes), which the list shows truthfully, matching the grid's chip colour.

## Verification

- `pnpm run lint` = 0 · `pnpm run format:check` = 0 · `pnpm run build` = 0
- `impeccable detect --json` over the three changed source files → no findings
- Full e2e from `packages/api`: **125 passed, 6 skipped (slimfact + screenshot-gated),
  0 failed** (131 collected) — stack owned and rebuilt by `tests/e2e/global-setup.ts`
- Behaviour probe against that stack (`E2E_OWN_STACK=0`, throwaway spec, deleted after):
  - seeded customer with only a 2024 date → `emptyMsg=1 rows=0 chips=0` (future-only
    loading works, and the empty list state renders)
  - after adding a date → `rows=1 chips=1 headers=["October 2026"] counts=["1 date"]
    pills=["Pending"]`
  - per-row cancel → confirmation dialog `["Cancel","OK"]` → row shows `Canceled`
  - 375px with the longest copy (`Wacht op goedgeuring.` + a long pet name):
    `scrollWidth === clientWidth === 375` → no horizontal overflow
- Visual pass: desktop card and 375px card (grid, both month groups, four statuses,
  cancel buttons) inspected as element screenshots.

## New files

| File | Description |
|------|-------------|
| `packages/app/src/components/daycare/DaycareDateList.vue` | The list: month groups + counts, rows (date overline, pets, status pill, cancel), empty state. Emits `cancel` with the date id. |
| `.changeset/daycare-upcoming-dates-list.md` | Changeset for `@petboarding/app` (minor). |

## Modified files (all hunks accepted)

| File | Lines | Description |
|------|-------|-------------|
| `packages/app/src/pages/account/DaycarePage/DaycarePage.vue` | +24 −16 | List section under the grid; one `confirmCancel(ids)` shared by the grid's bulk cancel and the list's per-row cancel; dropped the `from`/`until` plumbing and the page's `onChangeDate`. |
| `packages/app/src/queries/account/daycare.ts` | +12 −14 | Loads from today with no upper bound; documented why the window is gone. |
| `packages/app/src/lang/en-US.ts` | +3 | `datesInMonth(n)`, `noUpcomingDates`, `cancelDate`. |
| `packages/app/src/lang/nl.ts` | +3 | Same keys in Dutch. |
| `packages/app/src/lang/index.ts` | +3 | `Language` interface follows. |

## Removed from the product

- The account page's per-month windowed fetch. Consequence: the calendar no longer
  renders chips for past months (they were read-only anyway — past days are disabled),
  and `DaycarePageFabs`'s pulse now means "no upcoming dates" rather than "no dates ever".

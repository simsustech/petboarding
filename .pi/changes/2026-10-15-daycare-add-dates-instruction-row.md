# Changes: one stable add-dates instruction row on the account daycare page (2026-10-15)

## What changed

`/account/daycare` (`packages/app/src/pages/account/DaycarePage/DaycarePage.vue`)
rendered two mutually exclusive card sections keyed on the fetched `data`:

- `v-if="petsData?.length && !data?.length"` → the "Nog geen dagopvang datums /
  Kies het plusje om je eerste dagopvang datums toe te voegen." empty state
- `v-else-if="data?.length"` → the "Meer dagopvang datums toevoegen / Selecteer
  datums in de kalender. Kies het plusje om datums toe te voegen." bar

Reproduced against the running test stack (`E2E_OWN_STACK=0`), with network
probes on `user.getDaycareDates`:

- On load the query asks with `{"from":"","until":""}` → all of the customer's
  dates → the bar renders.
- After any interaction the refetch asks with the calendar's visible window —
  observed: `{"from":"2026-09-28","until":"2026-11-01"}`. `DaycarePage.onChangeDate`
  writes those refs, and `defineQuery` shares them with `DaycarePageFabs`, which
  refetches in its own `onMounted`.
- So any date outside the shown month falls out of `data` → the bar disappears
  and the page claims the customer has no daycare dates while they do.

Fix: one instruction row, always rendered, that reads no data at all.

- Copy states the real order of the flow (press the plus first, then pick dates
  in the dialog it opens): en `Select the plus button to add dates.`,
  nl `Kies het plusje om datums toe te voegen.`
- The old branches' four keys are gone; one key replaces them in all three lang
  files. No message switches any more, so `data` cannot drive the card.
- The row keeps the scheme's ink instead of the `text-grey-7` caption, which
  measured below 4.5:1 on the tinted container (craft-floor contrast check).

The windowed fetch itself is left alone: the calendar's window is what it asks
for, and because the query is windowed to exactly the visible grid, out-of-window
dates were never visible in the calendar anyway — only the card's state was wrong.

## Verification

- `pnpm run lint` = 0 · `pnpm run format:check` = 0 · `pnpm run build` = 0
- `impeccable detect --json packages/app/src/pages/account/DaycarePage/DaycarePage.vue`
  → no findings
- Full e2e from `packages/api` (`pnpm run test:e2e`): **125 passed, 6 skipped
  (slimfact + screenshot-gated), 0 failed**, 7.0 min — stack owned and reset by
  `tests/e2e/global-setup.ts`, so the run rebuilt the image and reseeded.
- Visual pass, desktop (1440×900) + mobile (390×844), a customer with dates
  (`test1@petboarding.app`) and one without (`admin@petboarding.app`): the row
  renders exactly once and reads `Select the plus button to add dates.`, with
  `No daycare dates yet` and `Add more daycare dates` both at count 0. The test
  deployment runs light-only, so dark could not be captured; the row keeps the
  existing `--light-primary-container` / `--dark-primary-container` pair.
- Throwaway probes (`tests/e2e/*.tmp.spec.ts`) used to capture the network
  evidence and the screenshots were deleted again; only the five product files
  below are part of this change.

## New files

| File | Description |
|------|-------------|
| `.changeset/daycare-instruction-row.md` | Changeset for `@petboarding/app` (patch). |

## Modified files (all hunks accepted)

| File | Lines | Description |
|------|-------|-------------|
| `packages/app/src/pages/account/DaycarePage/DaycarePage.vue` | -28 +10 | Both card-section branches replaced by one always-rendered instruction row; `.cta-bar` comment updated. |
| `packages/app/src/lang/en-US.ts` | -5 +1 | Four keys out, `selectPlusToAdd: 'Select the plus button to add dates.'` in. |
| `packages/app/src/lang/nl.ts` | -6 +1 | Same, nl `selectPlusToAdd: 'Kies het plusje om datums toe te voegen.'`; the backwards-ordered `selectDatesThenSave` value is gone. |
| `packages/app/src/lang/index.ts` | -4 +1 | `Language` interface follows the key swap. |

## Removed from the product

- The conditional empty state ("Nog geen dagopvang datums") and the conditional
  "add more dates" bar, with their four lang keys. Nothing else referenced them
  (`grep` over `packages/`, `docs/`, `showcase/`). The pulsing `#fabAdd` remains
  the single add action, per `d9674b201`.

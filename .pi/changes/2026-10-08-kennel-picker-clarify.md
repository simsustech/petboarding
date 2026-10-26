# Changes: picker copy and rating bands (clarify pass) (2026-10-08)

Third pass on the critique follow-up (after the layout pass `dd0675a9d`).
Addresses the critique's "number + band word + legend" decision and a correction
from the user: a kennel can hold **several** pets, so "Occupied" was wrong.

## Vocabulary correction (verified against the schema)

`kennels.capacity` exists (`migrations/05:13`, nullable) and no per-kennel
uniqueness constraint exists in `booking_pet_kennel` / `daycare_date_pet_kennel`
/ overrides — multiple pets per kennel is a supported state. "Occupied N" was
therefore wrong twice: it implies one pet, and it counts kennels while reading
like it counts pets.

- Summary is now **`9 of 10 free`** (kennel-count, plural-safe, no capacity
  dependency since capacity is unset in both seeds).
- Empty rows keep **`Free`** (plural-safe).
- Compatibility stays **per occupant** — each chip carries its own band, and the
  legend says "the pets already in a kennel".

## New files
| File | Description |
|------|-------------|
| `.pi/changes/2026-10-08-kennel-picker-clarify.md` | This recap |

## Modified files (all hunks accepted)
| File | Lines | Description |
|------|-------|-------------|
| `packages/app/src/components/kennelLayout/KennelPickerDialog.vue` | ±55 | Rating becomes `3 · Fair` (number + band word) via `ratingBand()`; new `#pickerLegend` explaining the five bands; `legendText`/`freeSummaryText` use `{free}/{total}`; muted text switched to the MD3 token `var(--q-on-surface-variant)` instead of raw `text-grey-7/8`. |
| `packages/app/src/pages/employee/KennelLayout.vue` | +12 | Dialog title is now `Place {pet}` (`pickerTitle`) instead of a bare name; **fixes a missing `computed` import** that crashed the page at runtime. |
| `packages/app/src/lang/en-US.ts` / `nl.ts` / `index.ts` | ±20 | `placeTitle`, `rating` = `{n} · {band}`, `ratingBands` (poor/fair/ok/good/great), `legend`, `freeSummary` = `{free} of {total} free` (nl: `{free} van {total} vrij`). en/nl parity. |
| `packages/api/tests/e2e/features/kennelPicker.spec.ts` | ±14 | Asserts the band word per window, asserts `Rating:` is gone, asserts `#pickerLegend` and `of 10 free`. |
| `docs/adr/005-kennel-assignment-tap-not-drag.md` | ±4 | Copy line reconciled to the shipped `selectKennel` string (the critique's P3 drift finding). |

## Verification (rendered)
- `TITLE: "Place name3"` · `SUMMARY: 9 of 10 free` · `LEGEND: Compatibility with the pets already in a kennel: Poor (1-2) · Fair (3-4) · OK (5-6) · Good (7-8) · Great (9-10)` · `CHIP: 3 · Fair  name4 las…  2x` · `FREE: 5 Free` · mobile `scrollWidth === innerWidth === 375`.
- Gates: `pnpm run lint`=0 · `pnpm run format:check`=0 · `PI_RTK_BYPASS=1 pnpm run build`=0 · feature set **13/13** · full `pnpm run test:e2e` = **119 passed / 3 skipped / 0 failed**.

## Notes
- **Defect fixed during the pass**: `pickerTitle` used `computed` without importing it (the import was dropped when `draggedPetRelations` was deleted in the drag-&-drop removal), which crashed the page and made `#waitlist` invisible. Caught by e2e; lint and build did not catch it.
- **Flake observed, not caused**: `administrator/bookings.spec.ts` failed once in a full run with a 5s `toBeVisible` race. Verified unrelated — DB showed bookings 5/6 correctly `pending`, that flow renders its own `BookingChip` (`q-chip`), and the spec passes in 2.1s in isolation and in the clean full re-run.
- **Pre-existing, out of scope**: `packages/app/src/mutations/account/booking.ts:16` type error (`Booking.id?: number` passed where the tRPC input requires `id: number`). Untouched by this work; documented here so it stops being re-reported as new.
- **False positives**: English-only spell checker flags correct Dutch (`Openen`, `adres`, `Periodes`, `categorie`, `vaccinaties`).

Commit: see `git log -1` (`feat/kennel-layout-picker` branch).

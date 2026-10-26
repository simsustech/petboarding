# Changes: Add `type` to invoice lines in bookingCostsHandler (2026-07-02)

## Modified files (all hunks accepted)

| File | Lines | Description |
|------|-------|-------------|
| `packages/api/src/api.config.ts` | 58, 85, 114, 140 | Added `type` field to pet booking lines (`petboarding_booking`), service lines (`petboarding_service`), holiday lines (`petboarding_holiday`), vacation lines (`petboarding_vacation`), cancelation lines (`petboarding_cancelation`), and downpayment lines (`petboarding_downpayment`) |
| `packages/api/configs/api.config.mjs` | 52, 81, 110, 136, 240, 252 | Same types added to the .mjs config variant |

## Root cause

Lines produced by `bookingCostsHandler` had no `type` field. When SlimFact's `updateInvoice` is called with `replaceExistingLinesOfSameType: true`, the merge logic preserves lines where `!l.type` is truthy (i.e., `undefined`), causing old lines to never be removed and new lines to be appended as duplicates.

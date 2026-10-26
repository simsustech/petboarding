# Changes: Booking cost unit tests + surchargeHolidays param (2026-06-16)

## New files
| File | Description |
|------|-------------|
| `packages/api/src/api.config.test.ts` | Vitest suite for `bookingCostsHandler` and `bookingCancelationHandler` (38 tests, all green). Covers pet pricing, services, holiday surcharge, vacation surcharge, required down payment, and all cancelation cost tiers. |
| `packages/api/vitest.config.ts` | Vitest config: include `src/**/*.test.ts`, exclude `tests/e2e/**` so `pnpm test` only runs unit tests. |

## Modified files (all hunks accepted)
| File | Lines | Description |
|------|-------|-------------|
| `packages/api/src/petboarding.d.ts` | ~37, ~46-47 | Added optional `surchargeHolidays?: string[]`, `requiredDownPaymentAmountFractionOfTotal?: number`, `minimumRequiredDownPaymentAmount?: number` to `BookingCostsHandler` params. |
| `packages/api/src/api.config.ts` | ~25-38, ~85, ~147-165 | Destructured `surchargeHolidays` (default `[]`), `requiredDownPaymentAmountFractionOfTotal` (default 0), `minimumRequiredDownPaymentAmount` (default 5000). Removed the local `const` copies; the params are now used directly. |
| `packages/api/configs/api.config.mjs` | ~15-37, ~75, ~147-165 | Same destructuring/usage change as `src/api.config.ts`, with the NL holiday list as the default for `surchargeHolidays`. |
| `packages/api/src/api.config.test.ts` | top, buildParams, ~720-790 | `surchargeHolidays` is a local constant in the test (comment notes it mirrors `configs/api.config.mjs`). `buildParams` exposes the new fraction/minimum args. Two new tests cover custom fraction and custom minimum. |

## Notes
- `vitest` is bundled by `vitrify` (no new dev dep).
- The `surchargeHolidays` array lives in the test file as a local constant (a comment notes it mirrors the list in `configs/api.config.mjs`). Tests do not import the runtime variant config.
- `dateHolidays` is passed through as `Holidays` directly; the `new dateHolidays()` call inside the handler is exercised unchanged.
- Down-payment cap behaviour verified: the floor is applied first, then reduced to `totalIncludingTax` when the total is smaller.
- Cancelation handler uses `vi.useFakeTimers()` + `vi.setSystemTime(...)` for deterministic "today".
- All checks green: 40/40 tests (38 original + 2 for the new fraction/minimum params), lint clean for new files, format clean, build passes.

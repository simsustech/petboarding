# Plan: Refactor cancellation/invoice logic into `api.config.ts`

## Goal

Move all cancellation/invoice-cost business logic out of `packages/api/src/trpc/{admin,employee,user}/bookings.ts` and into `packages/api/src/api.config.ts`. Additionally move `createOrUpdateSlimfactInvoice` to its own file. The 4 tRPC paths sharing that function become thin wrappers around `createOrUpdateSlimfactInvoice`.

`bookingCostsHandler` becomes the single source of truth for SlimFact invoice lines — its output can be passed **directly** to the invoice, including for full cancellations and modifications inside the cancellation period.

## Architecture decision (final)

### Signature: option B — `bookingCostsHandler` grows optional params

The user's spec ("bookingCostsHandler always returns the correct costs (including cancelation fees)") could be read as two variants:

- **A — required `lastApprovedBooking`**: impossible. Pure pricing tests and `calculateBookingCosts` on a fresh booking have no prior approval to pass.
- **B — optional `lastApprovedBooking?`, `bookingStatus?`, `ctx?`**: covers all callsites, no bogus plumbing.

Going with **B**.

| Param                                                                                                                                                                                                                     | Status             | Notes                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | -------------------------------------------------------- |
| `period, pets, categories, services, withServices, dateFns, dateHolidays, computeInvoiceCosts, surchargeHolidays, locale, country, requiredDownPaymentAmountFractionOfTotal, minimumRequiredDownPaymentAmount, vacations` | unchanged          | existing pricing core                                    |
| `bookingStatus?: BOOKING_STATUS`                                                                                                                                                                                          | **new (optional)** | current status of the booking                            |
| `lastApprovedBooking?: { costs: { totalIncludingTax, requiredDownPaymentAmount }, startDate, endDate, days }`                                                                                                             | **new (optional)** | result of `getLastApprovedForBooking(booking)`           |
| `ctx?: { BOOKING_STATUS, getLang: typeof getLang }`                                                                                                                                                                       | **new (optional)** | i18n + status enum; only needed in cancellation branches |

### Branch logic inside `bookingCostsHandler`

1. **Plain pricing (default)** — same as today. Triggered when `bookingStatus` is `undefined`, `PENDING`, or `APPROVED` _without_ a `lastApprovedBooking`.
2. **Full cancellation** — when `bookingStatus ∈ {CANCELED, CANCELED_OUTSIDE_PERIOD}`: compute pricing, then **replace** `{lines, discounts, surcharges, requiredDownPaymentAmount}` with `bookingCancelationHandler({period, booking, BOOKING_STATUS, vacations}).cancelationCosts`.
3. **Modification surcharge** — when `bookingStatus === APPROVED && lastApprovedBooking`: compute pricing, then run `bookingCancelationHandler` against `lastApprovedBooking`'s period. If its returned status is `CANCELED_OUTSIDE_PERIOD`, **append** one `RawInvoiceSurcharge` to `surcharges[]`:
   - `listPrice = Math.round((lastApprovedTotal − currentTotal) × (cancelationTotal / lastApprovedTotal))`
   - `description = lang.booking.cancelationCosts` (resolved via `ctx.getLang(locale)`)
   - `listPriceIncludesTax: true, taxRate: 21`

### Why this works for every caller

- **17 existing pricing tests** in `api.config.test.ts`: keep passing (no signature change to required args).
- **`repositories/booking.ts:222`** (`calculateBookingCosts`): pricing-only, doesn't pass `bookingStatus`. Unchanged behavior.
- **`trpc/admin/bookings.ts`** (the wrapper being deleted): gets refactored to call `createOrUpdateSlimfactInvoice`, which calls `bookingCostsHandler` with `{bookingStatus, lastApprovedBooking, ctx}`.
- **`repositories/booking.ts:1109`** (`cancelBooking`): uses `bookingCancelationHandler` directly — unchanged.

## File-by-file changes

### 1. `packages/api/src/petboarding.d.ts`

Extend `BookingCostsHandler` type with the three optional params above. Keep nullability permissive (all `?:`).

### 2. `packages/api/src/api.config.ts`

- Internal refactor of `bookingCostsHandler`: compute base pricing once into local vars, then route on `bookingStatus`.
- Push to `surcharges[]` (not `lines[]`) to match existing L241–L245 of `bookings.ts` shape. Total via `computeInvoiceCosts` is `pricing + surcharge`.
- `bookingCancelationHandler` signature **unchanged** — it already returns the correct `{ status, cancelationCosts: { lines, surcharges?, discounts?, requiredDownPaymentAmount? } }` shape for the replacement branch.
- i18n lookup (`lang.booking.cancelationCosts`) moves into `api.config.ts` — uses `ctx.getLang(locale)`. `bookings.ts` stops touching i18n entirely.

### 3. `packages/api/src/trpc/admin/slimfactInvoice.ts` (NEW)

Contains `createOrUpdateSlimfactInvoice`. Imports from `api.config.ts`. Calls `bookingCostsHandler` **once** with full state params; result already has the surcharge line OR cancellation replacement applied. Function becomes ~80 LOC, no business logic — just SlimFact IO and date formatting.

### 4. `packages/api/src/trpc/admin/bookings.ts`

- **Delete** `createOrUpdateSlimfactInvoice` (~240 LOC removed).
- Update `import { createOrUpdateSlimfactInvoice }` paths. Going with **direct imports** from the new file (no re-export to avoid confusion).
- Remove all use of `computeInvoiceCosts` from this file.

### 5. `packages/api/src/trpc/employee/bookings.ts`, `user/bookings.ts`

- Update `import { createOrUpdateSlimfactInvoice } from '../admin/bookings.js'` → `'../admin/slimfactInvoice.js'`.

### 6. `packages/api/src/repositories/booking.ts`

- `cancelBooking` keeps using `bookingCancelationHandler` directly — unchanged.

### 7. `packages/api/src/api.config.test.ts`

Add 4 new describe blocks for the merged cases:

- `bookingCostsHandler — full cancellation branch`: returns cancellation costs when status is `CANCELED_OUTSIDE_PERIOD` (uses down payment only when total ≤ requiredDownPaymentAmount).
- `bookingCostsHandler — DOWN payment fallback`: returns DOWN-payment-only costs when status is `CANCELED`.
- `bookingCostsHandler — modification surcharge (in-window)`: appends surcharge; verifies total ≥ original.
- `bookingCostsHandler — modification without prior approval`: behaves as plain pricing (no surcharge) when `bookingStatus === APPROVED` but `lastApprovedBooking` undefined.
- **Refactor** the 9 existing `describe('modification inside cancellation period — delta surcharge')` cases to invoke `bookingCostsHandler` directly with the new optional params, instead of manually constructing `withSurcharge` via `computeInvoiceCosts`. They become concise: build state, assert `result.lines` and total.

### 8. New Playwright E2E spec

See "E2E test" section below.

## E2E test (Playwright) — bookingCosts in BookingExpansionItem

### Why an E2E, not a Vue unit test

The frontend has zero test infrastructure (no Vitest config in `packages/app`, only a stubbed `App.test.js`). The components are tightly coupled to Pinia + Vue Router + Quasar. Building that up for a unit test is heavier than the change warrants. The Playwright suite at `packages/api/tests/e2e/` is the established seam for verifying rendered output end-to-end with the real API.

### File: `packages/api/tests/e2e/employee/bookingExpansionItemCosts.spec.ts`

A new Playwright spec exercising all 4 booking-cost states rendered inside the `BookingExpansionItem` "Kosten" expansion (the inner `q-expansion-item` with header `lang.booking.costs.title`). Each scenario logs in, navigates to `/employee/bookings`, expands the booking, opens the costs section, and asserts on the rendered lines + total.

#### Fixtures (extend `packages/api/src/kysely/seeds/test.ts`)

Use the seeded APPROVED booking with `Pets = 1`, configured to have a non-trivial `costs` snapshot. The spec seeds 4 separate bookings (or re-uses one and mutates state in-DB to switch status) under customer 1:

| Booking                                  | Status                             | Period                                  | Pets | Expected rendered lines                                                                                                                                                     |
| ---------------------------------------- | ---------------------------------- | --------------------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — active**                           | APPROVED                           | future, no vacation                     | 1    | none (costs panel hidden when `modelValue.costs === null/undefined` for active bookings without booking invoices yet) — when `modelValue.costs` exists, only base pet lines |
| **B — modified in-window**               | APPROVED, `lastApprovedStatus` = A | shrunk (10d → 8d), start within 14 days | 1    | base pet lines **+ 1 surcharge line** with description `lang.booking.cancelationCosts`, listPrice = `Δ*100%`                                                                |
| **C — modified out-of-window**           | APPROVED, `lastApprovedStatus` = A | shrunk (10d → 8d), start ≥ 1 month out  | 1    | base pet lines only (no surcharge; free-cancel)                                                                                                                             |
| **D — fully cancelled (outside period)** | CANCELED_OUTSIDE_PERIOD            | within 14 days                          | 1    | exactly 1 line: `description = "Cancelation costs"`, `listPrice` matches 100% tier                                                                                          |

#### Login shared via `tests/e2e/setup.ts`

Reuse `initializeAndLogin({ browser, email: 'admin@petboarding.app', password: 'qjiNWdT8L' })`.

#### Test selectors (added to BookingExpansionItem.vue data-testids where missing — see step "Test hook adds")

#### Scenarios (4 `test()` blocks, serial mode)

```ts
test.describe.configure({ mode: 'serial' })

test.beforeAll(...) // login once

test('A — active APPROVED booking shows base pet lines in costs expansion', ...)
test('B — modified APPROVED in cancellation window shows base + 1 surcharge line', ...)
test('C — modified APPROVED outside cancellation window shows base lines only (no surcharge)', ...)
test('D — fully CANCELED_OUTSIDE_PERIOD booking shows single cancelation-costs line', ...)
```

Each test:

1. Navigates to `/employee/bookings`.
2. Locates the `booking-expansion-item` row whose `data-testid="booking-{id}"` matches the seeded booking.
3. Clicks the outer expansion header to expand.
4. Clicks the inner costs expansion (`data-testid="booking-costs-header"`) to expand.
5. Asserts:
   - Outer text of `data-testid="booking-line-N"` for each N matches expected description.
   - `data-testid="booking-line-N-price"` shows formatted money.
   - `data-testid="booking-costs-total"` matches expected total.
6. Captures a screenshot of the expanded view (for `tests/e2e/debug/`) — useful when triaging failures, matches the pattern in `petitem-screenshots.spec.ts`.

#### Test hook adds to `BookingExpansionItem.vue` (minimum invasive)

Inside the existing costs `q-expansion-item`, add `data-testid="booking-costs-header"`. Inside `BookingCosts.vue`, add `data-testid` per line: `booking-line-{index}` on the rendered `invoice-line-item`. On outer wrapper add `data-testid="booking-expansion-{booking.id}"`. On top item-root in BookingsPage add `data-testid="booking-{booking.id}"` to the `<booking-expansion-item>`.

These are tiny non-functional attribute adds to Vue templates — no logic change.

#### Backend assertion (optional defense-in-depth)

Each Playwright test also re-fetches via the existing `getBooking` tRPC procedure and asserts `booking.costs.lines.length` and item descriptions match the rendered DOM. This protects against "render correct but data wrong" regressions on the API side.

### Why 4 states rather than 1 coverage test

Each state exercises a different branch of the new `bookingCostsHandler`. Compressing them fails to catch branch regressions — e.g. a future change that breaks the surcharge math would still pass a "D only" test that doesn't exercise it.

## Verification

```bash
pnpm run lint || pnpm run lint:fix
pnpm run format:check || pnpm run format:write
pnpm run build
cd packages/api && pnpm run test  # vitest unit tests

# E2E (full Docker stack)
export SIMSUSTECH_NPM_TOKEN=$(cat ./env/SIMSUSTECH_NPM_TOKEN) \
  && docker compose -f docker-compose.test.yaml up --force-recreate
cd packages/api && pnpm run test:e2e
```

The e2e result is read from `packages/api/test-results.json`.

## Commit

Single commit on `feature/modification-cancellation-costs`:

```
refactor: extract createOrUpdateSlimfactInvoice and merge cancellation logic into bookingCostsHandler

- Move createOrUpdateSlimfactInvoice to trpc/admin/slimfactInvoice.ts (~80 LOC).
- bookingCostsHandler now accepts optional bookingStatus, lastApprovedBooking,
  and ctx and returns the final invoice lines for any state (active,
  modified, fully cancelled).
- bookingCancelationHandler signature unchanged; its output is what
  bookingCostsHandler composes into the result for full cancellations.
- 4 tRPC call sites (admin/employee/user) import from the new path.
- i18n lookup (lang.booking.cancelationCosts) moves into api.config.ts.
- api.config.test.ts: 9 existing modification-surcharge tests now exercise
  the merged bookingCostsHandler path, plus 4 new describe blocks for
  cancellation branches.
- E2E: new playwright spec covers 4 booking-cost states rendered in
  BookingExpansionItem (active, modified in-window, modified out-of-window,
  fully cancelled outside period).
```

Existing changeset `curvy-pens-agree.md` keeps its wording (user-facing behavior unchanged from `632ae3ed`).

## What I will NOT do

- Will not touch the 8 unstaged/unrelated files (`AGENTS.md`, `docker-compose.*`, `PetItem.vue`, etc.) — those belong to other work-in-progress.
- Will not rewrite `calculateBookingCosts` in `repositories/booking.ts` (it correctly uses just the pricing path).
- Will not push the branch (per project rules).
- Will not split this into multiple commits — one logical commit per project convention.

## Out-of-scope follow-ups (not in this change)

- The `configs/api.config.mjs` variant still has "Annuleringskosten"/"Aanbetaling" hard-coded Dutch descriptions and uses `computeInvoiceCosts` inside `bookingCostsHandler`. With this refactor it still works (no signature change required for existing callers), but the mountable `.mjs` override could optionally be ported later to the same merged shape. Mark as a TODO.
- The `injectRules` for `self-healing-css-test-loop` skill is mentioned by AGENTS.md under "Quality Checks" but is not present in `.pi`. Skipping until the user explicitly requests it.

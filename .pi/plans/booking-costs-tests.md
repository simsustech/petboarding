# Plan: Unit tests for booking cost calculation

## Goal
Add Vitest unit tests for the `bookingCostsHandler` and `bookingCancelationHandler` exported from the **default** config at `packages/api/src/api.config.ts`.

Coverage is broad — every branch the handlers actually have, exercised with realistic Dutch booking scenarios (school vacations, public holidays, multi-pet households, multi-day bookings, services like grooming/pickup).

## Test framework
The repo already wires `pnpm test` to `vitrify test`, which boots Vitest with `globals: true` and `environment: 'happy-dom'`. No config changes needed — drop a `*.test.ts` file in the API package and `pnpm --filter @petboarding/api test` discovers it.

## File to create

### `packages/api/src/api.config.test.ts`
A single Vitest suite co-located with the code it covers. Imports `bookingCostsHandler` and `bookingCancelationHandler` from `./api.config.ts`.

## Decisions

1. **Discount coverage is out of scope.** The default config has the multiple-pets discount branch commented out, so there is nothing to test. (The custom config in `configs/api.config.mjs` enables it — testing that is a separate task.)
2. **Use the real `computeInvoiceCosts`** from `@modular-api/fastify-checkout` in the test inputs. It is pure and has no side effects, so importing it is fine and gives us accurate down-payment totals.
3. **2026 fixtures** — pick dates that intentionally land in or out of each school vacation and known public holidays, so the assertions are obvious. Use 2026-01-05 → 2026-01-09 (no vacation, contains no Dutch public holiday) as a "neutral" period for most tests. Use 2026-04-25 → 2026-05-03 (Meivakantie) and 2026-07-04 → 2026-07-10 (Zomervakantie) for vacation tests. Use 2026-12-25 → 2026-12-30 (Kerstvakantie + 2nd Christmas day) for the holiday + vacation combo.

## Helpers (local to the test file)
- `makeCategory({ id, name = 'Cat', prices })` — `ParsedCategory` with optional `prices: { date, listPrice }[]`
- `makePet({ id, name, categoryId })`
- `makeService({ name = 'Grooming', listPrice })`
- `makeVacation({ name, startDate, endDate, surchargePerDay = 100 })`
- `baseVacations` — the five 2026 NL school vacations with surcharge 100 (Voorjaars, Mei, Zomer, Herfst, Kerst)
- `dateFns` — re-exported from `date-fns` (matches the runtime shape the handler expects)
- `BOOKING_STATUS` — re-exported from `@petboarding/tools/constants` (same as the production caller uses)
- A reusable `buildParams({ period, pets, categories, services, withServices, vacations })` that fills in `dateFns` and `computeInvoiceCosts` so each test stays focused

## Test cases

### `describe('bookingCostsHandler')`

**Pet pricing**
- Single pet, single category, single price → one line, listPrice matches, `quantity = days * 1000`, `quantityPerMille: true`
- Single pet, category with multiple historical prices → uses the most recent price on or before start date
- Single pet, category with future-only prices (all after start) → listPrice is `NaN`
- Single pet, category with no prices at all → listPrice is `NaN`
- Multi-pet, same category → one line per pet, all with identical pricing

**Service lines**
- `withServices: true` + one service with `listPrice` → extra line with quantity 1
- `withServices: true` + service with `null` listPrice and `null` service ref → line skipped
- `withServices: true` + multiple services → one line per valid service, all quantity 1
- `withServices: false` (or omitted) → no service lines even when services are provided

**Holiday surcharge**
- Period overlapping Nieuwjaarsdag (01-01) → one "Holidays surcharge" line, `quantity = pets.length * holidayDays`, listPrice 500
- Period overlapping both 25-12 and 26-12 (Kerstmis + 2e kerstdag) → holidayDays counts both
- Period in mid-March (no Dutch holidays) → no surcharge line
- Period with multiple pets, one holiday day → quantity = pets.length * 1
- Single-day period that is itself a holiday → holidayDays = 1

**Vacation surcharge**
- Booking fully inside Voorjaarsvakantie (2026-02-14 → 2026-02-22) → one line, surchargePerDay 100, `quantity = pets.length * (overlapDays + 1)`
- Booking partially overlapping Meivakantie (e.g. starts 3 days before) → overlapDays reflects only the inside portion
- Booking that touches a vacation boundary (end equals vacation start) → no overlap, no line
- Booking that touches a vacation boundary (start equals vacation end) → no overlap, no line
- Two vacations overlapping the same booking → two lines, one per vacation
- Vacation with no `surchargePerDay` in DB → uses default 100
- Vacation with custom `surchargePerDay: 250` → uses 250
- Booking with zero pets but inside a vacation → no vacation line (quantity would be 0 — the handler still pushes it, but `quantity = 0`); assert that behaviour explicitly

**Required down payment**
- Total including tax > €50 (5000 cents) → down payment equals `Math.round(total * 0)` = 0, but the floor of 5000 means it actually equals 5000. Assert this current behaviour.
- Total including tax < €50 (5000 cents) → down payment = 5000
- Down payment never exceeds total including tax (assert with a tiny total)

**Combined realistic scenarios**
- Multi-pet booking in Zomervakantie with a grooming service → pet lines + service line + vacation line
- Booking in Kerstvakantie crossing 25-12 and 26-26 → pet lines + holiday line + vacation line

### `describe('bookingCancelationHandler')`

The handler depends on `new Date()`. To keep tests deterministic, mock `Date` in the suite with `vi.useFakeTimers()` and set the system time to a fixed instant (e.g. `2025-11-01T12:00:00Z`).

**Status**
- Booking 5 months out, not in summer vacation → `CANCELED`
- Booking 1 month out (Zomervakantie, subMonths-4 max) → `CANCELED` (still inside period)
- Booking 1 month out, non-summer (subMonths-2 max) → `CANCELED_OUTSIDE_PERIOD`
- Booking 1 day out, any season → `CANCELED_OUTSIDE_PERIOD` (>14d branch)
- Booking 6 months out from Zomervakantie start → `CANCELED` (more than 4 months, summer)
- Booking 3 months out from non-summer start → `CANCELED` (more than 2 months, non-summer)

**Cancelation cost tiers** (use a booking with a known `totalIncludingTax` and `requiredDownPaymentAmount`)
- Today 1 day before start (within 14d) → full total
- Today 20 days before start (>14d, <1 month) → 75% of total
- Today 1.5 months before start (between 1 month and max cancel date) → 50% of total
- Today well before max cancel date → down payment amount

**Output line**
- `CANCELED_OUTSIDE_PERIOD` and total > down payment → single "Cancelation costs" line
- `CANCELED_OUTSIDE_PERIOD` and total ≤ down payment → "Down payment" line
- `CANCELED` → always "Down payment" line

## Execution
```bash
cd packages/api
pnpm test
```

## Verification
- `pnpm --filter @petboarding/api test` exits 0
- `pnpm --filter @petboarding/api lint` passes
- `pnpm --filter @petboarding/api format:check` passes (run `format:write` if not)
- No DB or network is touched

## Files referenced
- `packages/api/src/api.config.ts` — handler under test
- `packages/api/src/petboarding.d.ts` — handler parameter and return types
- `packages/api/src/zod/booking.ts` — `BOOKING_STATUS` re-export
- `packages/api/src/zod/vacation.ts` — vacation shape
- `packages/api/src/kysely/seeds/vacations/nl/vacations-2026.ts` — realistic NL vacation fixtures
- `@modular-api/fastify-checkout` — real `computeInvoiceCosts` for accurate totals
- `date-fns` — same as the production caller

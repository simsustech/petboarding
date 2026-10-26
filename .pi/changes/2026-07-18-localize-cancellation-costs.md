# Changes: Localize cancellation costs descriptions and extract DEFAULT_SURCHARGE_HOLIDAYS (2026-07-18)

## New files

| File | Description |
|------|-------------|
| `.changeset/wet-bees-rhyme.md` | Changeset for this feature |

## Modified files (all hunks accepted)

| File | Lines | Description |
| ------ | ------- | ------------- |
| `packages/api/src/api.config.ts` | 23 (+18 -5) | Added `lang` param to `bookingCancelationHandler`; used `lang?.cancelationCosts` / `lang?.downPayment`; extracted `DEFAULT_SURCHARGE_HOLIDAYS` top-level constant; `export { type bookingCostsHandler, ... }` |
| `packages/api/configs/api.config.mjs` | 21 (+17 -4) | Mirrored `.ts` changes: `lang` param, localized descriptions, `DEFAULT_SURCHARGE_HOLIDAYS` top-level constant |
| `packages/api/src/repositories/booking.ts` | 10 (+7 -3) | Imported `getLang`, resolved locale's booking lang strings, passed `lang: resolvedLang.default.booking` to handler |
| `packages/api/src/lang/en-US.ts` | 3 (+2 -1) | Added `downPayment: 'Down payment'` |
| `packages/api/src/lang/nl.ts` | 3 (+2 -1) | Added `downPayment: 'Aanbetaling'` |
| `packages/api/src/lang/index.ts` | 4 (+3 -1) | Updated type to include `downPayment` |
| `packages/api/src/petboarding.d.ts` | 4 (+4 -0) | Added `lang?: { cancelationCosts, downPayment }` to `BookingCancelationHandler` params |

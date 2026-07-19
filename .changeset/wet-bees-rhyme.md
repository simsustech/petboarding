---
'@petboarding/api': minor
---

Localize cancellation costs descriptions in booking handler. Thread `lang` parameter through `bookingCancelationHandler` so 'Cancelation costs' and 'Down payment' strings use the locale from `packages/api/src/lang/`. Add missing `downPayment` key to both en-US and nl lang files.

Extract `surchargeHolidays = []` default to a top-level `DEFAULT_SURCHARGE_HOLIDAYS` constant for easier editing in the `.mjs` mirror.

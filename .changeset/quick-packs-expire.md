---
'@petboarding/api': patch
---

fix(api): charge daycare days to the pack that expires soonest

A customer booking went to the earliest-*effective* paid pack, not the first-expiring one:
`findCustomerDaycareSubscriptions` returns candidates ordered by `effectiveDate`, and
`createDaycareDate` took the first with days left. A pack bought earlier but valid for a year
absorbed days while a pack expiring in three weeks sat untouched, so the customer's remaining
days on the expiring pack never moved.

Candidates are now sorted by `expirationDate` (then id) before the pick, in `createDaycareDate`
and in `updateDaycareDate` (the admin approve path). The ±1 month tolerance around the booked
date stays as it was: a pack that expired up to a month ago, or starts up to a month ahead,
still pays for the day, so a late or early booking is not rejected. Because an expired pack
expires before a valid one, its unused days are spent first and the deduction is not visible on
the account page, which lists only `expirationDate >= today`; that gap is recorded, not changed.

`updateDaycareDate` no longer queries without a customer or date filter when it has neither: it
refuses to guess instead of being able to link an unrelated customer's pack.

The pick is transactional: `createDaycareDate` and `updateDaycareDate` lock the customer's
paid packs (`SELECT … FOR UPDATE`, ordered by id) before reading the days left and inserting,
so two bookings cannot both spend the last remaining day. The lock is taken through a new
optional `trx` on `findCustomerDaycareSubscriptions`.

The account page now shows a pack that expired inside the slack window while it still has
days left, marked `Expired`, instead of filtering it out (`user.getCustomerDaycareSubscriptions`
kept only `expirationDate >= today`). A deduction into such a pack was invisible to the
customer, which was half of the report. The form's remaining-days counter counts those packs
too, so it no longer caps the customer below what the server accepts;
`DAYCARE_SUBSCRIPTION_SLACK_MONTHS` in `@petboarding/tools/constants` is the single source for
the window on both sides.

`setCustomerDaycareSubscriptionStatus` backfilled unlinked dates with
`limit(numberOfDays)` rows while a date costs one day per pet, so a two-pet date charged two
days against a one-row budget. It now spends the budget per pet, in date order.

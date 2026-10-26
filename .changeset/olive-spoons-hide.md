---
"@petboarding/api": patch
---

feat: re-add multiple pets discount

Re-added the 15% discount on the 2nd+ pet in a booking. The discount fraction is extracted to a top-level `MULTIPLE_PETS_DISCOUNT_FRACTION` constant. Only applies to `petboarding_booking` line items (not services or surcharges).

---
"@petboarding/api": minor
---

feat: add cancellation surcharge for shortened approved bookings inside the cancellation period

When an APPROVED booking is shortened (fewer days, fewer pets) within the cancellation period, the invoice now includes a cancellation surcharge equal to `applyPercentage × (lastApprovedTotal − currentTotal)`.

- Uses the most recent APPROVED status as the reference (lastApprovedBooking)
- Applies the cancellation tier percentage (100%/75%/50%) only to the removed portion
- Modifications outside the free-cancel window do not accumulate surcharges

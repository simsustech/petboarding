---
"@petboarding/api": minor
---

feat: charge cancellation costs for shortened approved bookings inside the cancellation period

When an APPROVED (or awaiting-down-payment) booking is shortened — fewer days or
fewer pets — inside the cancellation period, the invoice now includes a cancellation
fee for the removed portion.

- The reference is the booking state **in effect when the cancellation window opened**
  (`startDate − 2 months`, `− 4` in the summer vacation), so a change made earlier
  (outside the period) is never charged again — only the portion removed inside the
  period is billed.
- Applies the cancellation tier percentage (100%/75%/50%) to that removed portion.
- The invoice is generated from the booking's own costs and is re-synced on approval,
  so the fee is billed at approval and can no longer drift from the displayed costs.
- Modifications outside the free-cancel window do not accumulate a fee.

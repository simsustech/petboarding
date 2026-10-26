---
'@petboarding/api': patch
---

fix: label cancelation costs in the deployment's language, and keep the invoice in step with a booking's costs

- `getLang()` only listed `nl`/`en`/`en-US`, so a deployment that sets the full locale
  (`VITE_LANG=nl-NL`, as the Dutch clients do) missed the map and fell back to en-US:
  cancelation lines read "Cancelation costs" instead of "Annuleringskosten". It now matches
  the locale case-insensitively, then its base language, then en-US, and both the
  booking-costs context and the full-cancelation branch take their labels from that same
  bundle, so the down-payment fallback is translated too.
- The invoice update names the line family the app owns
  (`replaceTypedLines: 'petboarding'`): every existing `petboarding_*` line is replaced on
  each sync, so a canceled booking's original lines, a removed service or a surcharge
  window the booking has left can no longer linger on the invoice next to the new lines.
  Manually added (untyped) invoice lines are still preserved.
- Rejecting a booking that was already approved — and therefore billed — is treated as a
  cancelation: it owes the cancelation tier instead of its original lines. A booking that
  was never approved was never billed and keeps its own costs.

Requires `@modular-api/fastify-checkout` ≥ 0.12, which replaces
`replaceExistingLinesOfSameType` with `replaceTypedLines`.

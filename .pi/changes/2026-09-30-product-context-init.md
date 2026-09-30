# Changes: init — product context captured in PRODUCT.md (2026-09-30)

## New files

| File | Description |
| ------ | ----------- |
| `PRODUCT.md` | Impeccable product record (schema 1): platform `web`, primary user = facility staff/owners (interviewed), product form = self-hosted licensed + simsustech-hosted + community (interviewed), EN+NL equal with no lead market (interviewed), purpose, positioning, operating context, capabilities/constraints (incl. ADR 001/002 rules), brand commitments, evidence with explicit absences, five product principles, accessibility posture from the in-repo audit standard. |
| `.pi/changes/2026-09-30-product-context-init.md` | This recap. |

## Deliberately undecided / not captured

- No visual world recorded (init never writes DESIGN.md; the incumbent system stays
  undocumented until `/impeccable document`).
- `buildPath` not recorded: no image generation is available in this harness, so the
  choice does not exist.
- No open product decisions were flagged by the user; `## Capabilities and Constraints`
  records none.

## Verification

- `PRODUCT.md` exists at the repo root with `<!-- impeccable:product-schema 1 -->`;
  child apps resolve it as `productStatus: inherited`.
- `impeccable live --target packages/app` now reports `context_missing: DESIGN.md`
  (nextCommand `document`) instead of a missing product record — live mode's
  first-time setup is unblocked only after that.

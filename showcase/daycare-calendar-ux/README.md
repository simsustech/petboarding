# Showcase: Daycare Calendar UX Improvements

Visual evidence of customer-facing improvements to `/account/daycare` and `/admin/daycare`.

## What this showcase captures

| Screenshot                              | State                                                                 | Audience |
| --------------------------------------- | --------------------------------------------------------------------- | -------- |
| `account-daycare-empty.png`             | Customer with pets but no daycare dates — shows full-card empty state | Customer |
| `account-daycare-with-dates.png`        | Customer with existing dates — shows prominent CTA bar                | Customer |
| `account-daycare-with-dates-mobile.png` | Same as above, mobile viewport (375px)                                | Customer |
| `admin-daycare.png`                     | Admin daycare approval page                                           | Admin    |

## How to regenerate

Requires Docker test environment to be running (see AGENTS.md → Quality Checks).

```bash
cd packages/api
SHOWCASE_SUFFIX=before PLAYWRIGHT_ALLOW_SCREENSHOTS=1 pnpm run test:e2e --grep=showcase-daycare
# Switch branches or revert changes, then:
SHOWCASE_SUFFIX=after PLAYWRIGHT_ALLOW_SCREENSHOTS=1 pnpm run test:e2e --grep=showcase-daycare
```

## Comparison

Open `before/` and `after/` side by side to see the UX changes.

## Related

- Plan: `.pi/plans/PLAN-DAYCARE-CALENDAR-UX.md`

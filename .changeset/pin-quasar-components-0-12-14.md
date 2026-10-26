---
'@petboarding/app': patch
---

Pin `@simsustech/quasar-components` 0.12.14 — the 300px card cap is gone.

`QStyledCard` carried `style="max-width: 300px; padding: 2px"`, which capped every card at
300px inside a ~445px column at 1440, so grid cards hugged their content and the
columns/gutters never filled (petboarding's pets, contact-people and account grids). It is also
what made an alert's date range wrap onto a second line on a desktop card instead of fitting on
one — the reason it was on the change report's follow-up list.

The upstream fix (`e8e8e117`, 2026-10-06) removed the inline size; **0.12.14** (published
2026-10-13) is the first release containing it. Verified in this app's installed copy rather than
trusted from the version number:

| | 0.12.13 | 0.12.14 |
|---|---|---|
| installed version | 0.12.13 | 0.12.14 |
| `max-width: "300px"` in `QStyledCard` | present | **absent** |

No `minimumReleaseAgeExclude` exemption was needed: 0.12.14 was published two days before the
pin, so it clears the 24h release-age gate on its own.

The layout does change — cards now fill their grid columns. The full e2e suite passes, including
the palette spec's day-number contrast assertions, so nothing regressed.

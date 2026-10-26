---
'@petboarding/app': patch
'@petboarding/api': patch
---

Pin `unocss-preset-quasar` 0.7.4 — an unplaced popup stays hidden, and the individual
transforms survive minification.

The preset's `0.7.3..0.7.4` source diff is exactly two fixes:

- `q-position-engine` gained `visibility: hidden` — the only guard that keeps a popup off
  screen until Quasar's JS positioning engine writes its placement. That engine is the path
  every browser without CSS anchor positioning takes, and it re-schedules itself on a 10 ms
  timer while the popup still measures 0x0. Inside a dialog the portal node sits in
  `.q-dialog.fixed-full.flex-center`, so a QSelect menu painted in the middle of the screen
  before snapping under the field.
- `field`, `fab`, `expansion-item` (and the translate utilities) stated `rotate`/`scale`/
  `translate` beside `transform` in one rule. Lightning CSS — Vite 8's production minifier —
  folds the pair in source order and drops the earlier declaration, so a minified build lost
  the checkbox state layer's centring (the hover circle landed 20px down-right of the box),
  the floating field label's 0.75 scale and the indeterminate dash's rotation; an unminified
  build composed the two instead, doubling the fab and expansion-arrow rotations to 360° so
  they never turned. Every site now states one `transform`, as Quasar's own CSS does.

Both only show in a *built* deployment, which is why the app's suite was green on 0.7.3: the
preset's harness builds with `cssMinify: false`, and an unplaced popup has no geometry to
assert on.

Verified in this app's built stylesheet (`packages/app/dist/ssr/client/assets/unocss-*.css`,
and the same asset inside the test image the e2e suite ran against):

| check | result |
| --- | --- |
| `.q-position-engine{…}` | carries `visibility:hidden` |
| rules stating both `transform` and `rotate`/`scale`/`translate` | 0 |
| `.body--dark .q-badge` twin rules | 0 |

`@petboarding/api` is listed because it consumes the same preset (`src/setup.ts` imports
`generateTheme`), so its emitted theme CSS changes with the same two rules.

---
'@petboarding/app': patch
---

Layout/colour audit pass (2026-10-06), from a programmatic sweep of every route
× viewport × scheme:

- The 404 page no longer paints itself `bg-primary text-white`: the primary is a
  light teal in dark mode, so the headline measured 1.71:1 there. It now uses a
  surface with a primary numeral and a flat primary CTA.
- Print pages pin the surface-container family, not just `--q-surface`, so a card
  on `/print/overview` no longer goes near-black on near-black (1.04:1) in a dark
  session.
- The employee pets/customers empty state drops `text-grey-7` (3.71:1 on the dark
  surface) for `text-on-surface-variant`.
- Content links use the preset's own classes — `q-link text-primary` — instead of
  each page pairing `text-$light-primary dark:text-$dark-primary`. The colour is
  the interactive role, which flips per scheme; the preset's `.q-link` carries it
  from the next release (see the `unocss-preset-quasar` changeset), and
  `text-primary` covers the interval while this app still pins 0.6.4.
  `.q-link` also removes the browser underline, so the links now read as
  colour-only, like the rest of the Material surfaces.

Guarded by `packages/api/tests/e2e/frontend/layout-audit.spec.ts`; the audit
instrument is `packages/api/tests/e2e/screenshots-contrast.spec.ts`.

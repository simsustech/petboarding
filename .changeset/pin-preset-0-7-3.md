---
'@petboarding/app': patch
---

Pin `unocss-preset-quasar` 0.7.3 — the MD3 role classes now reach the stylesheet.

A colour asked for *by name* composes its class at runtime (`color="error"` → `bg-error`),
and UnoCSS's content scan cannot see a class that only exists at runtime. The preset's
safelist carried the Quasar palette but not the MD3 roles, so those classes were never
emitted and the element painted nothing — `color="error"` fell back to `--q-primary`.

Measured in this app's built stylesheet, before and after the pin:

| class | 0.7.0 | 0.7.3 |
|---|---|---|
| `bg-error` | missing | present |
| `text-on-error` | missing | present |
| `bg-surface-container-highest` | missing | present |

(`text-on-surface-variant` was already present, but only because this app happens to use
it as a static class — which is exactly what hid the bug.)

The bump also carries 0.7.1 and 0.7.2: a QTimeline class-icon sizing fix and a
`.q-timeline__title` role. Neither is a regression here — the full e2e suite passes with
them, and the app's build is clean.

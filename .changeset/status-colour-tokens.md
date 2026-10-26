---
'@petboarding/app': minor
'@petboarding/tools': minor
---

Status and pet-alert colours become per-scheme token pairs (ADR 005).

A status fill was one fixed light hex paired with an ink token that flips with the scheme, so
a dark theme put a light fill under near-white text: measured **1.04–2.45:1** across the
eleven fills this app shipped (`bg-green-2` 1.04, `bg-red-2` 1.09, `bg-yellow-2` 1.21,
`bg-grey-3` 1.30, the approve/reject/standby menu fills 1.35/2.14/1.19).

- Each of the five statuses and each of the four pet-alert conditions is now a light/dark
  pair — `status-*` and `alert-*` — with the ink on it as `on-status-*` / `on-alert-*`. The
  ink resolves to the scheme's own `on-surface`, so a deployment's source colour keeps driving
  it rather than a frozen black/white pair. **A light theme does not change**: every light
  half is the palette value that was already rendered (`bg-green` was `#4ade80`, `bg-red`
  `#f87171`, `bg-yellow` `#facc15`, `bg-grey` `#9e9e9e`, `bg-deep-orange` `#ff5722`).
- The values arrive as `--q-*` custom properties written per scheme by `setThemeColors`
  (light under `:root`, dark under `body.body--dark`), merged over the deployment's colours
  because a status is a product constant. The utilities come from UnoCSS theme entries; the
  preset needed no change.
- The utility names Quasar composes at runtime (`color="status-approved"` → `bg-status-approved`)
  are safelisted, since the content scan cannot see them — without it they would paint nothing,
  the failure mode that left `color="error"` on `--q-primary` until the preset safelisted its
  md3 roles.
- The alert tile is solid again, carrying `text-on-alert-*` ink instead of the 40% tint that
  stood in while no fill had a dark value; the tint was the workaround, not the design.
- Calendar date cells and alert chips now carry their own ink (`text-on-status-*`,
  `text-on-alert-*`) rather than inheriting the text colour — the missing half.
- `needs-rest` is amber (`#f59e0b`/`#78350f`) where it shipped yellow: that yellow was
  byte-identical to `status-standby`, and `DESIGN.md` reserves yellow for "reserve", so one
  card could show the reserve colour for a rest instruction.
- `PET_ALERTS[].color` is **removed** from `@petboarding/tools`: an alert's colour is a token
  pair now, and a UnoCSS palette name did not belong in the shared package. Consumers read
  `PET_ALERT_COLORS` / `PET_ALERT_INK_COLORS` from the app instead.

Guarded by `packages/app/src/theme-tokens.test.ts` (every payload key kebabizes back to a token
name, every token has a dark half of its own, the light halves are the values already shipped,
and the safelist covers what Quasar composes) plus the existing browser gate.

The three families ADR 005 had left out are in as well, because each shared the same defect:
category hues (`badge-food` … `badge-double-booked` — fills that carry an icon), booking-status
glyphs (`icon-*`, the opposite case: a colour *on* the surface, so each is dark-in-light and
bright-in-dark), and the *disabled* / *deceased* greys, which stopped being palette steps and
became `bg-surface-container-high` with `text-on-surface-variant` — a surface step plus reduced
emphasis, rather than inventing a sixth status. Every pair clears 4.5:1 in both schemes, and the
unit test asserts it rather than trusting the derivation.

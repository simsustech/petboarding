---
'@petboarding/app': patch
---

fix: apply the runtime theme colors (bump `unocss-preset-quasar` to 0.6.2)

The theme identity is applied at runtime from `/configuration`: the API derives
`THEME_COLORS` from `VITE_SOURCE_COLOR` and the app hands them to
`setThemeColors(...)`. That call only wrote the `--light-*` / `--dark-*`
primitives, while every component reads the semantic `--q-*` tokens — which the
preset emitted as build-time literals. The runtime source color therefore never
reached the UI and the default scheme always rendered (light `#005faf` instead of
the configured teal `#00696d`).

`unocss-preset-quasar` 0.6.2 makes `setThemeColors` restate the `--q-*` tokens
(light on `:root`, dark on `body.body--dark`), so the configured source color now
applies in both schemes.

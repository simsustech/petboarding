# Changes: document — DESIGN.md + sidecar capture the incumbent system (2026-09-30)

## New files

| File | Description |
| ------ | ----------- |
| `DESIGN.md` | Official DESIGN.md format: frontmatter tokens (33 colors, 5 type roles, 6 radii, 5 spacing steps, 6 component tokens) + the eight canonical sections. Documents the system as Material Design 3 delivered by `unocss-preset-quasar` with `MaterialDesign3` selected, identity from source color `#4EBDC2` applied at runtime via `setThemeColors(THEME_COLORS)`. North Star "The Calm Control Room"; named rules: Source, Status Meanings, Overline, One Quiet Level. |
| `.impeccable/design.json` | Sidecar (schemaVersion 2): tonal ramps, typography meta, MD3 elevation level 0–5 vectors, motion tokens (100/300/500ms + MD3 easings), breakpoints, 7 self-contained `ds-*` component snippets (buttons, card, field, status chip, nav tab, calendar day button), and the narrative mapped verbatim from DESIGN.md. |

## Extraction sources (all verified, none invented)

- `packages/app/vitrify.config.ts` — `QuasarPreset({ style: MaterialDesign3, sourceColor: env.VITE_SOURCE_COLOR })`.
- Preset source (`unocss-preset-quasar` → `.worktrees/rules`): `theme/index.ts` (md3 tokens: corner 4/8/12/16/28/full, Roboto type scale, spacing 4–24, motion), `theme/elevation.ts` (level 1–5 vectors), `theme/colors.ts` (`themeFromSourceColor`, MD3 surface tones), `src/index.ts` (default source `#1976d2`).
- Runtime `/configuration` → `THEME_COLORS` (light/dark MD3 scheme for `#4EBDC2`).
- Live computed-style sampling (Playwright against the test stack): body/toolbar/overline type, card `0 1px 3px` shadow + 16px radius, pill buttons 28px, dialog 28px/24px, status legend hexes (approved `#4ade80`, canceled `#ff5722`, pending `#9e9e9e`, rejected `#f87171`, standby `#facc15`), `--q-*` component vars, tab pill indicator.
- `CONTEXT.md` (overline rule) and the committed screenshots for layout truth.

## Qualitative decisions (interviewed)

- North Star "The Calm Control Room"; voice "Calm operational clarity"; anti-reference: pet-shop whimsy.
- Color identity anchored on source `#4EBDC2` (user), applied runtime via `setThemeColors` (user).
- Elevation = Material Design 3 (user); component feel "Confident & approachable" (user).

## Verification

- `python3 -m json.tool .impeccable/design.json` — valid JSON.
- Frontmatter values cross-checked against live computed styles and the preset token
  source; every color in the frontmatter was either sampled from the running app or
  read from `/configuration`.
- Markdown lint advisories (MD025/MD036) are the DESIGN.md format's own canonical
  constructs (single H1 + bold North Star line), not defects.

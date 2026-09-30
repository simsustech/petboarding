---
name: Petboarding
description: Easy, fast and reliable pet boarding software — calm operational clarity in Material Design 3.
colors:
  source-teal: "#4EBDC2"
  primary: "#00696d"
  on-primary: "#ffffff"
  primary-container: "#6ff6fc"
  on-primary-container: "#002021"
  secondary: "#4a6364"
  secondary-container: "#cce8e9"
  on-secondary-container: "#041f20"
  tertiary: "#4d5f7c"
  tertiary-container: "#d5e3ff"
  error: "#ba1a1a"
  interactive-blue: "#005faf"
  background: "#fafdfc"
  on-surface: "#191c1c"
  on-surface-variant: "#3f4949"
  outline: "#6f7979"
  outline-variant: "#bec8c9"
  surface-container-low: "#f2f4f4"
  surface-container: "#eceeee"
  surface-container-high: "#e6e9e8"
  surface-container-highest: "#e0e3e2"
  dark-primary: "#4cd9df"
  dark-surface: "#191c1c"
  dark-on-surface: "#e0e3e2"
  positive: "#21BA45"
  negative: "#C10015"
  warning: "#F2C037"
  info: "#31CCEC"
  status-approved: "#4ade80"
  status-rejected: "#f87171"
  status-canceled: "#ff5722"
  status-pending: "#9e9e9e"
  status-standby: "#facc15"
typography:
  display:
    fontFamily: "Roboto, -apple-system, \"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: "57px"
    fontWeight: 400
    lineHeight: "64px"
  title:
    fontFamily: "Roboto, -apple-system, \"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: "28px"
  body:
    fontFamily: "Roboto, -apple-system, \"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "21px"
  label:
    fontFamily: "Roboto, -apple-system, \"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: "20px"
  overline:
    fontFamily: "Roboto, -apple-system, \"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "16px"
    letterSpacing: "2px"
rounded:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "28px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.xl}"
    padding: "4px 24px"
    typography: "{typography.label}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.interactive-blue}"
    rounded: "{rounded.xl}"
    padding: "4px 24px"
    typography: "{typography.label}"
  card:
    backgroundColor: "{colors.surface-container-low}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "16px"
    typography: "{typography.body}"
  field:
    backgroundColor: "{colors.surface-container-highest}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.sm}"
    typography: "{typography.body}"
  chip-status:
    backgroundColor: "{colors.status-approved}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: "0 8px"
    typography: "{typography.label}"
  nav-tab-active:
    backgroundColor: "{colors.secondary-container}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    typography: "{typography.label}"
---

# Design System: Petboarding

## Overview

**Creative North Star: "The Calm Control Room"**

Petboarding's interface is a facility's quiet command surface: dense, scannable,
unhurried. The whole system is Material Design 3, delivered entirely through
`unocss-preset-quasar` with its `MaterialDesign3` style selected — every theming
value (color, type, shape, elevation, motion, component metrics) is a token the
preset emits, and the identity is applied at **runtime**: the source color `#4EBDC2`
generates the MD3 light/dark scheme, and `setThemeColors(THEME_COLORS)` (fetched
from `/configuration`) writes it onto the running app. Deployments can carry their
own source color without a rebuild; the generator behind the runtime theme and the
CSS the preset emits are the same generator, so both stay numerically identical.

The aesthetic philosophy is operational clarity: the tool disappears and the data
leads. Calm, precise, quietly confident — a well-run back office where everything
is findable and nothing shouts. Surfaces are near-neutral with a faint teal cast,
structure comes from the surface-container ramp and hairline outlines rather than
boxes-inside-boxes, and color is spent almost entirely on meaning: status, alerts,
and the few actions that matter. Density suits a staff member scanning a week of
bookings between phone calls; the customer-facing portal inherits the same calm
so the two experiences read as one product.

Confirmed visual rejections: playful pet-shop whimsy (paws, bones, cartoon
mascots) and cutesy marketing warmth. The product speaks to adults running a
business.

**Key Characteristics:**

- Material Design 3 token architecture, selected style `MaterialDesign3` in
  `unocss-preset-quasar`, seeded from source color `#4EBDC2`, applied at runtime.
- Near-neutral teal-cast surfaces; color reserved for status and action.
- Roboto throughout, with the MD3 type scale and a signature wide-tracked
  overline for dates, ids, and status lines.
- Pill buttons (28px), soft 16px cards, 12px chips — confident and approachable.
- Soft-static elevation: surfaces rest one quiet level up, never stacked deep.
- Staff density with customer-facing calm; en/NL copy parity on every string.

## Colors

The palette is one source color — `#4EBDC2` — resolved into a full Material 3
light and dark scheme at runtime; neutrals stay near-neutral (chroma ~1–2) so
every card, bar, and menu is a tint of the *neutral* family, never a wash of the
brand hue.

### Primary

- **Deep Teal** (`#00696d`): the MD3 primary derived from the source color.
  Filled actions, active indicators, the brand's anchor in both themes.
- **Primary Container** (`#6ff6fc`): bright teal used sparingly for emphasized
  containers and inverse accents (dark-mode primary is `#4cd9df`).
- **Source Teal** (`#4EBDC2`): the seed itself — the identity reference every
  deployment's theme is generated from.

### Secondary

- **Slate Teal** (`#4a6364`) with container `#cce8e9`: supporting role — the
  active navigation pill (`secondaryContainer`) and secondary chips/badges.

### Tertiary

- **Dusty Indigo** (`#4d5f7c`) with container `#d5e3ff`: third-role accents
  (illustrative/optional states); never competes with primary.

### Interactive Blue

- **Signal Blue** (`#005faf`): Quasar's component alias (`--q-primary`) — field
  focus borders, outline-button text, and links resolve here. It is the live
  component-variable layer; do not hand-apply it where a semantic token exists.

### Neutral

- **Ink** (`#191c1c`): on-surface text — titles, body, icons.
- **Slate Ink** (`#3f4949`): on-surface-variant — secondary text, overlines.
- **Paper** (`#fafdfc`): background/surface — the app canvas and dialog surface.
- **Surface ramp**: low `#f2f4f4` → container `#eceeee` → high `#e6e9e8` →
  highest `#e0e3e2` (cards sit at *low*, menus/dialogs and inputs climb the
  ramp); drawer and cards render in this family.
- **Outline** (`#6f7979`) / **Outline Variant** (`#bec8c9`): hairlines, field
  borders, dividers (`#c3c6cf` rendered).
- **Error** (`#ba1a1a`): destructive states; Quasar status aliases
  positive `#21BA45`, negative `#C10015`, warning `#F2C037`, info `#31CCEC`.

### Status (fixed operational vocabulary)

- **Approved Green** (`#4ade80`): approved bookings/days — always this green.
- **Rejected Red** (`#f87171`): rejected.
- **Canceled Orange** (`#ff5722`): canceled (also double-booking badges).
- **Pending Grey** (`#9e9e9e`): pending/awaiting.
- **Standby Yellow** (`#facc15`): standby/reserve list.
- Supporting badge hues: arrival/food green, departure/vaccinations red,
  medicines orange, appointment light-blue, pet alerts pink/yellow/red/blue.

### Named Rules

**The Source Rule.** Identity flows from `#4EBDC2` through the runtime theme —
`setThemeColors` + the preset tokens — never from hand-picked hexes. A new surface
reads `primary`, `surface-container-*`, `on-surface`; it does not paste a color.

**The Status Meanings Rule.** The five status colors mean exactly one thing each
across calendar, agenda, list, and legend. Green never decorates; grey never
means success; yellow always means "reserve".

## Typography

**Display Font:** Roboto (with `-apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif`)
**Body Font:** Roboto (same stack)
**Label/Mono Font:** none distinct — metadata uses Roboto overline treatment

**Character:** one workhorse grotesque doing everything through weight and
tracking. The MD3 scale carries the voice: regular-weight titles that don't
compete with data, 500-weight labels that anchor controls.

### Hierarchy

- **Display** (400, 57px/64px): MD3 `displayLarge` — reserved; marketing-scale
  moments, essentially unused in the operational app.
- **Headline** (400, 24px/32px `headlineSmall`; toolbar title renders 21px/31.5px
  with 0.21px tracking): page identity in the header toolbar.
- **Title** (500, 16px/28px): section labels, the agenda period label, card
  headings.
- **Body** (400, 14px/21px): default copy, list rows, table cells; input text
  steps up to 16px (MD3 `bodyLarge`); measure stays short — operational screens
  are lists, not prose.
- **Label** (500, 14px/20px): buttons, tabs (tab labels 12px/500), field labels.
- **Overline** (500, 12px, +2px tracking): dates, ids, and status lines on
  `q-item-label overline`.

### Named Rules

**The Overline Rule.** Dates, ids, and status lines render as MD3 overline —
12px, weight 500, 2px letter-spacing (`#3f4949`). This is a deliberate design
token, not a missing font; never "fix" it to a body face.

## Layout

The spatial model is a 12-column grid on a `q-page` with 12px padding and 12px
gutters (`col-span-12` stacking to `md:col-span-*` splits at 768px). Desktop
runs a compact icon rail (≈80px drawer: icon + 12px label per destination) plus
a fixed header toolbar; tablet collapses the drawer behind a menu button; mobile
switches to a header + bottom tab bar (Home / Account / Employee / Administrator)
so the primary destinations are always thumb-reachable.

Density is staff-first: cards group a task (16px padding), dialogs breathe
(24px padding), and list rows stay tight. Wide data surfaces (the month calendar,
the agenda) keep a `min-width: 600px` canvas inside horizontal scroll rather than
shrinking below legibility. Dialogs become full-width sheets on mobile with an
icon-close / text-action header (✕ … Submit). Spacing rhythm follows the 4/8/12/16/24
scale; nothing invents a fifth gap.

## Elevation & Depth

Depth is Material 3 elevation: a six-rung scale where shadows are tinted by
`--q-shadow-color` in light mode and `--q-dark-shadow-color` in dark mode (dark
elevation stays light-toned instead of black-on-black). The system is
soft-static — surfaces rest one level up from the canvas, and deeper levels are
earned by state (menus, dialogs, drag), never stacked decoratively.

### Shadow Vocabulary

- **Level 0** (`none`): the page canvas itself.
- **Level 1** (`0 1px 3px 0 color-mix(in srgb, var(--q-shadow-color) 20%, transparent)`):
  resting cards, list surfaces — the everyday lift (live cards render exactly this).
- **Level 2** (`0 2px 6px 0 … 20%`): raised surfaces, popovers.
- **Level 3** (`0 4px 10px 0 … 30%`): menus, dialogs.
- **Level 4** (`0 6px 14px 0 … 30%`): transient higher surfaces (snackbars).
- **Level 5** (`0 8px 20px 0 … 30%`): dragged/elevated transient material only.

### Named Rules

**The One Quiet Level Rule.** Static content sits at level 1. If a shadow is
deeper than level 3, something is transient or in motion.

## Shapes

The corner language is the MD3 corner scale and nothing else: extra-small 4px
(banners), small 8px (fields, inner surfaces), medium 12px (chips), large 16px
(cards, tab pills), extra-large 28px (buttons and dialogs — the pill silhouette
that defines the system), full 9999px (round buttons/badges). Borders are
hairline `outlineVariant` dividers, not frames; clipping is rare — the calendar's
rounded day buttons and pill chips are the recurring silhouettes.

## Components

### Buttons

- **Shape:** fully pilled (radius 28px), padding 4px 24px, 14px/500 label,
  text-transform none.
- **Primary:** filled `primary` on `on-primary`; hover/focus/pressed use MD3
  state overlays (0.08 / 0.12 / 0.12) rather than color shifts.
- **Outline:** transparent fill, `interactive-blue` label — the "Add" pattern.
- **Flat / text:** quiet actions (nav arrows, Today, dialog actions) in
  `interactive-blue` or default ink, no fill at rest.

### Chips

- **Style:** 12px radius pill, label type, status background with ink text.
- **State:** removable selection chips (calendar picks) carry `primary`;
  status chips (arrival/departure, food/medicines/vaccinations) carry the fixed
  status vocabulary; badges are fully rounded.

### Cards / Containers

- **Corner Style:** 16px.
- **Background:** `surface-container-low` on the Paper canvas.
- **Shadow Strategy:** elevation level 1 at rest.
- **Border:** none; hairlines appear only inside dense lists.
- **Internal Padding:** 16px (card sections).

### Inputs / Fields

- **Style:** MD3 filled — container `surface-container-highest` with bottom
  corners rounded (8px), 16px input text, floating label.
- **Focus:** `interactive-blue` border treatment; state overlay on hover.
- **Error / Disabled:** error color on label/border; disabled drops the container
  contrast rather than greying text alone.

### Navigation

- **Desktop:** compact icon rail — vertical tabs (icon + 12px/500 label), active
  destination marked by a `secondary-container` pill (16px radius).
- **Mobile:** header toolbar (21px title, 400) + bottom tab bar, same four
  destinations.
- **Secondary navigation:** `q-btn-toggle` pill groups (Day/Week), pushed
  two-state control with active fill.

### Signature Components

- **Month calendar day-button grid** (`DaycareCalendarMonth`): each day is a
  rounded button; today outlined in a bright blue ring, selected/booked days
  filled with status colors, adjacent-month days dimmed, and the header carries
  the period title flanked by `‹ June` / `July ›` destination-labeled month
  buttons.
- **Status legend row**: a fully-rounded status badge + overline label pair
  repeated across agenda, daycare, and pet legends — the system's color
  dictionary made visible.
- **Agenda period bar**: `‹` chevrons around a 16px/500 range label
  (`1 Jan – 7 Jan 2024`) with a Today action — quiet, centered, one row.

## Do's and Don'ts

### Do:

- **Do** derive every color from the runtime theme tokens (source `#4EBDC2` →
  MD3 roles); read `primary`, `surface-container-*`, `on-surface` semantics.
- **Do** use the MD3 type roles and keep the overline treatment (12px/500/2px)
  for dates, ids, and status lines.
- **Do** keep buttons pilled (28px) and cards at 16px with the level-1 shadow.
- **Do** place surfaces on the container ramp (card = low, menu/dialog/input
  climbs) instead of adding borders to create hierarchy.
- **Do** assign the five status colors their single fixed meanings everywhere.
- **Do** ship every string, date format, and flow equally in English and Dutch.

### Don't:

- **Don't** introduce pet-shop whimsy — paws, bones, cartoon mascots, or cutesy
  marketing warmth — anywhere in the product surface.
- **Don't** hardcode hex values in components; if a color isn't in the token
  set, it isn't a color of this system.
- **Don't** invent radii outside the 4/8/12/16/28/full scale or stack shadows
  deeper than level 3 on static content.
- **Don't** reach for neutral grey enterprise defaults — the neutrals carry a
  faint teal cast from the source family.
- **Don't** override Quasar or preset styling locally; the style's tokens are
  the system (fix shared defects upstream with a changeset).

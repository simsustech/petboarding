# ADR 005: status colours get a per-scheme pair

- Status: accepted
- Date: 2026-10-14
- Context: every status fill is a single light hex, paired with a text token that flips
  with the scheme — measured at 1.04–2.45:1 in dark mode across 11 shipped fills

## Context

`DESIGN.md` fixes five status hexes (`status-approved #4ade80`, `status-rejected #f87171`,
`status-canceled #ff5722`, `status-pending #9e9e9e`, `status-standby #facc15`) plus the
supporting badge hues, and its named rule is that each means exactly one thing across
calendar, agenda, list and legend. Its `chip-status` component recipe is *status fill +
`on-surface` text*.

That recipe is light-mode-only, because the fill is **one fixed light value** while
`on-surface` **flips** (`#191c1c` light → `#e0e3e2` dark). Reading the fills out of the
built CSS and the ink out of the live `/configuration` payload:

| fill (`class`) | where it is used | ink in light | ink in dark | white, both schemes |
|---|---|---|---|---|
| `bg-green-2` | arriving/staying booking row (`BookingItem.vue:195`) | 12.76 | **1.04** | 1.34 |
| `bg-red-2` | departing booking row (`BookingItem.vue:196`), terms banner (`InformationPage.vue:23`) | 12.18 | **1.09** | 1.41 |
| `bg-yellow-2` | kennel-layout daycare cell (`KennelLayout.vue:368`) | 16.01 | **1.21** | 1.07 |
| `bg-grey-5` | deceased pet card/row ×3 (`PetCard.vue:2`, `PetItem.vue:2`, `PetSelect.vue:21`) | 9.13 | **1.45** | 1.88 |
| `bg-green` / `bg-red` / `bg-yellow` | Approve/Reject/Standby menu items (`BookingItemContent.vue:124,140,156`) | 9.84 / 6.20 / 11.20 | **1.35 / 2.14 / 1.19** | 1.74 / 2.77 / 1.53 |
| `bg-grey-3` | inactive subscription, disabled opening time | 12.99 | **1.30** | 1.30 |
| `bg-red-600` / `bg-orange-500` / `bg-yellow-500` / `bg-green-400` | kennel-layout cells | 3.55–9.84 | **1.35–3.74** | 1.74–4.83 |
| the four alert hues (`bg-pink`/`bg-yellow`/`bg-red`/`bg-blue`) | agenda chips, legend, alert tile | 6.20–11.20 | **1.19–2.14** | 1.53–2.77 |

Two readings matter:

1. **The light half already works.** Every fill above clears ≥5.42:1 with the light ink.
   Nothing about light mode needs to change.
2. **The dark half does not exist.** With a fixed fill, *no* flipping text token can clear
   4.5:1 in both schemes: ink fails dark (1.04–2.45:1) exactly as white fails light
   (1.07–4.83:1 in both). The **fill** has to change with the scheme.

**Two families share this defect, and they are not one vocabulary.**

- `status-*` is the **booking/daycare state** family: the meanings in `BOOKING_STATUS`
  (`packages/tools`) and the identical keys in `DAYCARE_DATE_COLORS`, shared across calendar,
  agenda, list and legend.
- The **pet-alert hues** are a second family (`PET_ALERTS`, also in `packages/tools`), and they
  *reuse two status hexes exactly*: `status-rejected` `#f87171` is what "aggressive" paints, and
  `status-standby` `#facc15` is what "needs rest" paints. That is how one pet card shows the
  rejected red and the reserve yellow for two conditions that are neither, and it is why the
  alert tile sits inside this family's blast radius rather than beside it.
- The **surface greys** (`bg-grey-3` for disabled, `bg-grey-5` for deceased) are not status
  tokens at all — they are surface-ramp steps used with default ink. They have the same
  contrast failure; whether they *should* become tokens is left open below.

This ADR fixes the mechanism for the first family and gives the second one its values, since
both are one per-scheme pair. Nothing in the shipped pet-alert change depends on it.
This also explains why the audit missed it: `packages/api/tests/e2e/screenshots-contrast.spec.ts`
parses only `rgb()` colours, and the runtime theme resolves tokens to `oklab()` in dark
mode, so the probe skips precisely the dark-mode runs (the 2026-10-06 changeset records
the same effect as a "`color-mix()` parsing artifact"). The alert-tile gate
(`frontend/pet-alerts.spec.ts`) converts oklab itself, which is how the 2.14:1 figure
surfaced at all.

The alert tile shipped a **workaround** for this: a 40% tonal tint (`bg-red/40`, ink glyph)
so the surface underneath carries the scheme — 10.7:1 light, 6.6:1 dark. It works, but it
is quieter than the design system's chip, and it exists only where that one component
needed it.


## Decision

**A status is one token per scheme, not one hex for both.** Each status gains an ink pair,
and the value is resolved by the scheme the way `--q-error` already is:

```text
--q-status-rejected      #f87171  (light)   #991b1b  (dark)
--q-on-status-rejected   #191c1c  (light)   #e0e3e2  (dark)
```

Consumers write `bg-status-rejected text-on-status-rejected`; no `dark:` variants and no
per-site choice. `DESIGN.md`'s `chip-status` recipe changes from *status fill + `on-surface`*
to *status fill + `on-status-*`*; the Status Meanings Rule is untouched — one hue still
means one thing, only its tone follows the scheme.

**The dark half is derived, not hand-picked.** Keep the existing light hex for identity;
take the dark companion from the same hue at the tone whose contrast against the scheme's
ink clears 4.5:1 — the pattern `unocss-preset-quasar` already uses for `positive`/`negative`
("pins an MD3 tone per scheme, derived from the harmonized brand hue, never hand-picked",
`theme/colors.ts` + `test/status-colors.test.ts`). The chosen values are pinned in the theme
payload so they stay inspectable.

Worked pairs, every value computed against the real ink tokens (light `#191c1c`, dark
`#e0e3e2`):

| token | light (unchanged) | ink | dark companion | ink |
|---|---|---|---|---|
| `status-approved` | `#4ade80` | 9.84 | `#14532d` | 7.05 |
| `status-rejected` | `#f87171` | 6.20 | `#991b1b` | 6.43 |
| `status-canceled` | `#ff5722` | 5.42 | `#9a2c08` | 5.94 |
| `status-pending` | `#9e9e9e` | 6.40 | `#424242` | 7.78 |
| `status-standby` | `#facc15` | 11.20 | `#713f12` | 6.71 |

The alert family and the surface greys from the measurement table get their own treatment
below — they are not statuses, and stating them here would imply they are.

Where the values live:

1. `DESIGN.md` frontmatter `colors`: `status-*` (light) plus `status-*-dark` and the
   `on-status-*-dark` inks, so the design system states both schemes.
2. `/configuration` `THEME_COLORS.light` / `.dark`: the same names, which is what
   `setThemeColors` writes onto `--q-*` at runtime.
3. `unocss-preset-quasar`: the status family joins the tokens the preset emits (it already
   derives `positive`/`negative` per scheme) so `bg-status-*` / `text-on-status-*` resolve
   from the vars, with no app-side CSS.

Verification: a frontend gate that renders each status surface in **both** schemes and
asserts the fill/ink pair ≥4.5:1 — the oklab-aware helper in
`frontend/pet-alerts.spec.ts` is the one to lift into it.
### The alert family, per condition

The alert hues get the same treatment, keyed by `PET_ALERT_CONDITIONS` (the closed set in
`packages/tools/src/constants/index.ts`) rather than by hue — the convention the rest of the
app already follows for their icons, labels and i18n keys, and the one AGENTS.md requires so
a new condition cannot slip through as a bare `string`:

| token | light fill | ink | dark fill | ink |
|---|---|---|---|---|
| `alert-in-heat` | `#f472b6` | 6.48 | `#9d174d` | 6.10 |
| `alert-needs-rest` | `#f59e0b` | 7.99 | `#78350f` | 7.02 |
| `alert-aggressive` | `#f87171` | 6.20 | `#991b1b` | 6.43 |
| `alert-diabetic` | `#60a5fa` | 6.75 | `#1e40af` | 6.75 |

(three fills are today's values unchanged, and ink is the scheme's `on-surface` on both sides,
which is why each clears the floor — the `on-alert-*` name exists so a future fill can carry an
ink that is not the scheme ink without touching a call site. `alert-needs-rest` moves, below.)

What this buys, beyond the contrast fix:

- `bg-alert-<condition>` + `text-on-alert-<condition>` replaces the palette names in
  `PET_ALERTS[].color` and the `PET_ALERT_FILL_CLASSES` literal map.
- The alert tile can go back to a **solid** fill (the design chosen first) instead of the
  40% tint it ships as a workaround, because the fill now has a value per scheme.
- `PetChip` (agenda) and `PetLegend` move to the same tokens, so the four hues have one
  definition instead of one in `@petboarding/tools` plus a palette name resolved in the app.
- The gate needs no change: it already asserts the pair ≥4.5:1 in both schemes, so it will
  hold the new tokens to the same floor.

### needs-rest moves off the reserve yellow

Two alert fills were byte-identical to status hexes: `alert-needs-rest` `#facc15` = `status-standby`,
and `alert-aggressive` `#f87171` = `status-rejected`. Tokenising the family does not resolve a
collision, it only gives it two names — and `DESIGN.md` names the yellow case by hue: "yellow
always means 'reserve'". A pet card could therefore show the reserve colour for a rest
instruction.

**`alert-needs-rest` moves to amber; the other three keep their values.**

- `#f59e0b` light (ink 7.99) and `#78350f` dark (ink 7.02) — both clear the floor with ~55%
  headroom rather than the ~15% an amber-800 would leave.
- Amber, not orange: `#ff5722` is `status-canceled`, and `#f97316` would collide with it.
- Not amber-400 (`#fbbf24`): it sits 0.057 of relative luminance from the standby yellow, close
  enough to still read as the reserve colour, where the amber-500 pair is 0.197 away.

`alert-aggressive`'s red is left alone deliberately. No named rule claims red, and the two
reds never mean the same thing in the same place: one is a booking's rejection, the other a
safety condition with its own icon, label and i18n text. Shifting it would change the look of
chips on shared surfaces for no rule that asks for it.

Cost of this decision, stated plainly: the needs-rest chip changes colour in the agenda, the
legend and the pet card, so any committed capture showing a needs-rest badge is stale the day
it lands (the agenda set is the likely one — verify rather than assume, since the seeded pet's
alerts are aggressive and diabetic only).

### How the values reach the DOM

Measured against the real preset rather than assumed (a throwaway generator probe, then the
emitted CSS), because the delivery decides how much preset work this is:

- **A `light`/`dark` pair in the payload becomes a flipping `--q-*` for free.**
  `setThemeColors` writes every key it finds into one injected stylesheet — light roles under
  `:root`, dark roles under `body.body--dark` — precisely so the dark values can be scoped.
  A new family therefore needs no preset change to be *delivered*. The pairs the app already
  ships (`--light-on-surface: #1a1c1e`, `--dark-on-surface: #e3e2e6`) arrive this way.
- **The UnoCSS theme can name the utilities.** A theme colour whose value is
  `var(--q-status-rejected)` emits a working utility, and a nested `{ DEFAULT, ink }` entry
  emits both halves of a pair at once (`bg-alert-aggressive`, `text-alert-aggressive-ink`).
  The names live in the app's `unocss.theme`, beside the values they point at, so the preset
  gains no rule list for this family.
- **Two limits of that route are real, and they shape the tables above.** The `/opacity`
  modifier emits *no rule* on a `var()` value, so a tint has to be its own entry
  (`color-mix(in oklab, var(--q-alert-aggressive) 40%, transparent)`, which does emit); and a
  bare literal hex in a new theme key emits nothing at all, so entries stay in the `var()` form.
- **Two routes measured and rejected.** A style entry cannot carry colours — the MD3 entry's
  tokens are `shape`, `typography`, `elevation`, `sizing`, `motion`, `component`. And
  `light-dark(var(--light-x), var(--dark-x))` passes through the generator verbatim, but the
  stack emits no `color-scheme`, so it could never track `body--dark`; it would resolve light
  in both schemes.
- **One caveat left standing.** A name that reaches the DOM only at runtime — Quasar's
  `color="status-rejected"` prop rather than a literal class in a template — needs a safelist
  entry: the same trap that left `color="error"` painting primary until the md3 roles were
  safelisted.

## Migration

Four shape changes, not sixteen one-offs, because most sites read a central map:

1. **Central maps** (`packages/app/src/configuration.ts`): `DAYCARE_DATE_BUTTON_BG_CLASSES`
   (approved/rejected/pending/standby), `DAYCARE_DATE_COLORS`, `BOOKING_ICON_COLOR`,
   `PET_CHIP_BADGE_COLORS`, `PET_ALERT_COLORS`/`PET_ALERT_FILL_CLASSES`,
   `AGENDA_CHIP_BADGE_COLORS` — these become token names instead of wind4 palette names.
2. **Direct class sites** (10 files): `BookingItem.vue:195,196` ·
   `BookingItemContent.vue:124,140,156` · `InformationPage.vue:23` ·
   `PetCard.vue:2` · `PetItem.vue:2` · `PetSelect.vue:21` ·
   `CustomerDaycareSubscriptionsList.vue:26` · `OpeningTimesList.vue:7` ·
   `KennelLayout.vue:341–368` · `DaycareCalendarMonth.vue` (via map 1).
3. **A test pins the old strings**: `configuration.test.ts:36–39` asserts
   `DAYCARE_DATE_BUTTON_BG_CLASSES.approved === ['bg-green']`; it moves with the map.
4. **The alert family's own sites**: `PET_ALERTS[].color` becomes a token name, and its two
   consumers follow — `PetChip.vue:82` (agenda) and `PetLegend.vue:29` (the legend that teaches
   the hues). The needs-rest shift lands in the same commit, since the value and the name move
   together.
5. **Left alone deliberately**: `OccupancyPage.vue:144–146` paints *bars* with no text on
   them (fill-vs-surface, not text contrast), and `MainLayout.vue:586` already pins dark
   text on a light fill (`bg-grey-2 text-gray-9`) — the second is the manual version of
   this proposal and can be folded in once the tokens exist.
6. **The delivery**: `THEME_COLORS.light`/`.dark` gain the pairs, `unocss.theme` gains the names
   pointing at their `var()`, and any name that only reaches the DOM at runtime gains a
   safelist entry (see above). No new CSS in the app and no new preset rule family.

## Consequences

- The `chip-status` recipe becomes true in both schemes instead of light only, and the
  calendar, agenda, legend, daycare grid, bookings list, kennel layout and pet cards all
  inherit the fix from four central maps.
- `DESIGN.md` stops being able to say "one hex per status": a status is now a pair of
  tones. The rule that carries meaning — one hue, one meaning — is unchanged.
- Statuses stay product constants (a deployment's source colour must not turn "approved"
  another hue), while their dark *tone* is derived. Per-deployment theming does not extend
  to statuses before or after this change.
- The app carries no new CSS: this is tokens plus class names (ADR 002).
- Risk while migrating: a surface that mixes a new `bg-status-*` with the old default ink
  looks correct in light and fails in dark exactly as today, so the gate in *both* schemes
  is what makes the migration safe.
- The alert tile's tint is not undone by this. If the pairs land, the tile can move to
  `bg-alert-*` + `text-on-alert-*` and the tint decision can be revisited on its own merits —
  a solid tile becomes possible again because the fill now has a value per scheme.

## Not covered

- **Print styles** (`packages/app/src/pages/print/*`) — checked, and they carry no palette at
  all: no hexes, no colour classes. The note that stood here ("they pin their own palette") was
  wrong, and there was nothing to fix.
- **The occupancy bars** (`bg-red-4`/`bg-orange-4`/`bg-yellow-4` in `OccupancyPage.vue`) are
  fills with no text on them, so the question is bar-vs-surface, not fill-vs-ink. Measured
  against the dark surface they are 5.72–14.73:1 — they pass, so no change was needed. In the
  *light* scheme they are 1.14–2.92:1, which is subtle; that is a pre-existing heat-map choice,
  and a different question from dark-mode legibility.
- The three families this ADR originally left out — glyph colours, category hues, and the
  disabled/deceased greys — are implemented; see the follow-up note under *Outcome*.

## Outcome (implemented)

Landed app-side only — the preset needed no change, because a `light`/`dark` pair in the
payload already becomes a scheme-flipping `--q-*` (see *How the values reach the DOM*).

- `packages/app/src/theme-tokens.ts` — the pairs, the names, the UnoCSS theme entries and the
  safelist, plus `statusAndAlertTones()` for the payload.
- `App.vue` merges those tones over the deployment's colours (statuses are product constants,
  so a deployment cannot re-hue "approved"), `vitrify.config.ts` turns the names into
  utilities, and the maps in `configuration.ts` name tokens instead of palette colours.
- The alert tile is solid again, carrying `text-on-alert-*` ink; calendar date cells and alert
  chips carry `text-on-status-*`/`text-on-alert-*` instead of inheriting the text colour — the
  half that was missing.
- `PET_ALERTS[].color` is gone from `@petboarding/tools`: alert colour is a token pair now, and
  a wind4 palette name did not belong in a shared package.

Verified: app unit tests 12/12 (including a guard that every payload key kebabizes back to a
token name, and that the light halves are the values the app already shipped); the built
stylesheet emits all nine fills and all nine inks; the browser gate passes in both schemes on
the live stack; the full e2e suite is 119 passed / 0 failed.

### Follow-up: the three families this ADR left out

All three are implemented, on the same branch.

- **Category hues** — `badge-food`, `badge-medicines`, `badge-vaccinations`, `badge-appointment`,
  `badge-double-booked` — now carry pairs, with `on-badge-*` ink. Not statuses, but they are
  fills that carry an icon, so they shared the defect exactly. Ink 5.40–9.18 light, 5.87–7.27 dark.
- **Glyph colours** moved to `icon-*` *foreground* pairs. The opposite case to a fill: the colour
  sits on the surface, so each is dark-in-light and bright-in-dark — the shape of the preset's own
  `positive`/`negative` family. 5.92–7.48 light, 5.37–12.11 dark. The note that stood in *Not
  covered* guessed the preset family was their home; app-side pairs are, because these are the
  app's semantics and the preset ships no matching set for five statuses.
- **Disabled and deceased** stopped being palette greys: `bg-surface-container-high` with
  `text-on-surface-variant` — a surface step plus reduced emphasis rather than a sixth status.
  7.65 light, 8.40 dark, and the same subtle recess (1.19 against the page surface) in *both*
  schemes, where `bg-grey-3`/`bg-grey-5` read as a bright block on a dark page.

`src/theme-tokens.test.ts` asserts the 4.5:1 floor for every pair in both schemes now, so these
numbers cannot rot silently.

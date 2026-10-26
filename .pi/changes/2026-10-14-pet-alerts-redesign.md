# Changes: PetAlerts redesign on the PetCard (2026-10-14)

Critique (`/impeccable critique`) → redesign of the alerts block on the employee
pet card (`/employee/pets/2`): the window is now rendered, each control acts on
its own alert, and the three reported defects (missing date, ambiguous delete on
the chip, oversized hover box) are measured closed.

## New files

| File | Description |
|------|-------------|
| `packages/api/tests/e2e/frontend/pet-alerts.spec.ts` | The regression gate: windows rendered and not elided, no control inside the status shape, every control named, no overlapping controls, all four contrast pairs ≥4.5:1 in **both** schemes (with an oklab-aware contrast helper — the existing probe silently skips `oklab()` colours), and each row's × opening *its own* confirmation. |
| `.changeset/pet-alerts-row.md` | Changeset (`@petboarding/app`, `@petboarding/api` patch). |
| `.impeccable/critique/2026-10-14T16-19-00Z__packages-app-src-components-pet-petcard-vue.md` | The critique snapshot (13/40 → Poor), beside the two existing snapshots. |
| `.pi/reports/2026-10-14-pet-alerts-redesign.typ` | Typst change report (source; PDF rendered beside it). |

## Modified files (all hunks accepted)

| File | Lines | Description |
|------|-------|-------------|
| `packages/app/src/components/pet/PetCard.vue` | +208/−83 | Alerts block rebuilt as rows: status tile + condition inside a real `q-btn` (the edit affordance, `aria-label`, keyboard + SR path) with the window as an overline line under it, and a labelled delete `q-btn` as a sibling; delete glyph carries `class="text-error"` (the theme's `--q-error`, mode-aware) instead of the palette's `red` (2.5:1 on the light card); the `title`-only chip, the `dense` no-op, the in-chip 48px button and the dead `saveAlerts` are gone; `alertWindow` formats a range with `Intl.formatRange` (locale-correct collapse: `Jan 5 – 12, 2024` / `5–12 jan 2024`), `Since`/`Until`/`Ongoing` for open ends; `openCreateAlert`/`openEditAlert` prefill the dialog (`updateAlert` wired for the first time); `createAlert` merges the **server row** so a new alert is editable and deletable immediately; the delete dialog names the action, the condition and the window and uses a verb (`ok: lang.delete`). |
| `packages/app/src/components/pet/PetAlertsForm.vue` | +34/−5 | `setValue(null)` resets condition/dates and clears stale validation; `endDate >= startDate` is refused with a localized message (a partial/ISO guarded compare); the condition's `'Required'` literal became `pet.validations.fieldRequired`. |
| `packages/app/src/configuration.ts` | +28 | `PET_ALERT_FILL_CLASSES` (tile classes as literals, so UnoCSS generates what a template string cannot — the rationale `PET_ALERT_ICONS` already documents) and `PetAlertRow` (a row typed from the model, so the API's optional-with-null dates and the app's required ones stop being cast between). |
| `packages/app/src/lang/{index,en-US,nl}.ts` | +22/−4 | `pet.alerts.{since,until,ongoing,editAlert,deleteAlert,endBeforeStart}` in the `Language` interface and both locales. |
| `packages/api/src/zod/pet.ts` | +4 | `Pet.alerts` carries `id` — type-only, additive: the delete and update endpoints always required it, and the UI read a field its own model type denied (9 `Property 'id' does not exist` errors at baseline). |
| `packages/docs/public/screenshots/employee-pet-alerts.png` | binary | Regenerated with the repo's own `screenshots-pet-alerts.spec.ts` on a freshly seeded stack. |

## Verification

- `packages/api/tests/e2e/frontend/pet-alerts.spec.ts` green (both schemes) on a reset stack.
- Full e2e suite green on a freshly seeded stack (see the run log).
- `pnpm run lint`, `pnpm run format:check`, the Docker app build, and the app's type check compared against a **stashed baseline** (393 → 387 errors, no new message: the 6 fewer are this change's `Property 'id'` fixes).
- Upstream (separate repo): `unocss-preset-quasar` — the MD3 role classes were missing from the safelist, so a component's `color="error"` had no rule and painted `--q-primary` (measured). Fixed there with ADR 0021, a changeset and `test/safelist-md3-tokens.test.ts`; that repo's suite is 455/455. Petboarding stays on the published 0.7.0 until that release lands.

## Follow-up: the approval report, and the proposed colour pairs (2026-10-14)

The client-facing rewrite of the change report, plus the decision document that the
redesign's one visible compromise pointed at.

### New files

| File | Description |
|------|-------------|
| `.pi/reports/after-light-crop.png`, `after-dark-crop.png` | The alerts block captured from the running final code in **both** schemes. The dark capture is new evidence: dark-mode contrast had only ever been computed here, never shown. |
| `.pi/reports/edit-dialog.png` | The prefilled edit dialog cropped to the dialog — the affordance that did not exist before. |
| `docs/adr/005-status-colour-pairs.md` | **Proposed** ADR: per-scheme `status-*` + `on-status-*` pairs, the per-condition `alert-*` family, and the delivery mechanism measured against the installed preset. |

### Modified files (all hunks accepted)

| File | Lines | Description |
|------|-------|-------------|
| `.pi/reports/2026-10-14-pet-alerts-redesign.typ` | rewrite | Rebuilt for the reader who has to approve it, not the engineer who wrote it: the ask and the before/after evidence on the cover, the change in plain language, the measurements, scope and rollback, the two findings outside the card, and a decision page. Every page re-rendered as a PNG and inspected; marker placements measured from the crops rather than guessed. |
| `.pi/reports/2026-10-14-pet-alerts-redesign.pdf` | 5 pages | Re-rendered; second compile silent. |
| `.pi/changes/2026-10-14-pet-alerts-redesign.md` | this section | Recap extended. |

### The delivery mechanism ADR 005 pins (measured, not assumed)

A throwaway generator probe against the installed preset, then the emitted CSS: a theme colour
whose value is `var(--q-*)` produces a working utility, and a nested `{ DEFAULT, ink }` entry
produces both halves of a pair at once. Two limits are real — the `/opacity` modifier emits **no
rule** on a `var()` value (so a tint must be its own `color-mix()` entry, which does emit), and a
bare literal hex in a new theme key emits nothing at all. `setThemeColors` writes every key of
`THEME_COLORS.light`/`.dark` into one injected stylesheet — light under `:root`, dark under
`body.body--dark`, so the dark values can be scoped — which means a payload pair yields a
scheme-flipping `--q-*` with **no preset change**. Rejected with evidence: a style entry cannot
carry colours (the MD3 entry's tokens are `shape`, `typography`, `elevation`, `sizing`, `motion`,
`component`), and `light-dark()` cannot track `body--dark` because the stack emits no
`color-scheme`.

### Verification

- `typst compile` silent on the second run; 5 A4 pages; `pdftotext` checks for the marker
  legends and the corrected `id` row; no `TODO`/placeholder text.
- The evidence captures came from a throwaway spec run against the live final stack
  (`E2E_OWN_STACK=0`); the spec was deleted afterwards, and the gate remains
  `frontend/pet-alerts.spec.ts`.

## The colour tokens, implemented (2026-10-14)

ADR 005 went from proposed to accepted. Its delivery needed **no preset change**: a
`light`/`dark` pair in the theme payload already becomes a scheme-flipping `--q-*`.

### New files

| File | Description |
|------|-------------|
| `packages/app/src/theme-tokens.ts` | The pairs (five statuses, four alert conditions), the names, the UnoCSS theme entries and the safelist, plus `statusAndAlertTones()` for the payload. |
| `packages/app/src/theme-tokens.test.ts` | The drift guard: every payload key kebabizes back to a token name, every token has a dark half of its own, the light halves are the values already shipped, and the safelist covers what Quasar composes. |
| `.changeset/status-colour-tokens.md` | Changeset (`@petboarding/app` minor, `@petboarding/tools` minor). |

### Modified files (all hunks accepted)

| File | Lines | Description |
|------|-------|-------------|
| `packages/app/src/configuration.ts` | +58/−28 | The alert family as token names derived from the enum; `PET_ALERT_FILL_CLASSES`/`PET_ALERT_INK_CLASSES` solid; `DAYCARE_DATE_COLORS` and the date-cell classes on `status-*` + `text-on-status-*`. |
| `packages/app/vitrify.config.ts` | +41/−1 | The token names as UnoCSS theme colours (`var(--q-*)`) plus the safelist, spelled out locally because this config is transpiled to `.js` and executed by Node, so it cannot import a `.ts` module (`ERR_MODULE_NOT_FOUND`). |
| `packages/app/src/App.vue` | +10/−3 | Merges the app's tones over the deployment's colours — a status is a product constant — and applies them even when nothing is configured. |
| `packages/app/src/components/pet/{PetCard,PetChip,PetLegend}.vue` | small | The tile's ink class; `text-color="on-alert-*"` on the chips; the legend reads the token maps instead of `PET_ALERTS[].color`; the alert badge gains `data-testid="pet-alert-badge"`. |
| `packages/tools/src/constants/index.ts` | +8/−8 | `PET_ALERTS[].color` removed — alert colour is a token pair now, and a wind4 palette name did not belong in a shared package. |
| `DESIGN.md` | +43/−2 | The status/alert pairs and their inks, the `chip-status` recipe now `textColor: {colors.on-status-*}` (with `on-status-*: {colors.on-surface}`), and a new **Status Ink Rule**. |
| `docs/adr/005-status-colour-pairs.md` | accepted | Status flipped to accepted, an Outcome section, and two families added to *Not covered* (glyph colours, category hues). |
| `packages/api/tests/e2e/frontend/agenda.spec.ts` | +5/−5 | Its alert-badge detector sniffed `bg-(pink\|yellow\|blue)`; it now finds the badge by testid, so renaming a token cannot silently empty it. |

### Verified

- App unit tests **12/12** (3 files), including the new guard and the updated pins.
- The built stylesheet emits all nine fills (`background-color:var(--q-alert-needs-rest)`) and all nine inks (grouped, `color:var(--q-on-surface)`), read out of the served CSS.
- Browser gate **2/2** in both schemes on the live stack; full e2e **119 passed / 0 failed / 5 skipped** on a freshly seeded database.
- The suite caught one real staleness: the agenda spec's colour sniffing (above).

### Notes for the next reader

- The app-container image builds **once `env/SIMSUSTECH_NPM_TOKEN` exists in the worktree**.
  Without it, compose passes an *empty* build secret, `pnpm deploy` then fails its supply-chain
  policy check with a `401` from the private registry, and the message blames the registry rather
  than the missing file. With the token in place the documented build succeeds, and the full
  suite runs **119 passed / 0 failed** against the built image. An earlier pass verified the same
  code by copying the freshly built app into the running container (`docker cp`, stale `.gz`
  removed, restart).
- Running the full suite after a container restart re-seeds an already-seeded database and
  produces false failures (9 pets instead of 7). Wipe the schema first
  (`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`), then restart the app container.
- `vitest` was imported by app test files but declared by no package (the tests run through
  `pnpm vitrify test`), so TypeScript could not resolve it. It is declared in `packages/app` as
  `^5.0.4` now, and a reinstall deduped the store to a single 5.0.4 copy — vitrify's `^5.0.3`
  range is satisfied by it, so the runner and the types agree again.

## The parked families, fixed (2026-10-15)

ADR 005 parked five items as "not covered". Three were real defects and are implemented; two
turned out to need no change, and the ADR now records why, with the measurements.

### New token families (`packages/app/src/theme-tokens.ts`)

| Family | Tokens | Why it needed a pair |
|--------|--------|----------------------|
| Category fills | `badge-food`, `badge-medicines`, `badge-vaccinations`, `badge-appointment`, `badge-double-booked` | Not statuses, but fills that carry an icon — the same defect as the alert tiles |
| Foreground accents | `icon-approved`, `icon-rejected`, `icon-canceled`, `icon-pending`, `icon-standby` | The opposite case: the colour sits *on* the surface, so each is dark-in-light and bright-in-dark |

Fills and foregrounds are separate lists now (`FILL_TOKENS` / `FOREGROUND_TOKENS`), because a fill
carries an ink (`on-*`) and a foreground *is* the ink — so only fills get an `on-` entry.

### Modified files (all hunks accepted)

| File | Description |
|------|-------------|
| `packages/app/src/configuration.ts` | The two category maps and the glyph map name tokens; two new ink maps |
| `packages/app/vitrify.config.ts` | The new names in the UnoCSS theme and safelist, split fills/foregrounds |
| `packages/app/src/App.vue` | `statusAndAlertTones()` → `tokenTones()` |
| `PetChip.vue`, `PetLegend.vue`, `AgendaChip.vue`, `AgendaLegend.vue` | `text-color="on-badge-*"` on every category badge |
| `CustomerDaycareSubscriptionsList.vue`, `PetSelect.vue`, `OpeningTimesList.vue`, `PetItem.vue`, `PetCard.vue` | `bg-grey-3`/`bg-grey-5` → `bg-surface-container-high text-on-surface-variant` |
| `src/theme-tokens.test.ts` | The new families, plus a **WCAG contrast guard** asserting 4.5:1 for every pair in both schemes |
| `src/configuration.test.ts` | The glyph pins follow the tokens |
| `DESIGN.md` | The badge/icon families, the de-emphasis recipe, and a new **Foreground Rule** |
| `docs/adr/005-status-colour-pairs.md` | The resolved families under *Outcome*; the two no-change items with their numbers |

### Verified

- Measured before committing: category fills 5.40–9.18 light / 5.87–7.27 dark; foregrounds
  5.92–7.48 / 5.37–12.11; de-emphasis 7.65 / 8.40. Every pair ≥ 4.5:1.
- Unit tests **13/13**; the built stylesheet emits all 11 new utilities (5 fills, 5 foregrounds,
  and the badge ink); the app image builds; the full e2e suite is **119 passed / 0 failed**.

### Not fixed, and why

- **Print pages** carry no palette at all — no hexes, no colour classes — so there was nothing to
  fix. The ADR's earlier claim that they "pin their own palette" was simply wrong.
- **The occupancy bars** are fills with no text on them, so the question is bar-vs-surface:
  measured 5.72–14.73:1 against the dark surface, they pass. (The light scheme's 1.14–2.92:1 is
  pre-existing heat-map subtlety, a different question.)
- **The docs screenshots could not be regenerated.** `screenshots-customer.spec.ts` fails all four
  variants on a login timeout — the page snapshot shows the Login form, so the session is not a
  customer — and that spec is gated behind `PLAYWRIGHT_ALLOW_SCREENSHOTS`, which CI never sets.
  The captures the failing run produced were reverted rather than committed. A regeneration pass
  is still owed; note also that the committed captures drift with the date, so a wholesale
  regeneration would mix date churn with colour churn.

## The preset pin, landed (2026-10-15)

`unocss-preset-quasar` **0.7.3** is released and pinned (was `0.7.0`), which closes the last item
on the change report's next-steps list.

**What it fixes, measured in this app's own built stylesheet.** A colour asked for by *name*
composes its class at runtime (`color="error"` → `bg-error`), and UnoCSS's content scan cannot see
a class that only exists at runtime. The preset's safelist carried the Quasar palette but not the
MD3 roles, so those classes were never emitted and the element painted nothing — `color="error"`
fell back to `--q-primary`.

| class | 0.7.0 | 0.7.3 |
|---|---|---|
| `bg-error` | missing | present |
| `text-on-error` | missing | present |
| `bg-surface-container-highest` | missing | present |

`text-on-surface-variant` was present in both — but only because this app uses it as a *static*
class, which is precisely what hid the bug.

**Verified before trusting the version number.** The published tarball was inspected: it carries
`dist/core/colors/md3-tokens.js` and a `safelist.js` that imports `md3Tokens` from it. The app's
build is clean on 0.7.3 and the full e2e suite passes — 118 passed with one transient
`ERR_NETWORK_CHANGED` (the stack had been recreated immediately before the run; the spec passes
on re-run). The bump also carries 0.7.1 and 0.7.2 (a QTimeline class-icon sizing fix and a
`.q-timeline__title` role); neither regressed anything here.

**The client report is deliberately not updated.** Its next-steps list names "release and pin the
library fix", which is now done, so one of its approval options is moot. It stays as it is on
purpose: it is the record of what was presented for approval on 14 October, and editing its
content on the 15th while its pinned date says the 14th is the exact drift this session fixed
elsewhere. The recap is the living record; the report is the snapshot.

## The pet-card width cap, pinned away (2026-10-15)

`@simsustech/quasar-components` **0.12.14** is pinned (was `0.12.13`), which removes the 300px
card cap — the last item on the change report's follow-up list.

**What it was.** `QStyledCard` carried `style="max-width: 300px; padding: 2px"`, so every card
rendered 300px inside a ~445px column at 1440: grid cards hugged their content, the
columns/gutters never filled (the pets, contact-people and account grids), and an alert's date
range wrapped onto a second line on a desktop card instead of fitting on one.

**No upstream code change was needed.** The fix already existed — `e8e8e117`, committed
2026-10-06, "let QStyledCard fill its container instead of capping at 300px" — and 0.12.14
(published 2026-10-13, two days before the pin) is the first release carrying it. petboarding was
on 0.12.13 (published 2026-10-05, the day *before* the fix), which is why it still capped.

**Verified in this app's installed copy**, not from the version number:

| | 0.12.13 | 0.12.14 |
|---|---|---|
| installed version | 0.12.13 | 0.12.14 |
| `max-width: "300px"` in `QStyledCard` | present | absent |

The published tarball was checked as well: 0.12.14's `dist/general.js` has **zero** `max-width`
occurrences. No `minimumReleaseAgeExclude` exemption was needed either — 0.12.14 predates the pin
by two days, so it clears the 24h gate on its own (unlike the preset's 0.7.3, published minutes
before its pin).

**Verified.** The app image builds clean; the full e2e suite is **119 passed** with one timing
flake (`palette.spec.ts`'s past-booking-row locator, which passes on re-run — the stack had been
recreated immediately before the run, the same pattern as the earlier `ERR_NETWORK_CHANGED`). The
layout genuinely changes — cards now fill their columns — and nothing regressed, including that
spec's day-number contrast assertions.

**Debt this creates:** the committed docs screenshots of the pets, contact-people and account
grids now show 300px cards and are stale. Regeneration is still blocked by the broken
`screenshots-customer.spec.ts` (login timeout) and by the date drift noted above, so it remains
one pass of its own.


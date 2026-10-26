# @petboarding/app

## 0.8.0

### Minor Changes

- 2ff4a0a: Agenda calendar UX pass — six findings from the 2026-09-30 audit, plus the day-measure follow-up:
  
  - A quiet period no longer swaps the whole agenda for one sentence: the calendar, date picker, Status filter, Day/Week toggle, prev/next/Today and legends stay mounted, and the quiet message renders inside the grid (new `agenda.emptyDay` wording for day view).
  - The grid fills the page (the content-sized outer scroll area and its resize observer are gone; the calendar is a flex child with a 20rem floor), the page scrolls instead of squeezing the grid, and a swipe hint (`lt-md`) announces the week's horizontal scroll on phones.
  - Empty cells stay silent: `Bookings 0` / `Daycare 0` labels and their separators only render when the count is above zero.
  - Both legends moved behind a `Legend` button (menu, keyboard-reachable, Escape/outside-click closes); the Last-name toggle stays inline, so the grid is no longer pushed below the fold on mobile.
  - Day view lays its sections on a centred 48rem measure instead of a 12em island in a 1174px band.
  - PetChip badges (food, medicines, vaccinations, pet alerts, `#badge`) wrap in a row below the label instead of floating at `top: -10px` over the name; `#bottom-badge` badges are untouched.
  
  Guarded by `packages/api/tests/e2e/frontend/agenda.spec.ts` (7 E2E tests).
- ca62816: feat(app): add an upcoming-dates list to the account daycare page, and load every upcoming date
  
  `/account/daycare` showed a customer's dates only as chips inside the month grid:
  windowed to the visible month, unreadable for a plan that reaches into next year,
  and impossible to act on without first finding the right cell.
  
  - The page now renders a **chronological list of all upcoming dates** under the
    grid, grouped by month with that month's count, and one row per date carrying
    the date as an overline, the pet names, a status pill (the fixed status colour
    **and** its word) and a cancel action that reuses the existing confirmation
    dialog.
  - `useAccountGetDaycareDatesQuery` no longer narrows to a window: it loads from
    today with no upper bound, so the grid and the list read from one set. Its
    `from`/`until` refs were not part of its cache key, so a fetch used to depend on
    whichever month had been navigated last — and @pinia/colada shares those refs
    with `DaycarePageFabs`, which is how the same customer could get different data
    on consecutive loads.
  - One consequence worth naming: the grid no longer draws chips for past months,
    and the FAB's "seek attention" pulse now means "no **upcoming** dates".
  
  Grid + agenda is the pairing Apple Calendar, Google Calendar and Fantastical all
  ship: the grid answers "how does my month look", the list answers "when am I
  booked, and what is its status" without navigating. The row's longest copy (the
  Dutch `Wacht op goedkeuring.`) was measured at 375px: no horizontal overflow.
- 20a8f3f: feat(app): replace kennel layout drag & drop with a tap-to-assign kennel picker
- 77d2e82: Status and pet-alert colours become per-scheme token pairs (ADR 005).
  
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

### Patch Changes

- dccd0ed: feat: show internal customer comments on the employee customer card
  
  `CustomerCard.vue` rendered rating, name/address, phone, veterinarian and email, but no comment section — even though `Customer.comments` already exists end to end (DB column, zod schema, employee `getCustomer` select, and the edit dialog via `CustomerForm`'s `useComments`).
  
  Adds an opt-in `useComments` prop that renders a comment row, enabled only by `pages/employee/CustomersPage.vue`. The customer-facing `pages/account/CustomerPage/CustomerPage.vue` leaves the flag off, so internal comments remain invisible to customers.
- 24a00aa: fix(app): one stable add-dates instruction row on the account daycare page
  
  `/account/daycare` rendered two mutually exclusive card sections driven by the
  fetched `data`: an empty state when `!data?.length` and an "Add more daycare
  dates" bar when `data?.length`. That fetch is windowed — after any interaction the
  page's `onChangeDate` writes the calendar's visible month into the query's
  `from`/`until`, and `defineQuery` shares those refs with the FAB — so a customer
  whose dates sat outside the visible month watched the bar disappear and the page
  claim "No daycare dates yet" while their dates were still there.
  
  The two branches are replaced by a single instruction row that is always
  rendered and reads no data, so it can no longer flip. Its copy states the real
  order of the flow — press the plus first, then pick dates in the dialog:
  
  - en: `Select the plus button to add dates.`
  - nl: `Kies het plusje om datums toe te voegen.`
  
  The four keys the old branches used (`noDaycareDates`, `addFirstDaycareDates`,
  `addMoreDaycareDates`, `selectDatesThenSave`, whose Dutch value narrated the
  steps backwards) are gone, replaced by `selectPlusToAdd` in `en-US.ts`, `nl.ts`
  and the `Language` interface. The row also carries the scheme's ink instead of a
  `text-grey-7` caption, which measured under 4.5:1 on the tinted container.
- 0531e74: fix(app): let the daycare form's own submit button finish the submit
  
  A customer submitting daycare dates got `TypeError: done is not a function` — the
  reported "done is not a function (in 'done')" is that message in Safari's wording —
  *after* the dates had already been saved, leaving the create dialog open on an
  error toast.
  
  `DaycareForm`'s single `@submit` handler serves two contracts: `ResponsiveDialog`
  reaches it through `functions.submit({ done })`, while the form's own
  `type="submit"` button reaches it through QForm, which emits the DOM submit event.
  Destructuring `{ done }` from that event gave `undefined`, so the page's `done()`
  threw. `done` is optional now and each call site guards it, and the page closes the
  dialog itself, so both affordances behave the same.
  
  `tests/e2e/daycareSubmit.spec.ts` drives the customer path through the form's own
  button and reported the exact TypeError before this change.
- 5ff9765: Layout/colour audit pass (2026-10-06), from a programmatic sweep of every route
  × viewport × scheme:
  
  - The 404 page no longer paints itself `bg-primary text-white`: the primary is a
    light teal in dark mode, so the headline measured 1.71:1 there. It now uses a
    surface with a primary numeral and a flat primary CTA.
  - Print pages pin the surface-container family, not just `--q-surface`, so a card
    on `/print/overview` no longer goes near-black on near-black (1.04:1) in a dark
    session.
  - The employee pets/customers empty state drops `text-grey-7` (3.71:1 on the dark
    surface) for `text-on-surface-variant`.
  - Content links use the preset's own `q-link` class instead of each page pairing
    `text-$light-primary dark:text-$dark-primary`. The preset carries
    `color: var(--q-primary)` on it from 0.6.5 (see the `unocss-preset-quasar`
    changeset), and that role already flips per scheme. `.q-link` also removes the
    browser underline, so the links read as colour-only, like the rest of the
    Material surfaces.
  
  Guarded by `packages/api/tests/e2e/frontend/layout-audit.spec.ts`; the audit
  instrument is `packages/api/tests/e2e/screenshots-contrast.spec.ts`.
- ca8adbc: fix: restore clickable Quasar dropdown options inside dialogs
  
  Quasar's QDialog menu portal uses the `all-pointer-events` class, but the CSS rule was never generated because `@unocss/preset-wind4`'s `all` scope variant consumes the `all-` prefix, so the preset rule never matched. This made select dropdown options (e.g. Gender) unclickable — a `q-field__bottom` element intercepted pointer events.
  
  Fixed by emitting `.all-pointer-events { pointer-events: all !important }` as a preflight in `unocss-preset-quasar` (bypasses token matching) and linking the local preset into the build.
  
  Also ports slimfact's local-package linking strategy into the Dockerfile (copy local packages into the workspace glob + inject `link:` overrides + `--no-frozen-lockfile`) so the app build resolves the linked `unocss-preset-quasar` instead of the published registry version, and aligns unocss to 66.8.0.
- 77d2e82: Pet-card alerts: the window is on screen, and each control acts on its own alert.
  
  - An alert is now a row — status tile, condition, window — instead of a strip of chips. A closed window renders as the locale's own range (`Jan 5 – 12, 2024` / `5–12 jan 2024`), an open end reads `Since`/`Until`, and an alert with no window reads `Ongoing`. The dates were previously readable only inside the delete confirmation, so an expired alert looked live. The window wraps rather than eliding (the app's own wrap rule for a dated label in a dense row).
  - The delete control is no longer a 48×48 button inside a 16px chip. It was taller than the chip it sat in, so consecutive alerts' buttons overlapped and clicking the × painted on "Aggressive" opened **"Diabetic"**'s confirmation. Delete is now a labelled row action, and the condition itself is the edit affordance — a real button with an `aria-label`, which also wires the previously unused `employee.updateAlert` mutation so a window can be corrected instead of deleted and re-created.
  - The status tile is a 40% tonal tint of the condition's hue under an ink glyph, not a solid 400-shade chip under white text. White measured 1.53:1 on yellow and 2.77:1 on red; a *solid* fill under ink measures 6.19:1 in light but **2.14:1 in dark**, because the fill is fixed while the ink token flips with the scheme. The tint lets the scheme's own surface carry it: 10.7:1 light, 6.6:1 dark.
  - Every control in the block gained an accessible name (row edit, delete, add).
  - `PET_ALERT_FILL_CLASSES` keeps the four tile classes as literals so UnoCSS generates them, and `PetAlertRow` types a row from the model. The API's `Pet.alerts` shape now carries `id`, which the delete and update endpoints always required.
  - The alert form resets between opens, refuses a reversed window, and uses the localized required-field message.
  
  Guarded by `packages/api/tests/e2e/frontend/pet-alerts.spec.ts` (windows rendered and not elided, no control inside the status shape, every control named, no overlapping controls, all four contrast pairs ≥4.5:1 in **both** schemes, and each row's × opening its own confirmation).
- 77d2e82: Pin `unocss-preset-quasar` 0.7.3 — the MD3 role classes now reach the stylesheet.
  
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
- 82b4cde: Pin `unocss-preset-quasar` 0.7.4 — an unplaced popup stays hidden, and the individual
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
- 77d2e82: Pin `@simsustech/quasar-components` 0.12.14 — the 300px card cap is gone.
  
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
- 800503a: Bump `unocss-preset-quasar` to 0.8.0, which stacks an item row whose trailing
  slot holds a state control on phones.
  
  The preset's item anatomy gives the side section `flex: 0 1 auto` with no shrink
  on its content and the main section a `nowrap`, clipped label, so a wide control
  in that slot took the row's width. Measured on the relation picker
  (`PetCard.vue` → `PetSelect` `#side` with a `size="2em"` q-rating) at a 360px
  viewport: the rating was 218px of a 342px row and the label kept **76px of the
  207px** its text needs — `name1 lastName1 - name1 - Male` rendered as
  `name1 las…`, which read as though the stars had replaced the name.
  
  0.8.0 stacks such a row below 599.98px (label full width, control beneath and
  left-aligned) for `.q-rating`, `.q-toggle`, `.q-checkbox` and `.q-radio` —
  through the preset's media-family preflight, since a UnoCSS rule body cannot
  carry an at-rule. A trailing button is deliberately outside the selector: it is
  one control wide and never squeezed a label, and including it turned this app's
  card header rows from 65px into 145px each.
  
  After the bump, measured on the same route: label 304 of 304px at 360px and 356
  of 356px at 412px, stars below at the label's own left edge, 42×28 per star, and
  the card header rows unchanged at 65/64/65px.
  
  Guarded in `~/Projects/quasar-testing-harness` by
  `tests/q-item-side-control.spec.ts` (fixture `/q-item-side-control`): red against
  the pre-fix preset (label 82 of 277px), green against 0.8.0.
- 481a462: fix: move PetItem rating out of side section to prevent mobile overlap
  
  PetItem's q-rating was in a `<q-item-section side>` that overlapped with the
  main content text on narrow viewports. Moved it into its own `<q-item-label>`
  below the name — natural document flow keeps it below on all screen sizes.
  
  PetCard's q-rating was in a separate `<div class="row justify-center">` that
  overlapped the name on mobile. Merged it into the same flex row as the name,
  where flexbox handles wrapping naturally on narrow screens.
  
  Added a `rating` field to the test seed for pet ID 2 and an e2e test that
  verifies no visual overlap on a 390×844 mobile viewport.
- 67dfba9: fix: apply the runtime theme colors (bump `unocss-preset-quasar` to 0.6.2)
  
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
- e663509: Move daycare subscription edit button into a more-options menu for cleaner layout.
- f087283: fix(app): render the pet Food field at the standard input height
  
  The PetFoodInput's grey control was 88px tall (a stacked-label band plus a row of
  nested q-fields) against 56px for every sibling input, so it overran its grid row.
  The inner controls are now native inputs, and the field is 56px like the rest.
- a2e1ef6: Increase invoice button height and add border radius for better touch targets.

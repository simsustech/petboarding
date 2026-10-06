# Changes: layout audit — dark-mode colour, link theming, footer/grid fixes (2026-10-06)

Full visual/layout audit of `packages/app` with a Playwright capture harness
(3 viewports × light/dark), then a programmatic sweep that replaced the visual
review of the remaining sheets (the image reader stalled mid-session and returned
one cached sheet for every path, including a 300-byte PNG written to prove it).

## New files

| File | Description |
|------|-------------|
| `packages/api/tests/e2e/frontend/layout-audit.spec.ts` | 12 regression tests: 9 app-level assertions (footer tabs fit 375, booking duration reachable, agenda hint only on real overflow, occupancy label, link theming, drawer labels, 404 contrast, empty-state contrast) + 3 upstream-gated ones that skip while the bundle still ships the pre-fix rules. |
| `packages/api/tests/e2e/screenshots-contrast.spec.ts` | Colour/contrast/geometry probe: every route × 3 viewports × light/dark, one JSON line each with low-contrast text, UA-blue links, badge colours and card-vs-column widths. 198 rows; 12 tests pass. |
| `packages/api/tests/e2e/screenshots-grids.spec.ts` | Capture harness for grids that need data (`/employee/pets/1/2/3`), which the single-id routes never render. |
| `packages/api/tests/e2e/screenshots-layout-probe.spec.ts` | Geometry probe (147 rows): document overflow, clipped/unreachable elements, text cut without ellipsis, sub-32px touch targets, in-page scrollers. |
| `packages/api/tests/e2e/screenshots-interrogate.spec.ts` | Targeted measurements behind each fix (footer tab geometry, booking label box, agenda scroll width, dialog-after-Escape, drawer label boxes). |
| `packages/api/tests/e2e/screenshots-tokens.spec.ts` | Debug aid: dumps the computed colour chain and the CSS rules that win a background for one element — used to tell a real contrast failure from a `color-mix()` parsing artifact. |
| `.changeset/layout-audit-dark-mode-colour.md` | Changeset for the app-side fixes. |

## Modified files (all hunks accepted)

| File | Lines | Description |
|------|-------|-------------|
| `packages/app/src/pages/Error404Page.vue` | +19/-8 | Was `bg-primary text-white`: the primary is a light teal in dark mode, so the headline measured **1.71:1**. Now a surface with a primary numeral and a flat primary CTA — a *filled* `bg-primary` button cannot be relied on, because Quasar's own `.q-btn { background-color: transparent }` loads after the preset's utilities and only loses in dark mode, where `.body--dark .bg-primary` out-specifies it (measured transparent in light, 2026-10-06). |
| `packages/app/src/layouts/PrintLayout.vue` | +12/-1 | Print pages pinned `--q-surface` but not the container family, so a card inside kept the dark `--q-surface-container-low` and put near-black text on a near-black card (**1.04:1**, `/print/overview` in a dark session). |
| `packages/app/src/pages/employee/PetsPage.vue` | +6/-4 | Empty-state hint `text-grey-7` (3.71:1 on the dark surface) → `text-on-surface-variant`. Pet grid: `col-12 col-md-4` wrapper so cards fill their column. |
| `packages/app/src/pages/employee/CustomersPage.vue` | +8/-2 | Same token swap for the customer search hint. |
| `packages/app/src/pages/InformationPage.vue` | +9/-3 | Terms link wore the UA default blue (`rgb(0, 0, 238)`); now the preset's `q-link text-primary`. |
| `packages/app/src/layouts/NavigationTabs.vue` | +26 | Footer bar: content was 378px in a 375px bar (Home tab at x=-3, arrows over the tabs). Flex + ellipsis rules for `.navigation-tabs-footer`. |
| `packages/app/src/layouts/MainLayout.vue` | +11/-2 | Dropped the redundant `q-px-md` (the preset already gives `.q-drawer__content > *` 28px — 44px a side double-padded) and marked the footer instance. |
| `packages/app/src/components/AgendaComponent.vue` | +36 | Swipe hint showed at 768 where the week did not overflow (scrollWidth == clientWidth); it is now gated on a measured overflow via ResizeObserver. |
| `packages/app/src/components/pet/PetForm.vue` | +6/-4 | Textarea rows via `rows="3"` instead of `row` + `q-col-gutter-mds="3"` on a field. |
| `packages/app/src/components/AvailabilityCard.vue` | +8/-4 | Availability link on `q-link text-primary`; dialog link markup closed. |
| `packages/app/src/components/booking/BookingExpansionItem.vue` | +2/-2 | Booking date/duration label wraps instead of clipping at 375 (anchor measured x=507–568, unreachable). |
| `packages/app/src/components/booking/BookingItemContent.vue` | +2/-2 | Same wrap rules for the duration label. |
| `packages/app/src/pages/account/BookingsPage/BookingsPage.vue` | +8/-4 | Content link on `q-link text-primary`. |
| `packages/app/src/pages/account/ContactPeoplePage/ContactPeoplePage.vue` | +10/-4 | `row q-col-gutter-md` grid + link on `q-link text-primary`. |
| `packages/app/src/pages/account/CustomerPage/CustomerPage.vue` | +2/-1 | `row q-col-gutter-md` grid. |
| `packages/app/src/pages/account/DaycarePage/DaycarePage.vue` | +8/-4 | Content link on `q-link text-primary`. |
| `packages/app/src/pages/admin/OccupancyPage.vue` | +1 | The date field had no label (`label: null`) while every other date field has one. |
| `packages/api/tests/e2e/frontend/not-found.spec.ts` | +12/-18 | The 404 spec pinned the old hand-made white CTA; it now asserts the CTA label uses `--q-primary`, read from the element that carries the theme. |
| `packages/api/tests/e2e/screenshots-audit.spec.ts` | +53/-26 | Harness: menu capture opened the menu a second time and closed it (every flow-menu shot was of a closed menu); persistent dialogs are closed via ✕ because Escape only shakes them; tablet viewport added; stale dark routes corrected. |
| `packages/api/tests/e2e/screenshots-dark.spec.ts` | +13/-8 | Tablet viewport; three routes pointed at paths that no longer exist. |

## Upstream (separate repos, committed there)

| Repo | Commit | Description |
|------|--------|-------------|
| `unocss-preset-quasar` | `4f65656` | Drop the redundant `.body--dark .q-badge` / `.q-date__event` twins — at (0,2,0) they beat `.bg-green` and collapsed all 13 coloured badges to the dark primary (**5 statuses → 1 colour** in every dark capture). |
| `unocss-preset-quasar` | `d56786e` | The plain gutter class states both axes (`column-gap` **and** `row-gap`), as quasar.css does. |
| `unocss-preset-quasar` | `fc4892b` | Emit the dark date-picker day colour after the rule it must beat: the day numbers rendered in `--q-on-primary` (#003739) with the primary background losing to Quasar's unlayered `.q-btn--flat { background: transparent }` — **1.31:1** on the dark surface, an invisible calendar. |
| `unocss-preset-quasar` | `8c8b3f9` | Stop making consumer pages hand-roll colour defaults: a dark brand surface pairs with its on-colour for white labels (Quasar's `color="primary"` paints `bg-primary text-white` — **1.71:1** on the dark fill, now 7.66:1), and `.q-link` carries `color: var(--q-primary)` so a bare anchor stops falling through to the browser's blue. |
| `quasar-components` | `e8e8e117` | QStyledCard drops its inline `max-width: 300px`, which capped every card at 300px inside a 445px column. |

All four preset changes shipped in **0.6.5**, which this repo then bumped to
(`e77299e4c chore: update dependencies`). The quasar-components fix is still
unreleased, so its card assertion is the one remaining gated skip.

## Verification

- `packages/api/tests/e2e/frontend/layout-audit.spec.ts`: 11 passed, 1 skipped
  (the QStyledCard card assertion — that fix is unreleased). The badge-twin and
  gutter assertions now run for real, against 0.6.5.
- Full frontend suite: 69 passed, 2 skipped.
- Full e2e suite after the 0.6.5 bump: **117 passed, 5 skipped, 0 failed**. Two
  failures surfaced on the way and both were test-side:
  - the gutter assertion pointed at `/account/contactpeople`, which renders an
    empty state for this account (no gutter row) — it now measures the pet grid;
  - `account.spec.ts`'s `text=Al` matched "M**al**e", "Post**al** code" and the
    still-mounted add dialog (strict-mode violation, timing shifted by the bump)
    — it now matches the name exactly.
- `frontend/not-found.spec.ts`: 2 passed.
- `screenshots-contrast.spec.ts`: 12 passed / 198 route measurements; the confirm
  round left only the cases the upstream fixes cover (availability day cells,
  pagination labels — both fixed in 0.6.5).
- Preset suite: 374 tests green; quasar-components build + lint clean.
- `pnpm run lint`, `pnpm run format:check`, `pnpm run build`: clean.

## Known limitations

Quasar's own stylesheet is emitted after the preset's utilities, so a preset
utility loses a same-specificity tie against a Quasar rule — `.bg-primary` vs
`.q-btn { background-color: transparent }` — in light mode; only in dark, where
the preset also emits `.body--dark .bg-primary`, does it out-specify. That is
what forced the 404 CTA to be flat, and it is worth its own upstream look.

The app serves the **SSR** bundle (`dist/ssr/client/assets/unocss-*.css`); the
`csr/assets` copy inside the image is stale, so grepping that one suggests a fix
is missing when it is live.

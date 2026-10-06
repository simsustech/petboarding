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
| `packages/app/src/pages/Error404Page.vue` | +16/-8 | Was `bg-primary text-white`: the primary is a light teal in dark mode, so the headline measured **1.71:1**. Now a surface with primary accents; the CTA button carries its own on-primary. |
| `packages/app/src/pages/employee/PetsPage.vue` | +6/-4 | Empty-state hint `text-grey-7` → on-surface-variant (**3.71:1** on the dark surface). Pet grid: `col-12 col-md-4` wrapper so cards fill their column. |
| `packages/app/src/pages/employee/CustomersPage.vue` | +8/-2 | Same token swap for the customer search hint. |
| `packages/app/src/pages/InformationPage.vue` | +9/-3 | Terms link wore the UA default blue (`rgb(0, 0, 238)`); now `text-$light-primary dark:text-$dark-primary`. |
| `packages/app/src/layouts/NavigationTabs.vue` | +26 | Footer bar: content was 378px in a 375px bar (Home tab at x=-3, arrows over the tabs). Flex + ellipsis rules for `.navigation-tabs-footer`. |
| `packages/app/src/layouts/MainLayout.vue` | +11/-2 | Dropped the redundant `q-px-md` (the preset already gives `.q-drawer__content > *` 28px — 44px a side double-padded) and marked the footer instance. |
| `packages/app/src/components/AgendaComponent.vue` | +36 | Swipe hint showed at 768 where the week did not overflow (scrollWidth == clientWidth); it is now gated on a measured overflow via ResizeObserver. |
| `packages/app/src/components/pet/PetForm.vue` | +6/-4 | Textarea rows via `rows="3"` instead of `row` + `q-col-gutter-mds="3"` on a field. |
| `packages/app/src/components/AvailabilityCard.vue` | +8/-4 | Availability link themed; dialog link markup closed. |
| `packages/app/src/components/booking/BookingExpansionItem.vue` | +2/-2 | Booking date/duration label wraps instead of clipping at 375 (anchor measured x=507–568, unreachable). |
| `packages/app/src/components/booking/BookingItemContent.vue` | +2/-2 | Same wrap rules for the duration label. |
| `packages/app/src/pages/account/BookingsPage/BookingsPage.vue` | +8/-4 | Content link theming. |
| `packages/app/src/pages/account/ContactPeoplePage/ContactPeoplePage.vue` | +10/-4 | `row q-col-gutter-md` grid + link theming. |
| `packages/app/src/pages/account/CustomerPage/CustomerPage.vue` | +2/-1 | `row q-col-gutter-md` grid. |
| `packages/app/src/pages/account/DaycarePage/DaycarePage.vue` | +8/-4 | Content link theming. |
| `packages/app/src/pages/admin/OccupancyPage.vue` | +1 | The date field had no label (`label: null`) while every other date field has one. |
| `packages/api/tests/e2e/screenshots-audit.spec.ts` | +53/-26 | Harness: menu capture opened the menu a second time and closed it (every flow-menu shot was of a closed menu); persistent dialogs are closed via ✕ because Escape only shakes them; tablet viewport added; stale dark routes corrected. |
| `packages/api/tests/e2e/screenshots-dark.spec.ts` | +13/-8 | Tablet viewport; three routes pointed at paths that no longer exist. |

## Upstream (separate repos, committed there)

| Repo | Commit | Description |
|------|--------|-------------|
| `unocss-preset-quasar` | `4f65656` | Drop the redundant `.body--dark .q-badge` / `.q-date__event` twins — at (0,2,0) they beat `.bg-green` and collapsed all 13 coloured badges to the dark primary (**5 statuses → 1 colour** in every dark capture). |
| `unocss-preset-quasar` | `d56786e` | The plain gutter class states both axes (`column-gap` **and** `row-gap`), as quasar.css does. |
| `unocss-preset-quasar` | `fc4892b` | Emit the dark date-picker day colour after the rule it must beat: the day numbers rendered in `--q-on-primary` (#003739) with the primary background losing to Quasar's unlayered `.q-btn--flat { background: transparent }` — **1.31:1** on the dark surface, an invisible calendar. |
| `quasar-components` | `e8e8e117` | QStyledCard drops its inline `max-width: 300px`, which capped every card at 300px inside a 445px column. |

## Verification

- `packages/api/tests/e2e/frontend/layout-audit.spec.ts`: 9 passed, 3 skipped.
- `screenshots-contrast.spec.ts`: 12 passed / 198 route measurements.
- Preset suite: 372 tests green; quasar-components build + lint clean.
- `pnpm run lint`, `pnpm run format:check`, `pnpm run build`: clean.

## Known limitation

The `LINKED_*` docker build args do not override the app's pinned
`unocss-preset-quasar@0.6.4` / `@simsustech/quasar-components@0.12.13`: the app
was built from the linked context (the log shows the copy and the in-image build)
yet the emitted CSS is byte-identical to the published packages — even after
rebuilding the local `dist/` first. The three upstream-gated assertions therefore
skip on a normal stack and are verified by the packages' own suites until the
fixed versions are released.

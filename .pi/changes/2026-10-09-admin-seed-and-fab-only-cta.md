# Changes: admin test data by default + FAB-only daycare CTA (2026-10-09)

## What changed
- **Test seed now always creates admin data** (the `SEED_ADMIN_INFORMATION` flag is
  removed): a customer profile (Alex Administrator), one contact person (Sam
  Contact), two pets (Buddy the Labrador, Milo the cat), and a **paid customer
  daycare subscription** linked to the seeded `daycareSubscriptions` id 1 with
  the same year bounds as the existing fixture.
- **The daycare page no longer offers a second "Add daycare" button.** Both
  variants (empty state and the add-more-dates bar) now point people at the
  single FAB instead of duplicating the action:
  - empty state: "Select the plus button to add your first daycare dates."
  - add-more bar: "To add dates, select the plus button."
  Wording is location-neutral because the navigation rail moves on mobile
  ("on the left" would have been wrong there). Both locales updated.

## Verification
- Fresh test stack: admin@petboarding.app has 1 customer, 1 contact, 2 pets and
  1 **paid** subscription, with no environment flag set.
- Desktop (1440x900) and mobile (390x844): `0` inline "Add daycare" buttons.
- FAB opens the dialog; adding a date flips the page to the add-more bar, which
  renders the new copy and still has no inline button.
- `lint`=0 · `format:check`=0 · api build=0 · app image rebuilt with
  `LINKED_UNOCSS_PRESET_QUASAR_PATH=~/Projects/unocss-preset-quasar/packages/preset`.

## Modified files
| File | Description |
|------|-------------|
| `packages/api/src/kysely/seeds/test.ts` | Flag removed; admin customer/contact/pets plus a paid daycare subscription seeded by default. |
| `packages/app/src/pages/account/DaycarePage/DaycarePage.vue` | Both "Add daycare" buttons removed. |
| `packages/app/src/lang/en-US.ts`, `nl.ts` | Copy points at the plus button. |

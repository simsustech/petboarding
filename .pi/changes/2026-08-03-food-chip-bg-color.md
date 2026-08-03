# Changes: Food chip background color on kennel layout (2026-08-03)

## New files

| File | Description |
|------|-------------|
| — | — |

## Modified files (all hunks accepted)

| File | Lines | Description |
|------|-------|-------------|
| packages/app/src/pages/employee/KennelLayout.vue | getPetChipClasses (~362-365) | Chips for pets that need more than two meals a day (`food.timesADay > 2`) now get `bg-${PET_CHIP_BADGE_COLORS.food}-2` (`bg-yellow-2`) instead of the booking/daycare color — placed before the `bookingId`/`daycareDateId` branches, after the drag-feedback branch. Added `PET_CHIP_BADGE_COLORS` import |

## Verification

- `pnpm run build` ok, `pnpm run lint` (warnings only) / `format:check` clean
- e2e default suite 45 passed / 2 skipped, features 4 passed (seed pets have `timesADay: 2`, so no seeded chip triggers the branch)

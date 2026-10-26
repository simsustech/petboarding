# Changes: Fix kennel drag-drop TypeError + alert chip color (2026-08-03)

## New files

| File | Description |
|------|-------------|
| packages/api/tests/e2e/features/kennelLayoutDragDrop.spec.ts | Regression tests (PLAYWRIGHT_TEST_FEATURES): (1) dropping a pet chip onto a chip in a kennel no longer throws the onDrop TypeError; (2) booking chips render `bg-blue-2` even with an active alert (previously recolored, e.g. `needsRest`→yellow, `aggressive`→red); (3) daycare chips render `bg-yellow-2` |

## Modified files (all hunks accepted)

| File | Lines | Description |
|------|-------|-------------|
| packages/app/src/pages/employee/KennelLayout.vue | onDrop (~244-260) | Raised the drop-zone ancestor walk from 4 to 8 hops (`kennel = kennel?.parentNode`) and null-guarded the kennel id parse (`const kennelMatch = kennel.id?.match(/kennel(.*)/); if (kennelMatch) kennelId = Number(kennelMatch.at(1))`) — dropping a chip onto an occupied kennel landed the walk on the `petN` row wrapper, whose id does not match `/kennel(.*)/`, so `.match(...)` returned null and `.at(1)` threw `TypeError: Cannot read properties of null (reading 'at')` |
| packages/app/src/pages/employee/KennelLayout.vue | getPetChipClasses (~361-366) | Removed the alert background branch (`petKennel.alerts?.length → bg-<alertColor>-2`) so alerts (already shown as floating badges on the chip) no longer recolor the chip — a booking with a `needsRest` alert was rendering `bg-yellow-2` (daycare color). Also removed the now-unused `PET_ALERT_COLORS` import |

## Root causes

1. **TypeError on drag**: `onDrop`'s ancestor walk was capped at 4 parentNode hops. The kennel card structure wraps each pet in `<div :id="\`pet${pet.id}\`" class="row justify-center">`(same id as the chip). Dropping onto a chip's text area leaves the walk on that wrapper (`id="petN"`), which is truthy but not`waitlist` and doesn't match `/kennel(.*)/` → `.match()` returns null → `.at(1)` throws. Reproduced via real HTML5 drag (Vue logs it via console.error, not pageerror).
2. **Yellow booking chip**: `getPetChipClasses` checked `alerts?.length` before `bookingId`/`daycareDateId`, so any alert recolor the chip — `needsRest` (yellow) collides with the daycare color, `aggressive` (red), etc. Verified on seed: pet2 with active `aggressive` alert rendered `bg-red-2` on 2024-01-05.

## Verification

- `PLAYWRIGHT_TEST_FEATURES=true pnpm exec playwright test tests/e2e/features/kennelLayoutDragDrop.spec.ts` → 3 passed (pre-fix: crash test red — TypeError reproduced; color test red — bg-red-2 observed)
- `pnpm exec playwright test tests/e2e/kennelLayout.spec.ts` → 4 passed, 2 skipped (pre-existing data-dependent skips)
- `pnpm run lint` → only pre-existing warnings; `pnpm run format:check` → clean
- App image rebuilt (`docker compose -f docker-compose.test.yaml build`) and e2e stack restarted with a fresh `seed:test` database

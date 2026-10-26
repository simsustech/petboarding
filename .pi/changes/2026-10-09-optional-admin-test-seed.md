# Changes: optional admin test information seed (2026-10-09)

## Change
Added opt-in `SEED_ADMIN_INFORMATION=1` support to `packages/api/src/kysely/seeds/test.ts` only. When enabled, the test seed creates a customer profile linked by the returned admin account ID, one contact person, and two deterministic pets. Without the flag, the existing test seed behavior is unchanged.

## Verification
- Fresh test stack with a temporary Compose override passing `SEED_ADMIN_INFORMATION=1`: admin@petboarding.app has 1 linked customer, 1 contact person, and 2 pets.
- Fresh test stack without the flag: admin@petboarding.app has 0 customers, 0 contacts, and 0 pets.
- `pnpm run lint`=0 · `pnpm run format:check`=0 · `packages/api pnpm run build`=0.

## New files
| File | Description |
|------|-------------|
| `.pi/changes/2026-10-09-optional-admin-test-seed.md` | This recap |

## Modified files
| File | Description |
|------|-------------|
| `packages/api/src/kysely/seeds/test.ts` | Flag-guarded admin customer, contact person, and pets. |

Only this test seed was changed; no demo or production seed was touched.

test seed only, code changes confined to it.
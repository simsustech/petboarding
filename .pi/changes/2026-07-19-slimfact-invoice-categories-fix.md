# Changes: Fix slimfact invoice categories and findActualPrice null safety (2026-07-19)

## Modified files

| File | Lines | Description |
|------|-------|-------------|
| `packages/api/src/api.config.ts` | 32-34 | Added `?.` before `.sort()` in `findActualPrice` to prevent TypeError when `prices` is undefined |
| `packages/api/src/trpc/admin/slimfactInvoice.ts` | 8, 93-99, 215-216 | Added `findCategories` import; replaced `pet.category` derivation with DB query via `findCategories({ criteria: { date } })`; added error logging in catch block |

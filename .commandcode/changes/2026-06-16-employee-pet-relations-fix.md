# Changes: Employee pet submit relations validation fix + e2e test (2026-06-16)

## New files
| File | Description |
|------|-------------|
| `packages/api/tests/e2e/employee/pets.spec.ts` | New e2e test exercising the employee pet update flow (open dialog, change name, select category, submit, verify, restore). |

## Modified files (all hunks accepted)
| File | Lines | Description |
|------|-------|-------------|
| `packages/api/src/trpc/employee/pets.ts` | 22-26 | Added `relations: true` to the `employeePetValidation` `pet.omit({...})` call. The `relations` field is read-only (managed via the dedicated `setPetRelation` mutation) and would fail Zod validation when sent back from the form because the DB-loaded structure didn't always roundtrip as a valid record. |

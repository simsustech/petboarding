# Changes: PetFoodInput height inline with sibling PetForm inputs (2026-10-05)

The pet Food field's grey filled control rendered 88px tall against 56px for every
sibling input (a stacked-label band plus a row of nested q-fields: 24 + 56 + 8). The
four inner `q-input`/`q-select` controls are now native `<input>`/`<select>` elements,
so the field sizes to 56px like the rest.

## New files
| File | Description |
|------|-------------|
| `packages/api/tests/e2e/frontend/pet-form-food.spec.ts` | E2E regression: food control height equals a sibling control height |
| `.changeset/tidy-cats-nap.md` | `@petboarding/app`: patch |
| `.pi/changes/2026-10-05-petfoodinput-height.md` | This recap |

## Modified files (all hunks accepted)
| File | Lines | Description |
|------|-------|-------------|
| `packages/app/src/components/pet/PetFoodInput.vue` | template + script + style | Rewrote the four inner controls (timesADay/amount/amountUnit/kind) as native inputs; deleted the `:deep(.q-*)`/`!important` hack block; field is now `padding-top: 22px` + 34px row = 56px |
| `packages/api/tests/e2e/employee/pets.spec.ts` | 41, 61 | Scoped the category option lookup to the open listbox (`getByRole('listbox').getByRole('option')`) — the native unit `<select>` introduced `role=option` elements that the page-wide selector matched (approved scope addition) |
| `docs/adr/002-no-quasar-overrides-in-the-app.md` | Consequences bullet | `PetFoodInput.vue` no longer carries Quasar overrides |
| `CONTEXT.md` | 56-58 | `PetFoodInput.vue` rewritten to native inputs; removed from the ADR 002 enumeration |

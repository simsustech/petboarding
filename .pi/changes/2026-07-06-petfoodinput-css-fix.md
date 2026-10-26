# Changes: PetFoodInput CSS fix — align with user's exact spec (2026-07-06)

## Modified files (all hunks accepted)
| File | Lines | Description |
|------|-------|-------------|
| `packages/app/src/components/pet/PetFoodInput.vue` | 2, 5, 114-121 | Added `class="pet-food-input"` to QField; replaced negative margin `:style` with `style="gap: 4px; background: transparent; border: 0"` + `items-center`; combined `::before, ::after` into single `display: none` rule; kept only the two CSS rules user specified (underline + padding leak) |

# Changes: every pet visible in the kennel picker and the relations dialog (2026-11-10)

Symptom (mobile, 390×844): in `KennelPickerDialog` a kennel holding four pets
showed two occupant chips and `+1 more`, so the pets below the cap could not be
seen in the one dialog whose job is choosing a kennel. In `PetCard`'s
PetRelations dialog a rating group's names were cut to `name4, nam…`.

Root cause, both measured on the built bundle rather than assumed:

- `KennelPickerDialog` capped the occupant list itself
  (`MAX_VISIBLE_OCCUPANTS = 2`) and rendered a remainder; the row was also
  `no-wrap`, so chips could not wrap anyway.
- The relations names label is a `q-item__label`, and the app's unocss preset
  gives that class `white-space: nowrap; overflow: hidden; text-overflow:
  ellipsis` (`.unocss-*.css` in the client bundle — not Quasar's own CSS, which
  only sets line-height/max-width).

Decision (user, this session): drop the cap on every viewport and render all
occupants wrapped; keep the rating-grouped comma list and make the label wrap.

Before/after, same probe at 390×844 against the seeded test stack:
`2 chips + "+1 more"` → `3 chips on 3 lines`; relations label
`white-space: nowrap, overflow: hidden, scrollWidth 704 / clientWidth 334` →
`white-space: normal, overflow: visible, scrollWidth 334 / clientWidth 334`.
Evidence: `.pi/evidence/behaviour-before.json`, `behaviour.json`,
`picker-390{,-before}.png`, `relations-390{,-before}.png` (gitignored).

## New files
| File | Description |
|------|-------------|
| `packages/api/tests/e2e/features/pet-relations-wrap.spec.ts` | Pins the relations label's computed wrapping at 390px and proves a long group grows taller instead of clipping (the seed gives every rating group one name, so the long group is injected in the DOM). Fails on the pre-fix build on `white-space: nowrap`. |

## Modified files (all hunks accepted)
| File | Lines | Description |
|------|-------|-------------|
| `packages/app/src/components/kennelLayout/KennelPickerDialog.vue` | 100-120, 216-240 | Renders every occupant chip; row wraps; cap and `+N more` helpers removed. |
| `packages/app/src/components/pet/PetCard.vue` | 320-333 | Relations names label carries `whitespace-normal overflow-visible` + `data-testid="pet-relations-names"`. |
| `packages/app/src/lang/index.ts`, `en-US.ts`, `nl.ts` | 1 line each | `kennellayout.dialog.moreOccupants` removed — no renderer left. |
| `packages/api/tests/e2e/features/kennelPicker.spec.ts` | 226-292 | `+N more` test replaced: 3 chips, no "more", third chip wraps to a second line, no chip overflows the row, at 390×844. |
| `packages/api/src/kysely/seeds/test.ts` | 345-349 | Comment only — the fixture still holds four pets in kennel 1; it now explains the wrap instead of the cap. |
| `.gitignore` | 20-22 | `.pi/RUN.md` and `.pi/evidence/` are supervisor scratch, not commits. |

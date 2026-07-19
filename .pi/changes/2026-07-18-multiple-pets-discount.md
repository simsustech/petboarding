# Changes: Re-add multiple pets discount (2026-07-18)

## Modified files (all hunks accepted)

| File | Lines | Description |
| ------ | ------- | ------------- |
| `packages/api/src/api.config.ts` | 23, 174–187 | Added `MULTIPLE_PETS_DISCOUNT_FRACTION = 0.15` top-level const. Re-added multiple pets discount logic right after `pets.map(...)` — sorts pet lines by listPrice descending, applies 15% discount to 2nd+ pet. |
| `packages/api/configs/api.config.mjs` | 23, 174–187 | Same changes in runtime mirror. |
| `packages/api/src/api.config.test.ts` | 915–1057 | 5 new tests: single pet no discount, two pets different prices, two pets same price, no discount on canceled, no discount on CANCELED_OUTSIDE_PERIOD. |

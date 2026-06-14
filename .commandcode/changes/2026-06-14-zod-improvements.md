# Changes: Zod schema improvements (2026-06-14)

## Modified files (all hunks accepted)
| File | Lines | Description |
|------|-------|-------------|
| packages/api/src/zod/pet.ts | ~56 | Removed stray `// yo` comment |
| packages/api/src/zod/booking.ts | ~17 | Removed redundant `.omit({})` on bookingService |
| packages/api/src/zod/emailtemplate.ts | ~4 | Added missing `standbyBooking` to name enum |
| packages/api/src/zod/index.ts | ~18 | Added missing `export * from './vacation.js'` |

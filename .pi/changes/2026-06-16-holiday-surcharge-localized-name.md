# Changes: holiday surcharge with localized name (2026-06-16)

## New files
| File | Description |
|------|-------------|

## Modified files
| File | Lines | Description |
|------|-------|-------------|
| `packages/api/src/api.config.ts` | 88-119 | Refactored surchargeHolidays block: single `Holidays(country, { languages: [locale, 'en'] })` instance, `getHolidays(undefined, locale)` for localized list, `isHoliday(date)` to guard the day loop, `localHolidays.find` by date prefix to get rule+name. Removed `setHoliday` workaround, removed matcher/namer double-init, removed per-rule probe loop. |
| `packages/api/configs/api.config.mjs` | 80-112 | Same refactor as `api.config.ts`. |
| `packages/api/src/api.config.test.ts` | new + 410-535 + 845-880 | Added `getHolidayName` helper (mirrors `getHolidays(undefined, language)`). Holiday surcharge tests now assert against the localized name dynamically (e.g. `'Nieuwjaar'`, `'Kerstmis'`, `'Tweede kerstdag'`) instead of a hardcoded locale string. |

## Behavior
- `surchargeHolidays` allowlist of rules (`'01-01'`, `'easter'`, `'12-25'`, `'04-27 if sunday...'`, etc.)
- Handler uses one `Holidays` instance, queries `getHolidays` for the localized holiday list, iterates period days via `eachDayOfInterval`, guards with `isHoliday`, finds the matching holiday by date in the localized list, matches its `rule` against the allowlist, pushes a line with the localized `name` and the rule's `listPrice` (default 500).
- Description is the real localized holiday name (e.g. `'Nieuwjaar'` for `nl`, `'New Year's Day'` for `en`).

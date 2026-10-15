# Changes: fix the daycare submit `done is not a function` crash (2026-10-15)

Reported by a client: submitting daycare dates as a customer failed with "done is not a
function (in 'done')" — Safari's wording for `TypeError: done is not a function`.

Root cause: `DaycareForm.vue` is the only form in the app whose `<q-form>` handles
`@submit` itself (`@submit.prevent="submit"`), added with the in-form submit button. That
one handler serves two contracts — `ResponsiveDialog` calls it as
`functions.submit({ done })`, while the form's own button reaches it through QForm, which
emits the **DOM submit event**. Destructuring `{ done }` from that event yielded
`undefined`, so `DaycarePage.createDaycare`'s `done()` threw after the dates were already
saved: the toast said "done is not a function" and the dialog stayed open. The same
`undefined` made the validation-failure branch (`done(false)`) an unhandled rejection.

## New files

| File | Description |
| --- | --- |
| `packages/api/tests/e2e/daycareSubmit.spec.ts` | Customer path through the form's own submit button: pet → date → terms → Add daycare → success dialog, and no `is not a function` in the console. Red before the fix with the exact reported TypeError. |
| `.changeset/daycare-submit-done.md` | Changeset (`@petboarding/app`: patch). |

## Modified files (all hunks accepted)

| File | Lines | Description |
| --- | --- | --- |
| `packages/app/src/components/daycare/DaycareForm.vue` | +18/−4 | `submit` accepts both call shapes (`{ done }` **or** QForm's DOM event) with `done?` optional, and guards its one call (`if (done) done(false)`); dropped the `ResponsiveDialog` type import it no longer needs. |
| `packages/app/src/pages/account/DaycarePage/DaycarePage.vue` | +3/−1 | `if (done) done()` plus a close of the create dialog after a successful create — the in-form path has no dialog `done` to hide it with, so the customer was left in a stale open dialog. |
| `packages/app/src/pages/employee/CustomersPage.vue` | +3/−1 | Same guard and close for the employee-side daycare create, which shares the form. |

## Verification

- `pnpm run lint` → clean (pre-existing warnings only); `pnpm run format:check` → clean;
  `pnpm run build` → clean.
- `pnpm exec playwright test tests/e2e/daycareSubmit.spec.ts` on a freshly built stack:
  red before the fix (`Console error: "TypeError: done is not a function at createDaycare
  (…/DaycarePage.mjs:294:5)"`, no success dialog), green after.
- Full suite on fresh containers (`docker compose … down --volumes` → `up -d --wait`,
  then `E2E_OWN_STACK=0 pnpm run test:e2e`) → **125 passed, 6 skipped, 0 failed** (131
  tests). An earlier run of the same suite lost 37 tests to the stack being torn down by a
  concurrent session (`ERR_CONNECTION_REFUSED`) plus one `kennelLayout` flake; both are
  environment/order artefacts — `kennelLayout.spec.ts` is green alone (7/7) and in the
  clean full run.

## Recommendation (what would have prevented it)

The form-level submit path was never exercised: `:display="true"` on the account dialog
hides the `ResponsiveDialog` submit that the previous tests used, so the only visible
button was the untested one. Two cheap guards: keep the regression spec (done), and make
`ResponsiveDialog`'s form contract impossible to half-implement — a form that owns its own
submit button should not also be the target of `functions.submit({ done })`.

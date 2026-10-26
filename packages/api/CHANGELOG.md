# @petboarding/api

## 0.8.0

### Minor Changes

- eb1e3ad: feat: charge cancellation costs for shortened approved bookings inside the cancellation period
  
  When an APPROVED (or awaiting-down-payment) booking is shortened — fewer days or
  fewer pets — inside the cancellation period, the invoice now includes a cancellation
  fee for the removed portion.
  
  - The reference is the booking state **in effect when the cancellation window opened**
    (`startDate − 2 months`, `− 4` in the summer vacation), so a change made earlier
    (outside the period) is never charged again — only the portion removed inside the
    period is billed.
  - Applies the cancellation tier percentage (100%/75%/50%) to that removed portion.
  - The invoice is generated from the booking's own costs, and every status change
    (approve, reject, standby, cancel — admin, employee and customer) re-syncs it through
    one helper, so the invoice can no longer drift from the displayed costs.
  - Modifications outside the free-cancel window do not accumulate a fee.
- e68180c: Localize cancellation costs descriptions in booking handler. Thread `lang` parameter through `bookingCancelationHandler` so 'Cancelation costs' and 'Down payment' strings use the locale from `packages/api/src/lang/`. Add missing `downPayment` key to both en-US and nl lang files.
  
  Extract `surchargeHolidays = []` default to a top-level `DEFAULT_SURCHARGE_HOLIDAYS` constant for easier editing in the `.mjs` mirror.

### Patch Changes

- 20a8f3f: feat(app): replace kennel layout drag & drop with a tap-to-assign kennel picker
- 0531e74: fix: record the cancelation period's status when a booking is canceled
  
  A booking canceled inside the cancelation period is stored as `canceledoutsideperiod`
  again instead of `canceled`, so its cancelation fee shows up in
  `admin.getUnpaidBookings` — and therefore in `/admin/financial/overview`.
  
  `cancelBooking` handed the cancelation handler an *unawaited*
  `getLastApprovedForBooking(booking)` call, so the handler read `booking.costs` off a
  promise and threw. The surrounding catch — meant for a deployment that ships no
  `api.config.js` — then decided the status, and its fallback only says
  `canceledoutsideperiod` for a booking that is *currently approved*. Cancelling a
  pending or awaiting-down-payment booking therefore stored `canceled` while the fee was
  billed anyway (the cost lines come from the clock, not from the stored status).
  
  - `await` the cancelation reference, and import `bookingCancelationHandler` statically
    (the mountable `api.config.mjs` template is gone): a handler error surfaces instead of
    being mistaken for a missing config and silently choosing a different status.
  - `cancelBooking`'s third parameter is now `{ allowPastStartDate }` (cancelling a stay
    that already started, e.g. a staff no-show or an expired down payment). It no longer
    also forces `canceled`, which hid the fee of every staff cancellation.
  - A booking whose pets are not all categorised has no `costs` to price a cancelation
    from, so the handler is skipped there instead of throwing.
  - `calculateBookingCosts` uses the same static import: its fallback pricing for a missing
    `api.config.js` is gone with the template, so a handler or vacation-lookup failure now
    surfaces instead of silently pricing the booking a different way.
  - `BookingService['service']` is declared `Service | null` — what the `withServices` join
    actually returns (`jsonObjectFrom`) — which removes the two `TS2322`s that
    `findBooking`/`findBookings` reported.
  
  Also refreshed the stale SlimFact client type it depends on: the admin `getInvoices`
  input in `packages/api/src/slimfact/slimfact.d.ts` still typed `status` as required and
  lacked the optional `statuses`, `startDate` and `endDate` the procedure accepts. So
  `/admin/financial/bookings`, which sends `statuses: [OPEN, PAID, RECEIPT, BILL]`, worked
  at runtime but could not type-check. Patched against SlimFact's
  `packages/api/src/trpc/admin/invoices.ts`.
- 33e86ad: feat: re-add multiple pets discount
  
  Re-added the 15% discount on the 2nd+ pet in a booking. The discount fraction is extracted to a top-level `MULTIPLE_PETS_DISCOUNT_FRACTION` constant. Only applies to `petboarding_booking` line items (not services or surcharges).
- 77d2e82: Pet-card alerts: the window is on screen, and each control acts on its own alert.
  
  - An alert is now a row — status tile, condition, window — instead of a strip of chips. A closed window renders as the locale's own range (`Jan 5 – 12, 2024` / `5–12 jan 2024`), an open end reads `Since`/`Until`, and an alert with no window reads `Ongoing`. The dates were previously readable only inside the delete confirmation, so an expired alert looked live. The window wraps rather than eliding (the app's own wrap rule for a dated label in a dense row).
  - The delete control is no longer a 48×48 button inside a 16px chip. It was taller than the chip it sat in, so consecutive alerts' buttons overlapped and clicking the × painted on "Aggressive" opened **"Diabetic"**'s confirmation. Delete is now a labelled row action, and the condition itself is the edit affordance — a real button with an `aria-label`, which also wires the previously unused `employee.updateAlert` mutation so a window can be corrected instead of deleted and re-created.
  - The status tile is a 40% tonal tint of the condition's hue under an ink glyph, not a solid 400-shade chip under white text. White measured 1.53:1 on yellow and 2.77:1 on red; a *solid* fill under ink measures 6.19:1 in light but **2.14:1 in dark**, because the fill is fixed while the ink token flips with the scheme. The tint lets the scheme's own surface carry it: 10.7:1 light, 6.6:1 dark.
  - Every control in the block gained an accessible name (row edit, delete, add).
  - `PET_ALERT_FILL_CLASSES` keeps the four tile classes as literals so UnoCSS generates them, and `PetAlertRow` types a row from the model. The API's `Pet.alerts` shape now carries `id`, which the delete and update endpoints always required.
  - The alert form resets between opens, refuses a reversed window, and uses the localized required-field message.
  
  Guarded by `packages/api/tests/e2e/frontend/pet-alerts.spec.ts` (windows rendered and not elided, no control inside the status shape, every control named, no overlapping controls, all four contrast pairs ≥4.5:1 in **both** schemes, and each row's × opening its own confirmation).
- 82b4cde: Pin `unocss-preset-quasar` 0.7.4 — an unplaced popup stays hidden, and the individual
  transforms survive minification.
  
  The preset's `0.7.3..0.7.4` source diff is exactly two fixes:
  
  - `q-position-engine` gained `visibility: hidden` — the only guard that keeps a popup off
    screen until Quasar's JS positioning engine writes its placement. That engine is the path
    every browser without CSS anchor positioning takes, and it re-schedules itself on a 10 ms
    timer while the popup still measures 0x0. Inside a dialog the portal node sits in
    `.q-dialog.fixed-full.flex-center`, so a QSelect menu painted in the middle of the screen
    before snapping under the field.
  - `field`, `fab`, `expansion-item` (and the translate utilities) stated `rotate`/`scale`/
    `translate` beside `transform` in one rule. Lightning CSS — Vite 8's production minifier —
    folds the pair in source order and drops the earlier declaration, so a minified build lost
    the checkbox state layer's centring (the hover circle landed 20px down-right of the box),
    the floating field label's 0.75 scale and the indeterminate dash's rotation; an unminified
    build composed the two instead, doubling the fab and expansion-arrow rotations to 360° so
    they never turned. Every site now states one `transform`, as Quasar's own CSS does.
  
  Both only show in a *built* deployment, which is why the app's suite was green on 0.7.3: the
  preset's harness builds with `cssMinify: false`, and an unplaced popup has no geometry to
  assert on.
  
  Verified in this app's built stylesheet (`packages/app/dist/ssr/client/assets/unocss-*.css`,
  and the same asset inside the test image the e2e suite ran against):
  
  | check | result |
  | --- | --- |
  | `.q-position-engine{…}` | carries `visibility:hidden` |
  | rules stating both `transform` and `rotate`/`scale`/`translate` | 0 |
  | `.body--dark .q-badge` twin rules | 0 |
  
  `@petboarding/api` is listed because it consumes the same preset (`src/setup.ts` imports
  `generateTheme`), so its emitted theme CSS changes with the same two rules.
- 800503a: Bump `unocss-preset-quasar` to 0.8.0, which stacks an item row whose trailing
  slot holds a state control on phones.
  
  The preset's item anatomy gives the side section `flex: 0 1 auto` with no shrink
  on its content and the main section a `nowrap`, clipped label, so a wide control
  in that slot took the row's width. Measured on the relation picker
  (`PetCard.vue` → `PetSelect` `#side` with a `size="2em"` q-rating) at a 360px
  viewport: the rating was 218px of a 342px row and the label kept **76px of the
  207px** its text needs — `name1 lastName1 - name1 - Male` rendered as
  `name1 las…`, which read as though the stars had replaced the name.
  
  0.8.0 stacks such a row below 599.98px (label full width, control beneath and
  left-aligned) for `.q-rating`, `.q-toggle`, `.q-checkbox` and `.q-radio` —
  through the preset's media-family preflight, since a UnoCSS rule body cannot
  carry an at-rule. A trailing button is deliberately outside the selector: it is
  one control wide and never squeezed a label, and including it turned this app's
  card header rows from 65px into 145px each.
  
  After the bump, measured on the same route: label 304 of 304px at 360px and 356
  of 356px at 412px, stars below at the label's own left edge, 42×28 per star, and
  the card header rows unchanged at 65/64/65px.
  
  Guarded in `~/Projects/quasar-testing-harness` by
  `tests/q-item-side-control.spec.ts` (fixture `/q-item-side-control`): red against
  the pre-fix preset (label 82 of 277px), green against 0.8.0.
- 047f13b: fix: drag-to-waitlist on the kennel layout (employee + print) now persists across a fresh server read
  
  When a pet was dragged from a kennel back to the waitlist on `/employee/kennellayout/:date`, the optimistic UI hid the pet locally, but a fresh server read — the print route `/print/kennellayout/:date`, an F5, or any later load — put the pet back in its original kennel. Pet-2 used to live in its default kennel until you moved it; after cancelling the move, it reappeared.
  
  Two cooperating bugs in `packages/api/src/repositories/kennel.ts`:
  
  - The CASE resolver picked `WHEN override.kennelId IS NOT NULL THEN ... ELSE booking_pet_kennel.kennel_id`, which cannot distinguish "no override row found" from "override row found with `kennelId = NULL`" — both fell through to the booking's default kennel.
  - `clearForwardBookingPetKennelOverrides` deleted forward override rows only and never wrote a NULL sentinel, so the drag-to-waitlist mutation was a no-op on disk for pets whose kennel came from `bookingPetKennel`.
  
  Fix:
  
  - The lateral `getBookingPetKennels` select now also returns `bpk_o.bookingId as has_override` so the resolver can tell "row found" from "row not found".
  - The CASE rewires to `WHEN override.has_override IS NOT NULL THEN override.kennel_id` (NULL allowed = pet is on the waitlist for that day) `ELSE booking_pet_kennel.kennel_id`.
  - `clearForwardBookingPetKennelOverrides` now writes a NULL sentinel via UPSERT on `(bookingId, petId, fromDate)`, wrapped in a transaction so the DELETE and INSERT stay atomic.
  
  Adds regression coverage in `packages/api/tests/e2e/kennelLayout.spec.ts` ("should keep pet on waitlist across a print-route server read after drag-to-waitlist") and one kennel assignment to booking-2/pet-2 in `packages/api/src/kysely/seeds/test.ts` so the e2e can actually provoke the bug. Daycare pets (`getDaycareDatePetKennels`) are unchanged.
- 481a462: fix: move PetItem rating out of side section to prevent mobile overlap
  
  PetItem's q-rating was in a `<q-item-section side>` that overlapped with the
  main content text on narrow viewports. Moved it into its own `<q-item-label>`
  below the name — natural document flow keeps it below on all screen sizes.
  
  PetCard's q-rating was in a separate `<div class="row justify-center">` that
  overlapped the name on mobile. Merged it into the same flex row as the name,
  where flexbox handles wrapping naturally on narrow screens.
  
  Added a `rating` field to the test seed for pet ID 2 and an e2e test that
  verifies no visual overlap on a 390×844 mobile viewport.
- dd763d1: Search now prefix-matches from two characters
  
  Employee customer and pet search required four characters before a term prefix-matched, so
  `Jan` never found `Jansen` — you had to type the fourth letter. Every surviving term now
  prefix-matches (`:*`), and both tRPC procedures require a two-character minimum so a
  one-character prefix never reaches the database.
  
  The four-character gate came from a 2024 fix for issue #2 ("only find exact matches with
  search terms up to three characters"): back then the query was OR-joined, so a short term
  matched most of the table. The query is now AND-joined and stopword-filtered, so a short
  term can only narrow the result set — the widening the gate guarded against cannot occur
  (see `docs/adr/003-remove-min-4-search-gate.md`).
  
  Results also get a deterministic `ORDER BY` (`last_name, first_name` for customers, `name`
  for pets); the union of the two search CTEs was previously unordered.
- ed3c1f2: fix: fold accents and ignore stopwords in customer/pet full-text search
  
  Two defects in the employee customer/pet search:
  
  - **Accents were not folded** — searching `Madel` never found `Mädel`, and typing the accented form (`Mädel`) was stripped to `Mdel` before it reached the database. Both directions now match via the `unaccent` dictionary.
  - **Articles/particles were match criteria** — `van`, `de`, `het`, `een`, … were indexed as ordinary lexemes and the terms were OR-joined, so `van Huppeldepup` returned everyone whose name contained `van`. Stopwords are now dropped in the query builder and the remaining terms are AND-joined.
  
  The index moves from a stored `english`-stemmed `fulltext` tsvector column to a language-neutral `unaccented` configuration (stock `simple` + `unaccent`) behind functional GIN indexes (`customers_search_idx`, `pets_search_idx`). No stemmer is used — appropriate for proper nouns — and the shared query builder lives in `repositories/search.ts`.
  
  Migrations 07 and 10 are already applied on an existing database, so editing them only reaches a fresh one. An existing deployment needs this, in order:
  
  1. Search configuration — additive, needs a role that may create extensions:
  
     ```sql
     CREATE EXTENSION IF NOT EXISTS unaccent;
  
     CREATE TEXT SEARCH CONFIGURATION unaccented (copy = pg_catalog.simple);
     ALTER TEXT SEARCH CONFIGURATION unaccented
       ALTER MAPPING FOR asciiword, asciihword, hword_asciipart, word, hword, hword_part
       WITH unaccent, simple;
     ```
  
  2. Functional GIN indexes — additive and non-blocking. `CREATE INDEX CONCURRENTLY` cannot run inside a transaction, so run each statement on its own:
  
     ```sql
     CREATE INDEX CONCURRENTLY customers_search_idx ON customers USING GIN (
       to_tsvector('unaccented',
         coalesce(first_name, '') || ' ' || coalesce(last_name, '') || ' ' ||
         coalesce(city, '') || ' ' || coalesce(address, ''))
     );
  
     CREATE INDEX CONCURRENTLY pets_search_idx ON pets USING GIN (
       to_tsvector('unaccented',
         coalesce(name, '') || ' ' || coalesce(breed, '') || ' ' ||
         coalesce(chip_number, '') || ' ' || coalesce(color, ''))
     );
     ```
  
     A cancelled `CREATE INDEX CONCURRENTLY` leaves an **invalid** index; check `pg_index.indisvalid` before continuing, and `DROP INDEX CONCURRENTLY` + re-run if it is false.
  
  3. Deploy this code. The query errors with `text search configuration "unaccented" does not exist` until step 1 is done, so do not deploy before it.
  
  4. Drop the old stored column — metadata-only, instant — which also drops `customers_fulltext_idx` / `pets_fulltext_idx`:
  
     ```sql
     ALTER TABLE customers DROP COLUMN IF EXISTS fulltext;
     ALTER TABLE pets      DROP COLUMN IF EXISTS fulltext;
     ```
  
  Rollback rebuilds the column (a table rewrite) and is therefore the expensive path; the forward change is deliberately not.
- 573859d: Declare `replaceTypedLines` in the SlimFact type mirror.
  
  `packages/api/src/slimfact/slimfact.d.ts` is the hand-maintained mirror of
  SlimFact's router types, and it had drifted: SlimFact's `invoiceValidation`
  declares `replaceTypedLines: string | string[]` (optional, nullable) on both
  `admin.createInvoice` and `admin.updateInvoice`, while the mirror still ended at
  `reminderSentDates`. The call site has been sending the key since "replace the
  billed lines when a booking is canceled" (`slimfactInvoice.ts:152`), so the local
  type described a payload the app does not send — and anything written against
  this mirror could not pass the key without a cast.
  
  Patched field-for-field against SlimFact's `packages/api/src/zod/invoice.ts`
  (`replaceTypedLines` is forwarded to `@modular-api/fastify-checkout`'s
  `updateInvoice`; on `createInvoice` the shared validation accepts it but the
  router does not forward it, which the mirror now says).
  
  No runtime change: `packages/api` never type-checks `src` (`build:api` is
  `vitrify build -m fastify`, `tsc` runs only for migrations), which is why the
  drift was invisible. Verified that the repo's type-error count is unchanged by
  this edit — 82 before and 82 after `tsc -p tsconfig.json --noEmit` — and that the
  mirror now accepts the key the call site passes.
- dc1d565: fix: label cancelation costs in the deployment's language, and keep the invoice in step with a booking's costs
  
  - `getLang()` only listed `nl`/`en`/`en-US`, so a deployment that sets the full locale
    (`VITE_LANG=nl-NL`, as the Dutch clients do) missed the map and fell back to en-US:
    cancelation lines read "Cancelation costs" instead of "Annuleringskosten". It now matches
    the locale case-insensitively, then its base language, then en-US, and both the
    booking-costs context and the full-cancelation branch take their labels from that same
    bundle, so the down-payment fallback is translated too.
  - The invoice update names the line family the app owns
    (`replaceTypedLines: 'petboarding'`): every existing `petboarding_*` line is replaced on
    each sync, so a canceled booking's original lines, a removed service or a surcharge
    window the booking has left can no longer linger on the invoice next to the new lines.
    Manually added (untyped) invoice lines are still preserved.
  - Rejecting a booking that was already approved — and therefore billed — is treated as a
    cancelation: it owes the cancelation tier instead of its original lines. A booking that
    was never approved was never billed and keeps its own costs.
  
  Requires `@modular-api/fastify-checkout` ≥ 0.12, which replaces
  `replaceExistingLinesOfSameType` with `replaceTypedLines`.
- d597ba5: fix: find accounts by the name the list shows, not a column that is usually empty
  
  The admin accounts search could not match on a name, for two separate reasons:
  
  - **The free-text branch compared the wrong variable.** Its second arm used `criteria.name` instead of the search phrase. Its only caller passes an email and a search phrase and has no `name` parameter at all, so the comparison degenerated to `name LIKE '%undefined%'` and matched nothing. It now compares the phrase, case-insensitively.
  - **`whereName` compared a column that is usually empty.** The accounts page does not use the free-text branch: it sends `{ name, email, roles }` criteria, so its name search went through `lower(accounts.name)` — and `accounts` only carries email and roles. The name the list displays is the customer's first and last name, resolved by a correlated subquery. A name search therefore found only accounts that have no customer profile.
  
  Both filter paths and the rendered column now share a single `displayName()` helper, so the filter and the name on screen cannot diverge. `getAccountsCount` uses the same helper, so the total narrows with the list rather than disagreeing with it.
- Updated dependencies [2ff4a0a]
- Updated dependencies [dccd0ed]
- Updated dependencies [24a00aa]
- Updated dependencies [0531e74]
- Updated dependencies [ca62816]
- Updated dependencies [20a8f3f]
- Updated dependencies [5ff9765]
- Updated dependencies [ca8adbc]
- Updated dependencies [77d2e82]
- Updated dependencies [77d2e82]
- Updated dependencies [82b4cde]
- Updated dependencies [77d2e82]
- Updated dependencies [800503a]
- Updated dependencies [481a462]
- Updated dependencies [67dfba9]
- Updated dependencies [1b42ca7]
- Updated dependencies [77d2e82]
- Updated dependencies [e663509]
- Updated dependencies [f087283]
- Updated dependencies [a2e1ef6]
  - @petboarding/app@0.8.0
  - @petboarding/tools@0.8.0

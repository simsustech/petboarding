# Plan: Frontend Improvements — `packages/app`

**Branch:** `cmd`  
**Goal:** Apply small, safe improvements to the Vue 3 frontend in batches, with quality checks between each batch. No large refactors.

---

## Strategy

Each batch targets one class of issue. After each batch: lint → format-check → build → docker test env up → e2e tests → check test results. If tests pass, proceed to next batch.

**6 batches total.** Skipped: large refactors (page splitting, architecture changes).

---

## Batch 1 — Bugs & Dead Code Removal (lowest risk)

### 1a. Fix wrong component name
- **File:** `packages/app/src/components/ApprovedAfterDownPaymentCheckbox.vue`
- **Line 25:** `name: 'TermsAndConditionsCheckbox'` → `name: 'ApprovedAfterDownPaymentCheckbox'`

### 1b. Remove stale .bak files
- `packages/app/src/pages/admin/DaycareSubscriptionsPage.vue.bak`
- `packages/app/src/pages/admin/configuration/BookingEmailRepliesPage.vue.bak`

### 1c. Remove orphaned page
- `packages/app/src/pages/admin/OverviewPage.vue`
- No route in `routes.ts` maps to this. It duplicates the financial overview. Remove it.

### 1d. Remove commented-out code blocks
- **Files:** `AnnouncementsList.vue`, `BuildingsList.vue`, `KennelsList.vue`, `DaycareSubscriptionsList.vue`, `ServicesList.vue`, `OpeningTimesList.vue`, `PeriodsList.vue`, `PetLabel.vue`, `BookingServiceForm.vue`, `BookingItemContent.vue`, `CustomerCard.vue`, `DaycareCalendarMonth.vue`
- Remove large blocks of commented-out HTML/JS from each.

### 1e. Fix pwa.ts debug auto-update fallthrough
- **File:** `packages/app/src/pwa.ts`
- When `__DEBUG__` is true, `updateServiceWorker()` is called but execution falls through to also show notification. Add `return` after `updateServiceWorker()`.

---

## Batch 2 — Type Safety & Small Code Quality

### 2a. Fix `unknown` typed callback props
- `PetChip.vue`, `BookingItem.vue`, `BookingExpansionItem.vue`, `DaycareCalendarMonth.vue`
- Change props like `onOpenPet?: unknown` to `() => void` (or proper typed signatures).

### 2b. Remove unnecessary individual Quasar component imports
- `PetItem.vue` (`import { QItem } from 'quasar'`), `PetSelect.vue`, `AccountSelect.vue`
- Quasar registers all components globally — these imports are dead code.

### 2c. Fix currencySymbols type safety
- `packages/app/src/configuration.ts`
- Change `Record<string, string>` → `Record<PETBOARDING_CLIENT_CONFIGURATION['CURRENCY'], string>`

---

## Batch 3 — Error Handling Small Fixes

### 3a. Fix loadConfiguration catch block (spinner never dismissed)
- `packages/app/src/configuration.ts`, lines ~154-160
- `.catch()` shows error Loading but never calls `Loading.hide()`. Add hide before show.

### 3b. Fix empty catch blocks to at least log
- `AccountsPage.vue`, `DaycarePage.vue`, `VacationsPage.vue`, and others with `catch (e) {}`
- Change to `catch (e) { console.error(e) }` at minimum.

---

## Batch 4 — i18n Locale Watcher Consistency

### 4a. Add missing Quasar locale reactivation pattern
- Components using `useLang()` that display localized text but lack:
  ```ts
  if (lang.value.isoName !== $q.lang.isoName) loadLang($q.lang.isoName)
  watch($q.lang, () => { loadLang($q.lang.isoName) })
  ```
- **Target:** `AgendaChip.vue`, `BookingChip.vue`, and list components that render localized headers.
- Only add to components verified to display localized text in their template.

---

## Batch 5 — Minor Performance Fix

### 5a. Convert inline filter functions to pre-computed maps
- `packages/app/src/components/AgendaComponent.vue`
- Template calls `getBookingDeparturesWithServices(timestamp.date)` etc. per day slot on every re-render.
- Replace with single `computed` that builds `Map<string, Booking[]>` keyed by date for O(1) lookups.

---

## Batch 6 — Accessibility Basics

### 6a. Add aria-label to icon-only buttons
- All list components with edit/delete menus, `ImageAvatar.vue`, `Base64Image.vue`, `InvoiceButton.vue`
- Use i18n strings where available (`lang.value.edit`, `lang.value.delete`).

### 6b. Add aria-hidden to decorative icons
- Scan for `<q-icon>` used purely for decoration and add `aria-hidden="true"`.

---

## Skipped / Deferred

These are real issues but too large for this round:
- Splitting mega-pages (`CustomerPage.vue` 653 lines, `BookingsPage.vue` 618 lines, `DaycarePage.vue` 423 lines)
- Adding query-level error state destructuring
- Adding loading spinners/skeletons to all pages
- Dual-provider OAuth pattern refactor
- `formatDate` SSR safety fix
- `PetKennel` type relocation from `configuration.ts`
- `EventBus` type extraction from `App.vue`
- `Suspense` error boundary
- `apiHost` protocol configurability

---

## Quality Check Sequence (after each batch)

```bash
pnpm run lint
pnpm run format:check || pnpm run format:write
pnpm run build
export SIMSUSTECH_NPM_TOKEN=$(cat ./env/SIMSUSTECH_NPM_TOKEN) && \
  docker compose -f docker-compose.dev.yaml down && \
  docker compose -f docker-compose.test.yaml down --volumes && \
  docker compose -f docker-compose.test.yaml build --no-cache && \
  docker compose -f docker-compose.test.yaml up --force-recreate
cd packages/api && pnpm run test:e2e
```

Check `./packages/api/test-results.json` after e2e tests. Only proceed if all pass.

---

## Verification

- **Batch 1:** No build warnings, component name correct in Vue DevTools, PWA update works in debug.
- **Batch 2:** TypeScript compiles clean, `currencySymbols` key enforcement works.
- **Batch 3:** Loading spinner dismisses on config fetch failure. Errors logged not swallowed.
- **Batch 4:** Language switching works for chip/list components.
- **Batch 5:** AgendaComponent doesn't re-filter arrays on every render tick.
- **Batch 6:** Screen readers identify icon button purposes.

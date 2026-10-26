# Changes: admin accounts search matches the name the list shows (2026-10-18)

## New files
| File | Description |
|------|-------------|
| `.changeset/witty-lions-search.md` | Patch changeset for `@petboarding/api`. |

## Modified files (all hunks accepted)
| File | Lines | Description |
|------|-------|-------------|
| `packages/api/src/repositories/account.ts` | 45 | Extracts `displayName()` (the coalesce over the customer's first/last name with an `accounts.name` fallback); `whereName` and the free-text arm both match it; the rendered column reuses it instead of inlining a second copy. |
| `packages/api/src/repositories/account.test.ts` | 46 | Two failing-first tests: a search phrase and a criteria name each find the account whose name exists only in the customer profile, and `getAccountsCount` equals the list length. |

## Why
An administrator searching the accounts list by name found nothing. Two independent defects:

1. The free-text branch's second arm compared `criteria.name`, which its only caller never
   sets — `admin.findAccounts` takes `{ ids?, email?, searchPhrase? }` — so the comparison
   became `name LIKE '%undefined%'`. It now compares the phrase, lowercased.
2. `whereName` compared `lower(accounts.name)`, and `accounts` only carries email and roles.
   That is the path the accounts page actually uses (`useAdminGetAccountsQuery` sends
   `{ name, email, roles }`), and the name it displays is the customer's, so a name search
   matched only accounts without a profile.

## Verification
- **Failing first**: the fix saved as a patch, `account.ts` reverted, suite run →
  `Tests 1 failed | 117 passed (118)`, `AssertionError: expected [] to deeply equal [ 'test3@petboarding.app' ]`.
  Fix re-applied → `Test Files 12 passed (12)`, `Tests 118 passed (118)`.
- `pnpm run lint` exit 0 (pre-existing warnings only) · `pnpm run format:check` exit 0 ·
  `pnpm run build` exit 0.
- **Owed**: the full `pnpm run test:e2e` suite. This is the first change to product code in
  this batch, and `AGENTS.md` makes that suite mandatory after a change batch.
- **Not included**: unrelated pre-existing working-tree edits to
  `packages/api/tests/e2e/auth-state.ts`, `setup.ts` and `slimfact.spec.ts`, plus the other
  untracked files in `.pi/changes/` and `.impeccable/`. They are not part of this commit.

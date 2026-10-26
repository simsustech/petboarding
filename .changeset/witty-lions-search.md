---
'@petboarding/api': patch
---

fix: find accounts by the name the list shows, not a column that is usually empty

The admin accounts search could not match on a name, for two separate reasons:

- **The free-text branch compared the wrong variable.** Its second arm used `criteria.name` instead of the search phrase. Its only caller passes an email and a search phrase and has no `name` parameter at all, so the comparison degenerated to `name LIKE '%undefined%'` and matched nothing. It now compares the phrase, case-insensitively.
- **`whereName` compared a column that is usually empty.** The accounts page does not use the free-text branch: it sends `{ name, email, roles }` criteria, so its name search went through `lower(accounts.name)` — and `accounts` only carries email and roles. The name the list displays is the customer's first and last name, resolved by a correlated subquery. A name search therefore found only accounts that have no customer profile.

Both filter paths and the rendered column now share a single `displayName()` helper, so the filter and the name on screen cannot diverge. `getAccountsCount` uses the same helper, so the total narrows with the list rather than disagreeing with it.

---
'@petboarding/api': patch
---

fix: match a search phrase that spans a pet and its owner

`searchPets()` AND-joins the typed terms into one `tsquery` but compared it with two
separate `tsvector`s: the `main` branch against the pet's text, the `relation` branch
against the owner's. `@@` never crosses two vectors, so a phrase whose terms are split
between them — `Moos Kratom`, which is exactly the option label the pet select shows
(`${pet.name} ${pet.lastName}`) — matched neither branch and returned nothing, while
each word on its own found the pet. The same gap existed in `searchCustomers()`.

- Add `petAndCustomerSearchVector()` and match it in the `relation` branch for phrases
  with more than one term. Single-term phrases keep the indexed per-table expression,
  and the emitted strings for both indexes are unchanged (asserted against migrations
  07/10), so `customers_search_idx` and `pets_search_idx` still apply.
- Split the phrase on every non-alphanumeric instead of gluing it: the vector tokenises
  `O'Brien` as `o` + `brien` and `Peters-de Wit` as `peters`/`de`/`wit`, so the old
  `obrien:*` and `petersde:*` terms matched nothing.
- Cover all of it in `packages/api/src/repositories/search.test.ts`, including
  `searchPets`, which had no test that searched by customer name at all.

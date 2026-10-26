---
'@petboarding/api': patch
---

Search now prefix-matches from two characters

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

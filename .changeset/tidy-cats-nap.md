---
"@petboarding/app": patch
---

fix(app): render the pet Food field at the standard input height

The PetFoodInput's grey control was 88px tall (a stacked-label band plus a row of
nested q-fields) against 56px for every sibling input, so it overran its grid row.
The inner controls are now native inputs, and the field is 56px like the rest.

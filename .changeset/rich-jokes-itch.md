---
'@petboarding/app': patch
'@petboarding/api': patch
---

fix: move PetItem rating out of side section to prevent mobile overlap

PetItem's q-rating was in a `<q-item-section side>` that overlapped with the
main content text on narrow viewports. Moved it into its own `<q-item-label>`
below the name — natural document flow keeps it below on all screen sizes.

PetCard's q-rating was in a separate `<div class="row justify-center">` that
overlapped the name on mobile. Merged it into the same flex row as the name,
where flexbox handles wrapping naturally on narrow screens.

Added a `rating` field to the test seed for pet ID 2 and an e2e test that
verifies no visual overlap on a 390×844 mobile viewport.

---
'@petboarding/app': patch
'@petboarding/api': patch
---

Bump `unocss-preset-quasar` to 0.8.0, which stacks an item row whose trailing
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

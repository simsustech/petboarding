---
'@petboarding/app': patch
---

fix(app): let the daycare form's own submit button finish the submit

A customer submitting daycare dates got `TypeError: done is not a function` — the
reported "done is not a function (in 'done')" is that message in Safari's wording —
*after* the dates had already been saved, leaving the create dialog open on an
error toast.

`DaycareForm`'s single `@submit` handler serves two contracts: `ResponsiveDialog`
reaches it through `functions.submit({ done })`, while the form's own
`type="submit"` button reaches it through QForm, which emits the DOM submit event.
Destructuring `{ done }` from that event gave `undefined`, so the page's `done()`
threw. `done` is optional now and each call site guards it, and the page closes the
dialog itself, so both affordances behave the same.

`tests/e2e/daycareSubmit.spec.ts` drives the customer path through the form's own
button and reported the exact TypeError before this change.

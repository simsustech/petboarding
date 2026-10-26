# FilteredModelSelect mobile Chrome fix — handoff for quasar-components

## Problem

Same bug as the PetSelect/AccountSelect fix in petboarding: `update()` is called
asynchronously inside the `done` callback, so the QSelect popup never opens on
mobile Chrome / PWA.

## Affected file

`packages/components/src/ui/form/FilteredModelSelect.vue` — line 128:

```js
// BEFORE (broken)
const filterFn: QSelect['$props']['onFilter'] = (val, update) => {
  if (!onFilter.value) update(() => {})
  emit('filter', {
    ids: selectedIds.value,
    searchPhrase: (val || '').toLowerCase(),
    done: () => update(() => {})   // ← async, popup won't open on mobile Chrome
  })
}
```

## Fix

Call `update()` synchronously to open the popup. The parent updates
`filteredOptions` reactively, and QSelect re-renders the list via reactivity:

```js
// AFTER (fixed)
const filterFn: QSelect['$props']['onFilter'] = (val, update) => {
  update(() => {})
  emit('filter', {
    ids: selectedIds.value,
    searchPhrase: (val || '').toLowerCase(),
    done: () => {}
  })
}
```

## Downstream note

The admin BookingsPage's `onFilterCustomers` handler doesn't call `done()` at
all — it relies entirely on reactive prop updates. After this fix, `done()` is
a no-op so that's fine. But it means the popup opens immediately with whatever
options are currently set, then re-renders when the parent's `filteredOptions`
prop updates. This is the correct Quasar pattern for server-side filtering.

## Reference

Petboarding fix (same pattern): `PetSelect.vue` and `AccountSelect.vue` —
search for `filterFn` to see the corrected version.

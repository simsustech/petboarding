# QSelect mobile Chrome fix — handoff for slimfact

## Problem

QSelect with `use-input` + remote search (tRPC/query) never opens the dropdown
on mobile Chrome / PWA. Works on desktop and Firefox Mobile.

Root cause: Quasar's `@filter` callback `update()` is called **asynchronously**
(inside `.then()` of the query). `update()` must be called **synchronously** —
it tells QSelect to open the popup and re-render options. On mobile Chrome the
focus/keyboard lifecycle tears down the popup before the deferred `update()`
fires, so the dropdown never opens.

## Affected pattern (BEFORE)

```js
const filterFn = (val, update) => {
  if (val === '') {
    options.value = []
  } else {
    searchPhrase.value = val.toLowerCase()
    execute().then(() => {        // ← async
      update(() => {               // ← update called too late
        options.value = data.value.map(...)
      })
    })
  }
}
```

## Fix (AFTER)

Call `update()` synchronously to open the popup, then mutate `options` directly
after the fetch resolves — Vue reactivity re-renders the list:

```js
const filterFn = (val, update) => {
  update(() => {                   // ← synchronous, opens popup
    if (val === '') {
      options.value = []
    } else {
      searchPhrase.value = val.toLowerCase()
      execute().then(() => {
        options.value = data.value.map(...)   // ← direct mutation
      })
    }
  })
}
```

## Files fixed in petboarding

- `packages/app/src/components/employee/PetSelect.vue`
- `packages/app/src/components/admin/AccountSelect.vue`

## How to find affected files in slimfact

Search for the same anti-pattern — `update()` called inside `.then()`:

```bash
grep -rn "execute().then" --include="*.vue" --include="*.ts" src/
grep -rn "\.then(() => {" --include="*.vue" src/   # then look for update() inside
```

Any QSelect with `use-input` + `@filter` + remote data fetch is a candidate.
Apply the same restructure: move `update()` to the top level (synchronous),
keep the async fetch inside, mutate `options` directly in the `.then()`.

---
'@petboarding/app': patch
---

fix(app): one stable add-dates instruction row on the account daycare page

`/account/daycare` rendered two mutually exclusive card sections driven by the
fetched `data`: an empty state when `!data?.length` and an "Add more daycare
dates" bar when `data?.length`. That fetch is windowed — after any interaction the
page's `onChangeDate` writes the calendar's visible month into the query's
`from`/`until`, and `defineQuery` shares those refs with the FAB — so a customer
whose dates sat outside the visible month watched the bar disappear and the page
claim "No daycare dates yet" while their dates were still there.

The two branches are replaced by a single instruction row that is always
rendered and reads no data, so it can no longer flip. Its copy states the real
order of the flow — press the plus first, then pick dates in the dialog:

- en: `Select the plus button to add dates.`
- nl: `Kies het plusje om datums toe te voegen.`

The four keys the old branches used (`noDaycareDates`, `addFirstDaycareDates`,
`addMoreDaycareDates`, `selectDatesThenSave`, whose Dutch value narrated the
steps backwards) are gone, replaced by `selectPlusToAdd` in `en-US.ts`, `nl.ts`
and the `Language` interface. The row also carries the scheme's ink instead of a
`text-grey-7` caption, which measured under 4.5:1 on the tinted container.

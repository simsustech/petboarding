# Changes: declare replaceTypedLines in the SlimFact type mirror (2026-10-26)

`packages/api/src/slimfact/slimfact.d.ts` is the hand-maintained mirror of
SlimFact's router types. It had drifted one release behind: SlimFact declares
`replaceTypedLines` on its shared `invoiceValidation`
(`packages/api/src/zod/invoice.ts`), and petboarding sends the key on the
cancelation sync (`slimfactInvoice.ts:152`) without the local type knowing it.

## Modified files (all hunks accepted)

| File | Lines | Description |
|------|-------|-------------|
| `packages/api/src/slimfact/slimfact.d.ts` | +13 | `replaceTypedLines?: string \| string[] \| null \| undefined` on `admin.createInvoice.input` and `admin.updateInvoice.input`, with the forwarding rule stated on each. |
| `.changeset/slimfact-typemirror-replace-typed-lines.md` | new | Patch changeset for `@petboarding/api`. |

## Why the mirror and not the API

The server side lives in the SlimFact repo (`@slimfact/api`, its own
`.changeset/invoice-line-family-replacement.md`), which is deployed as the
`slimfact-api:latest` image — nothing here changes it. This edit makes the local
mirror describe the payload the app actually sends, so a future call site can
pass the key without a cast and the next reader sees what the parameter does.

## Verification

- `tsc -p packages/api/tsconfig.json --noEmit --ignoreDeprecations 6.0` — 82 errors before the edit and 82 after, with the same 5 in
  `src/trpc/user/customerDaycareSubscriptions.ts` (verified by stashing the edit
  and re-running); this change adds none.
- The mirror now carries the key at `slimfact.d.ts:901` (create) and `:999`
  (update), field-for-field against SlimFact's `zod/invoice.ts:64`.
- Exception-property checks are not enforced on that call today: a probe key
  (`zzzProbe: 1`) added beside `replaceTypedLines` produced no TS error, and
  `packages/api` has no `tsc` step over `src` (`build:api` is
  `vitrify build -m fastify`; `tsc` runs only for migrations). So this edit is
  type documentation, not enforcement — the runtime proof is the SlimFact e2e,
  which stays opt-in behind `PLAYWRIGHT_SLIMFACT=1`.
- `pnpm run lint` and `pnpm run format:check` clean.

## Not in this commit

- `packages/api/tests/e2e/{auth-state,setup,slimfact}.spec.ts` — pre-existing
  local modifications, unrelated.
- The 5 `customerDaycareSubscriptions.ts` type errors — pre-existing on `dev`
  HEAD, untouched.

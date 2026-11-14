# Changes: search matches a phrase split across pet and owner (2026-11-14)

Supervisor-verified. The delegate (`run.WJO8du`) found the cause and wrote the pet-side fix; the
siblings it flagged were fixed and gated here, together with the sandbox database access.

## New files
| File | Description |
|------|-------------|
| `.changeset/pet-owner-phrase-search.md` | release note (`@petboarding/api`, patch) |
| `.pi/changes/2026-11-14-pet-search-cross-vector-phrase.md` | this recap |
| `.pi/notes/sandbox-postgres.md` | how a sandbox reaches the compose database |
| `.pi/evidence/pet-surname-search/*.log` | red/green runs, suite, lint, format, sandbox reachability |

## Modified files
| File | Lines | Description |
|------|-------|-------------|
| `packages/api/src/repositories/search.ts` | +39/−14 | pet/customer text expressions split out of the vector builders; new `petAndCustomerSearchVector()` and `isMultiTermQuery()`; index expressions unchanged; phrase now split on every non-alphanumeric instead of glued |
| `packages/api/src/repositories/pet.ts` | +10/−2 | `relation` branch matches the combined pet+customer vector for multi-term phrases |
| `packages/api/src/repositories/customer.ts` | +8/−2 | the same gap in `searchCustomers()`: `relation` branch matches the combined vector for multi-term phrases |
| `packages/api/src/repositories/search.test.ts` | +93/−1 | `describe('searchPets')` (surname alone, label phrase, reversed phrase), customer phrase spanning both vectors, apostrophe/hyphen surnames, punctuation splitting, and a vector/migration sync assertion |
| `packages/api/vitest.config.ts` | +19 | default `POSTGRES_HOST` to the sandbox gateway name when `/etc/hosts` carries it and the value is unset or `localhost` |
| `docker-compose.test.yaml` | +3/−1 | publish `database` on `${E2E_BIND_ADDR:-127.0.0.1}`, like caddy; it was open on 0.0.0.0 |
| `AGENTS.md` | +5 | how to run the database tests inside a pi-safe sandbox |

## Gates (run on `staging`, uncommitted tree)
- failing-first: `2 failed | 12 passed` on pre-fix source, `17 passed` after — `gate1-*`
- `vitest run src` → 15 files / 135 tests — `gate2-src-suite-supervisor.log`
- `pnpm run lint` (root) → exit 0, warnings pre-existing — `gate3-lint-supervisor.log`
- `pnpm run format:check` (root) → clean — `gate4-format-check-supervisor.log`
- sandbox: `vitest run src/repositories/search.test.ts` with no `POSTGRES_HOST` → 17/17; forced
  `POSTGRES_HOST=192.0.2.1` → 9 failed — `gate5-vitest-sandbox-default.log`

## Not fixed (recorded)
`pnpm run test` (`vitrify test`) cannot start in this worktree: `@unocss/autocomplete` cannot resolve
`@unocss/core`, because the uncommitted `packages/app/package.json` `link:` overrides changed the
lockfile without a re-install. The API suite was therefore run with the `vitest` binary from
`packages/app` and the same `vitest.config.ts`.

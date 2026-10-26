# Changes: Remove prettier, make oxfmt ignore markdown (2026-08-03)

## New files

| File | Description |
|------|-------------|
| — | — |

## Modified files (all hunks accepted)

| File | Lines | Description |
| ------ | ------- | ------------- |
| .oxfmtrc.json | 3 | `ignorePatterns`: `"AGENTS.md"` → `"**/*.md"` — oxfmt now ignores all markdown files (it formats them by default, mangling inline-code spacing and re-padding tables in `.md` files) |
| packages/api/package.json | devDeps | Remove direct `prettier@^3.9.4` devDependency |
| packages/app/package.json | devDeps | Remove direct `prettier@3.9.4` devDependency |
| pnpm-workspace.yaml | catalog | Remove `prettier@3.9.4` catalog entry |
| packages/app/.github/copilot-instructions.md | dep list | Remove `prettier@3.9.4` from the dependency listing |
| pnpm-lock.yaml | — | Regenerated — no more `prettier@3.9.4`; only transitive `prettier@2.8.8` remains (required by `@changesets/*` tooling) |

Also cleaned the `/* prettier-ignore */` comments out of the generated `components.d.ts`
files (untracked/gitignored, so no git impact; `**/components.d.ts` is already in `.gitignore`).

## Root cause

oxfmt 0.56+ formats markdown files too (table padding + code-span spacing). The recap
files under `.pi/changes/*.md` kept getting reformatted/mangled by oxfmt runs, and the
repo still carried prettier devDeps/catalog entries as leftovers from the prettier→oxfmt
migration.

## Verification

- `pnpm clean && pnpm install` → prettier 3.9.4 gone from lockfile and node_modules
- `pnpm run build` → success
- `pnpm run lint` → pre-existing warnings only; `pnpm run format:check` → clean
- `pnpm exec oxfmt --check <file>.md` → "All matched files may have been excluded by ignore rules" (md files skipped)
- Unit tests `pnpm test` → 66 passed; e2e `pnpm run test:e2e` → 45 passed, 2 skipped (fresh DB)

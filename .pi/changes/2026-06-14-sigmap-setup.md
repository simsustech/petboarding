# Changes: Set up SigMap with monorepo per-module strategy (2026-06-14)

## New files
| File | Description |
|------|-------------|
| gen-context.config.json | SigMap config (strategy: per-module, monorepo: true, codex adapter) |
| .contextignore | SigMap exclusion rules |
| packages/api/.github/context-*.md | API package context (src, tests, playwright-report) |
| packages/app/.github/context-*.md | App package context (src, index.html, stats.html) |
| packages/docs/.github/context-*.md | Docs package context (nl, documentation, etc.) |
| packages/tools/.github/context-*.md | Tools package context (src) |

## Modified files
| File | Lines | Description |
|------|-------|-------------|
| AGENTS.md | ~78-107 | Updated SigMap Context Strategy section with monorepo usage and commands |

## Test verification
- `npx sigmap --query "booking cancellation"` correctly ranked `packages/api/src/repositories/booking.ts` #1
- Token reduction: 87-100% across 4 packages
- Monorepo generates per-package context files for api, app, docs, tools

# Changes: SigMap strategy finalized with monorepo + validate/judge (2026-06-14)

## New files
| File | Description |
|------|-------------|
| gen-context.config.json | SigMap config (strategy: per-module, monorepo: true, codex adapter) |
| .contextignore | SigMap exclusion rules |
| packages/*/.github/context-*.md | Per-package context files for api, app, docs, tools |

## Modified files
| File | Lines | Description |
|------|-------|-------------|
| AGENTS.md | SigMap section | Updated strategy docs: per-module+monorepo, --query instead of ask, added judge command |

## Verification results
- `npx sigmap --query "booking cancellation"` → correct ranking (booking.ts #1)
- `npx sigmap validate` → config valid, 16% coverage warning
- `npx sigmap judge --response test.txt --context packages/api/.github/context-src.md` → score 0.6, pass
- Token reduction: 87-100% across 4 packages

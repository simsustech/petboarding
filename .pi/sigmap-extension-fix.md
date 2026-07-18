# SigMap Extension Fix — Final State (2026-07-18)

## Problem Solved

`sigmap ask`/`query` failed with "no context file found" when using `strategy: "per-module"` + `monorepo: true`.

## Root Cause

The sigmap CLI's `_enrichSigIndexFromStrategy()` only merges:

- `.github/context-cold.md` (hot-cold strategy)
- Sig-cache data

It does NOT merge per-module context files (`.github/context-*.md`) which contain the actual signatures for per-module strategy.

## Working Solution

Use `strategy: "full"` + `monorepo: true` with explicit package srcDirs:

```json
{
  "srcDirs": ["packages/api/src", "packages/app/src", "packages/tools/src"],
  "strategy": "full",
  "monorepo": true,
  "maxTokens": 60000,
  "autoMaxTokens": false,
  "outputs": ["codex", "copilot"]
}
```

This configuration:

- Gives per-package token budgets (monorepo mode)
- Builds a complete signature index in both AGENTS.md and .github/copilot-instructions.md
- Allows all sigmap CLI commands (ask, query, file, impact, validate, health, note, squeeze) to work

## Results After Fix

- **Coverage**: 70-75% per package (B/C grade)
- **Token reduction**: 98% (541K → 9K tokens)
- **All sigmap actions work**:
  - `ask` - ranked signature search
  - `query` - BM25 file ranking with scores
  - `file` - explain a specific file
  - `impact` - blast radius analysis
  - `validate` - config validation
  - `health` - composite health score (100/100 A)
  - `note` - cross-session notes
  - `squeeze` - log minimization

## Key Files

- Config: `/home/stefan/Projects/petboarding/gen-context.config.json`
- Extension: `/home/stefan/.pi/agent/extensions/sigmap.ts` (has per-module fallback logic, but not needed with full strategy)
- Context outputs: `AGENTS.md` (codex), `.github/copilot-instructions.md` (copilot), `.github/context-*.md` (per-package)

## Test Commands

```bash
sigmap ask "booking validation"
sigmap query "daycare subscription"
sigmap file packages/api/src/trpc/employee/bookings.ts
sigmap impact packages/api/src/repositories/booking.ts
sigmap validate
sigmap health
sigmap note "test note"
```

## Notes

- The extension at `~/.pi/agent/extensions/sigmap.ts` includes a per-module fallback (`perModuleSearch`) that reads `.github/context-*.md` directly if the CLI fails. This is a safety net for per-module strategy.
- With the working `full` + `monorepo` config, the CLI's built-in index works perfectly, so the fallback isn't triggered.
- The "package not found" warning in ask/query is expected when query doesn't match a package name - it searches the entire repo instead.

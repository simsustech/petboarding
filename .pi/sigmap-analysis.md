# SigMap Configuration Analysis (2026-07-18)

## Core Finding

`sigmap ask`/`query` require a **signature index** to be built. `strategy: "per-module"` generates context files but does NOT build an index. Only `strategy: "full"` builds the index.

## Tested Configurations

| # | strategy | monorepo | srcDirs | ask/query | index | coverage | notes |
| --- | ---------- | ---------- | --------- | ----------- | ------- | ---------- | ------- |
| 1 | per-module | true | ["src", "lib"] | ❌ | none | 0% | srcDirs don't exist |
| 2 | per-module | false | ["packages/api/src", ...] | ❌ | none | N/A | context generated but no index |
| 3 | full | false | ["packages/api/src", ...] | ✅ | 299 files | 76% B | works, 14K tokens |
| 4 | full | true | ["packages/api/src", ...] | ✅ | 299 files | 76% B | works, per-pkg budget |
| 5 | per-module | false | ["packages"] | ❌ | none | 76% B | context-packages.md exists but no index |
| 6 | per-module | true | ["packages"] | ❌ | none | 70-75% per pkg | per-pkg context, root overview, no index |

## Root Cause

The `ask`/`query` CLI commands (and MCP tools) need a **signature index** file.

- `strategy: "full"` → builds index + context files
- `strategy: "per-module"` → builds context files only, NO index

Doctor output with per-module: "⚠ Signature index — no signatures indexed"
Doctor output with full: "✓ Signature index — 299 file(s) indexed"

## Working Configuration (current)

```json
{
  "srcDirs": ["packages"],
  "strategy": "full",
  "monorepo": true,
  "maxTokens": 60000,
  "autoMaxTokens": false,
  "outputs": ["codex", "copilot"]
}
```

Coverage: 76% (B), 299 files, ~14K tokens. All MCP tools work.

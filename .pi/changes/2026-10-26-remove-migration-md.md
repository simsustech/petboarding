# Changes: drop MIGRATION.md, fold its SQL into the changeset (2026-10-26)

`MIGRATION.md` (added in `aabfbb70f`) was a standalone production-migration note whose only
inbound reference was `.changeset/search-unaccented-fix.md`. Both are removed / rewritten so
the instruction lives with the changeset that ships it, instead of a root file that nothing
loads and that a reader has to be told about.

## Deleted files

| File | Description |
|------|-------------|
| `MIGRATION.md` | 134-line one-off production SQL note for the language-neutral search index (uneven columns, four ordered steps, verification queries, rollback). Its content now lives in the changeset, condensed. |

## Modified files (all hunks accepted)

| File | Lines | Description |
|------|-------|-------------|
| `.changeset/search-unaccented-fix.md` | +43 −1 | Last paragraph replaced: the dangling "Existing databases need the one-off SQL in `MIGRATION.md`" became an ordered four-step block — (1) `CREATE EXTENSION unaccent` + the `unaccented` text search configuration, (2) the two `CREATE INDEX CONCURRENTLY` statements with the invalid-index caveat, (3) deploy only after step 1, (4) `DROP COLUMN IF EXISTS fulltext` — plus the rollback note (a table rewrite, i.e. the expensive path). |

## Verification

- `grep -rn "MIGRATION.md"` over the repo (excluding `.worktrees/` and `.pi/`): no remaining
  reference in tracked files.
- `git log --oneline -1 -- MIGRATION.md` — the file is gone from the working tree and staged
  as a deletion.
- `pnpm run format:check` — clean (oxfmt does not reformat the fenced SQL).
- The commit ran the repo's pre-commit hooks (format:check across api/app/tools); nothing was
  bypassed.

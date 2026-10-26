# Changes: changesets/action v2 contract in the release workflow (2026-10-26)

The version-and-release run on `main` failed at the release step:

```text
Error: The GITHUB_TOKEN environment variable is set and does not match the
"github-token" input. Please pass the custom GitHub token to the "github-token"
input and remove the GITHUB_TOKEN environment variable to avoid conflicts.
```

Two v2 changes were missing, and the second one would have failed silently.

## Modified files (all hunks accepted)

| File | Lines | Description |
|------|-------|-------------|
| `.github/workflows/version-and-release.yaml` | +17/−7 | Token moved from `env: GITHUB_TOKEN` to the `github-token` input; `create-github-releases: false` and `push-git-tags: false` so the hand-written tag/release steps below stay the only publisher; the four step conditions read `has-changesets` instead of the v1 `hasChangesets`; the block comment states the contract. |

## Why each line

- **Token as input.** v2 reads `github-token`, not the environment; with both set
  and unequal the step aborts before doing anything (the reported failure).
- **`has-changesets`, not `hasChangesets`.** v2 renamed the output to kebab-case.
  A wrong output name does not error — it reads as empty — so
  `if: steps.changesets.outputs.hasChangesets == 'false'` was never true, and the
  tag + GitHub Release steps would never have run: a green job that ships nothing.
- **`create-github-releases: false` / `push-git-tags: false`.** v2 can tag and
  release on its own. This workflow already does both from
  `packages/api/CHANGELOG.md`, so leaving them on would race the two.

Cross-checked against the same workflow in `~/Projects/slimfact`, which runs the
same `changesets/action@v2` contract successfully (identical inputs, identical
kebab-case outputs, both publish switches off).

## Verification

- All six workflows parse: `python3 -c "yaml.safe_load(...)"` over `.github/workflows/*.yaml` — 6/6 OK.
- The release step now declares `['github-token', 'pr-title', 'commit-message', 'version-script', 'create-github-releases', 'push-git-tags']` with **no** `env:` block, read back from the parsed YAML.
- The four conditions read `steps.changesets.outputs.has-changesets == 'false'`.
- The other five workflows were diffed against the slimfact copies: only repo-specific differences (docs hostname, image targets, extra `modular-api` link contexts, the guards Playwright config), no stale action inputs or v1 contract.
- Not verified: an actual `main` push — the fix only takes effect on the next merge to `main`, and the run itself is GitHub-side.

## Not in this commit

- No changeset: CI-only change, matching the five previous workflow commits in this repo, none of which added one.
- `changesets/action@v2` stays a major-tag ref, like every other action in these workflows (`checkout@v7`, `setup-node@v7`, …).

# Changes: changesets + GitHub Release automation (2026-07-06)

## New files
| File | Description |
|------|-------------|
| `.changeset/config.json` | Changesets config — lockstep versioning for @petboarding/api, @petboarding/app, @petboarding/tools, baseBranch: main |
| `.github/workflows/version-and-release.yaml` | Triggers on push to main: checks for pending changesets, runs `changeset version`, commits version bump with `[skip ci]` (uses GH_RELEASE_TOKEN to bypass branch protection), pushes version tag, creates GitHub Release with extracted changelog section |
| `.github/workflows/docker-publish.yaml` | Renamed from release.yaml — built Docker image on tag push, cleaned up build-contexts (unused linked packages), checkout ref uses `${{ github.ref }}` for precision |

## Modified files (all hunks accepted)
| File | Lines | Description |
|------|-------|-------------|
| `.github/workflows/release.yaml` → `docker-publish.yaml` | Renamed | Removed build-contexts for linked local pkgs; changed checkout ref from `main` to `${{ github.ref }}`; renamed workflow title |

## Not yet done
- `GH_RELEASE_TOKEN` secret needs to be created in GitHub repo settings (PAT with `contents: write` to bypass branch protection)
- Branch needs to be pushed (no remote access from this environment) and PR created against dev/staging/main

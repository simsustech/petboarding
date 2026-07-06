# Changes: Fix build contexts in CI/CD release workflows (2025-06-16)

## Modified files (all hunks accepted)
| File | Lines | Description |
|------|-------|-------------|
| `.github/workflows/release staging.yaml` | 43-53 | Added `build-contexts:` mapping all linked-* contexts to `.docker/empty` |
| `.github/workflows/release.yaml` | 33-43 | Added `build-contexts:` mapping all linked-* contexts to `.docker/empty` |

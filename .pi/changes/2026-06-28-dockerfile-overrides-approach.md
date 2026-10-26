# Changes: Dockerfile pnpm-workspace overrides approach (2026-06-28)

## Modified files (all hunks accepted)
| File | Lines | Description |
|------|-------|-------------|
| Dockerfile | 1-31 (install-stage) | Moved linked-package COPY to install-stage; added node script to inject overrides into pnpm-workspace.yaml; switched to --no-frozen-lockfile; build linked packages via pnpm --filter |
| Dockerfile | 33-48 (build-stage) | Removed all old COPY/link logic (23 lines); now only ARGs + main build |
| docker-compose.test.yaml | 63 | Removed linked-modular-api: .docker/empty (monorepo root) |
| docker-compose.test.config.yaml | 63 | Same |
| .github/workflows/release.yaml | 54 | Removed linked-modular-api=.docker/empty |
| .github/workflows/release staging.yaml | 58 | Same |

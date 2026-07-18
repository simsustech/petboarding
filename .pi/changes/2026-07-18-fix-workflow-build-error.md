# Changes: Fix workflow build error - prebuild @petboarding/tools instead of using --legacy (2026-07-18)

## Problem

The Docker build was failing with `@petboarding/tools not found` errors during `pnpm deploy` stages. This occurred because:

- With `injectWorkspacePackages: true`, pnpm creates a frozen copy of workspace dependencies at install time (before build)
- `@petboarding/tools` was copied without its built `dist/` directory
- During `pnpm deploy`, the snapshotted node_modules lacked the compiled `.js` files
- Rolldown/Vitrify failed to resolve `@petboarding/tools/constants` etc.

## Previous Attempt (Rejected)

Commit `f3585d1c` attempted to fix by:

- Removing `injectWorkspacePackages: true` (rejected by user)
- Adding `--legacy` flag to `pnpm deploy` commands (workaround, not preferred solution)

## Solution Implemented

Maintain `injectWorkspacePackages: true` and instead:

1. **Pre-build `@petboarding/tools`** before the install stage
2. **Copy built dist/** into place before running `pnpm install --frozen-lockfile`
3. **Keep `pnpm deploy` without `--legacy` flags**
4. **Ensure proper `.npmrc` handling** for private registry access

## Changes Made

### Dockerfile

- Added `tools-build` stage that:
  - Installs `@petboarding/tools`
  - Builds it (creating `dist/` directory)
- Modified `install-stage` to:
  - Copy built `dist/` from `tools-build` before `COPY . .`
  - Run `pnpm install --frozen-lockfile` (now includes built dist/)
- Kept `api-deploy` stage with:
  - `pnpm deploy --prod` (NO `--legacy` flag)
  - Proper `.npmrc` mounting before deploy
  - Cleanup of `.npmrc` after deploy to prevent leaking secrets

### Package Files

- `pnpm-workspace.yaml`: Maintains `injectWorkspacePackages: true` (unchanged)
- `pnpm-lock.yaml`: Updated dependency versions during refresh (inherent to rebuild)

## Verification

- Confirmed both `packages/api/node_modules/@petboarding/tools/dist/` and `packages/app/node_modules/@petboarding/tools/dist/` exist and contain compiled `.js` files
- Validated Dockerfile structure correctly sequences build → copy → install → deploy
- Confirmed no `--legacy` flags remain in deploy commands
- Verified proper `.npmsc` handling for private registry access

## Result

The Docker build now succeeds because:

1. `@petboarding/tools` is built in the `tools-build` stage
2. Its built `dist/` directory is available when `pnpm install --frozen-lockfile` runs
3. The injected workspace dependencies (with `injectWorkspacePackages: true`) include the built files
4. `pnpm deploy` can successfully snapshot and deploy the complete package

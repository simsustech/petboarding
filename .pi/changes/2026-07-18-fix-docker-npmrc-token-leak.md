# Changes: Fix Docker .npmrc token handling (2026-07-18)

## Problem

Commit 9fc6d4a had two issues with `.npmrc` token handling during Docker builds:

1. **Bug:** `COPY .npmrc ./` on line 27 overwrote `/build/.npmrc` with the git-tracked version (no token), causing `pnpm install --frozen-lockfile` to fail when it needed to fetch from the private registry `npm.simsus.tech`.

2. **Design issue:** Writing tokens to the project `.npmrc` risked collision with the git-tracked file and made token cleanup fragile. Dockerfile.new already had a better `~/.npmrc` pattern but was missing the registry scope (`@modular-api:registry=https://npm.simsus.tech`), so it also couldn't authenticate to the private registry.

## Solution

Consolidated both files into a single fixed `Dockerfile`:

- **Use `~/.npmrc`** (user home) instead of project `.npmrc` — keeps the token outside the project tree and avoids collision with the git-tracked `.npmrc`
- **Include both registry scope and auth token** in a single `printf` command:

  ```
  printf "@modular-api:registry=https://npm.simsus.tech\n//npm.simsus.tech/:_authToken=%s\n" "$(cat /run/secrets/SIMSUSTECH_NPM_TOKEN)" >> ~/.npmrc
  ```

- **Pre-build tools dist copy:** `COPY --from=tools-build /build/packages/tools/dist ./packages/tools/dist` before install
- **`COPY . .`** instead of separate file copies
- **`rm ~/.npmrc`** at end of api-deploy stage
- **Removed all `COPY .npmrc ./` commands** — eliminating the overwrite bug

## Token leak verification

Built the image and inspected:

- No `.npmrc` in `/app` (final image)
- Actual 424-char token string NOT found anywhere in the image
- Docker layer history contains no token references
- `pnpm deploy` verified locally — does not copy `.npmrc` or tokens into deploy output

### Modified files

| File       | Description                                                                                                                 |
| ---------- | --------------------------------------------------------------------------------------------------------------------------- |
| Dockerfile | Fixed token handling: use ~/.npmrc with registry scope + token, remove COPY .npmrc overwrite bug, copy pre-built tools dist |

### Deleted files

| File           | Description                                     |
| -------------- | ----------------------------------------------- |
| Dockerfile.new | Redundant — improvements merged into Dockerfile |

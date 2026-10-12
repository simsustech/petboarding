# Changes: fix CI test-image build (host-network entitlement) (2026-10-12)

## Problem
`pnpm run test:e2e` (and the `Test staging build` workflow) failed at
`global-setup.ts:26` — `docker compose -f docker-compose.test.yaml build app`:

```
additional privileges requested: pass "--allow=network.host" to grant requested privileges
Error: Command failed: docker compose ... build app
```

## Root cause
Not nono / not the runner sandbox. The string comes from **`docker-buildx`**:
BuildKit gates host networking behind the `network.host` entitlement.
`build.network: 'host'` in the compose files makes the build request that
entitlement, and `docker compose build` does not grant it. The image does not
need host networking — it reaches the package registry over the default bridge.

## Modified files (all hunks accepted)
| File | Description |
|------|-------------|
| `docker-compose.test.yaml` | `build.network: 'host'` → `network: default`; wrap the over-long `additional_contexts` values in the `>-` folded style used by the sibling demo file; move the secret's inline comment onto its own line |
| `docker-compose.test.config.yaml` | same `network: default` change; move the secret's inline comment onto its own line |
| `docker-compose.test.demo.yaml` | same `network: default` change |

## Verification
- `docker compose -f docker-compose.test.yaml config` renders `network: default`
  and the same `additional_contexts` map as before; `${LINKED_*:-.docker/empty}`
  interpolation still resolves both unset and overridden.
- `docker compose -f docker-compose.test.yaml build app` (no overlay, committed
  file) → `Image petboarding-app Built`.
- Full e2e on the committed config: **117 passed / 5 skipped / 4 failed** — the
  4 are the pre-existing seed-dependent failures (see
  `2026-10-12-unocss-preset-0.7-devcert-sigmap.md`).
- All three compose files pass the YAML lin/col checks.

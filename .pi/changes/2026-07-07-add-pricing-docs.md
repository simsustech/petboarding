# Changes: Add pricing page to docs + regenerate screenshots (2026-07-07)

## New files
| File | Description |
|------|-------------|
| `packages/docs/pricing.md` | English pricing page (Cloud-first, Self-Hosted as open-source) |
| `packages/docs/nl/pricing.md` | Dutch translation |
| `packages/api/playwright-screenshots.config.ts` | Standalone Playwright config for screenshot tests |
| `docker-compose.test.demo.yaml` | Docker compose with seed:fake for customer screenshot tests |

## Modified files (all hunks accepted)
| File | Lines | Description |
|------|-------|-------------|
| `packages/docs/.vitepress/config.ts` | 17, 48, 65 | Added Pricing/Prijzen to nav + outlineTitle for NL |
| `packages/docs/public/screenshots/*.png` | 36 files | Regenerated via E2E screenshot tests (8/8 passed) |

## Branch
`feat/add-pricing-docs` (based on `main`)

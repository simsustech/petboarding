# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: the staff and owners of pet boarding and daycare facilities — the people
reviewing bookings, assigning kennels, approving daycare dates, tracking vaccination
compliance, and closing invoices. When product decisions force a tradeoff, their
operational speed and scanability win.

Secondary, first-class in scope but never the tie-breaker: the facilities' customers
(pet owners) using the self-service portal to register pets, book stays, and manage
daycare dates; and administrators configuring pricing, opening times, and integrations
for their deployment.

## Product Purpose

Petboarding is the all-in-one management platform for a pet boarding and daycare
facility: it makes the facility's whole operating loop — bookings, daycare, pets,
kennels, invoicing — manageable in one system instead of spreadsheets plus a calendar.
Success means a facility can run its day reliably and a customer can self-serve without
generating staff work. The product's own promise is "Easy, fast and reliable pet
boarding software."

## Positioning

A neighboring product could not truthfully copy the combination: an end-to-end
facility platform that is source-available under ELv2 and runs wherever the operator
wants — self-hosted via Docker Compose under a license key, operated by simsustech, or
forked from the public repository — with daycare sold as prepaid subscription packs and
the kennel floor managed as a drag-and-drop layout with vaccination compliance built
into assignment. Deployment freedom plus facility-complete operations is the claim.

## Operating Context

- Facilities evaluate the product at demo.petboarding.app; documentation and the four
  guides (features, customer, employee, administrator) live at petboarding.app.
- Deployments run as Docker Compose stacks behind a Caddy reverse proxy; operators
  configure pricing categories, opening times, services, blocked periods, vacation
  surcharges, and Handlebars email templates per deployment.
- Payment and invoicing integrations (Mollie with iDEAL, SlimFact) and OIDC sign-in are
  per-deployment configuration, not a market assumption.
- Development is a pnpm monorepo (Vue 3 + Quasar app, Fastify + tRPC API on the Modular
  API, shared tools package) with docker dev/test stacks, Playwright e2e, and
  private-NPM access; development has been AI-assisted since June 2026.
- English and Dutch are equal first-class locales with no lead market; every
  user-facing string ships in both.

## Capabilities and Constraints

- Roles: customer (own profile, pets, bookings, daycare), employee (customers, kennels,
  agenda, labels), administrator (configuration, finances).
- **Architectural constraint (ADR 001):** customers never edit a pet's category and
  never see internal staff comments; the category drives pricing and lives only on the
  staff side. "Parity" changes that expose these to customers fail the e2e guard first.
- Booking workflow: approve, reject, standby, reply, with automatic email
  notifications; daycare workflow: monthly calendar, bulk approve/reject/standby, and
  prepaid subscriptions with automatic day deduction.
- Pet records carry species, breed, weight, food/medication schedules, vaccination
  documents with expiry compliance checks, and compatibility ratings for kennel
  cohabitation.
- Business side: category-based pricing with date overrides, down payments, occupancy
  and financial overviews, SlimFact invoicing where configured.
- Technical constraints future work inherits: responsive desktop/tablet/mobile, PWA
  with offline caching, dark mode, ELv2 license (© simsustech 2023-present).
- Engineering rule that shapes product delivery (ADR 002): defects in Quasar or the
  shared `unocss-preset-quasar` are fixed upstream with a changeset, never patched
  locally in the app.
- Open decisions: none recorded as undecided at this time.

## Brand Commitments

- Name: **Petboarding**; maker: simsustech; site and demo on the petboarding.app domain.
- Promise: "Easy, fast and reliable pet boarding software — the all-in-one platform to
  manage your pet boarding and daycare facility."
- Voice evidence on hand is plain, operational copy aimed at busy facility staff; no
  separate tone-of-voice document exists, and none is claimed here.

## Evidence on Hand

- `README.md` — feature list, roles, self-host instructions, license.
- `CONTEXT.md` and `docs/adr/001-customers-never-edit-category-or-comments.md`,
  `docs/adr/002-no-quasar-overrides-in-the-app.md` — reviewed product/architecture rules.
- Committed screenshots: `packages/docs/public/screenshots/` (desktop, mobile, en, nl).
- Playwright e2e suite exercising customer, employee, and administrator flows.
- Seeded demo database and demo.petboarding.app.
- Absent from the repository: user research, testimonials, customer counts, pricing, and
  benchmarks. Future work must not fabricate any of them.

## Product Principles

1. Staff operations win tradeoffs: a faster, more scannable facility workflow beats a
   richer portal flourish every time.
2. Two locales, zero defaults: if a string, date, or flow ships, it ships equally in
   English and Dutch, and no market's conventions are hardcoded as "the" convention.
3. The role boundary is architectural: staff-only data (pet category, internal
   comments) never leaks into the customer experience, enforced by tests, not review.
4. Deployment freedom is the position: the same product truth runs self-hosted,
   simsustech-hosted, or community-forked; per-deployment configuration (payments,
   invoicing, identity) stays configuration.
5. Compliance is product surface: vaccination validity, category pricing, and
   invoice/payment trails are things operators act on, so they belong in the UI, not
   only in records.

## Accessibility & Inclusion

The frontend is held to an audited standard in-repo: exactly one page `h1` per route,
accessible names on controls (row menus, icon buttons), and screen-reader labels on
navigation — asserted by the `frontend/` Playwright specs, originating from the
2026-09-23 screenshot audit. Dark mode and fully responsive layouts are shipped
capabilities. No external WCAG/public-sector requirement has been established for this
product.

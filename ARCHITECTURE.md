# ARCHITECTURE.md

This file is the top-level map of the system. It should stay concise and point
to deeper documents when needed.

## System Shape

- Product: `Household Finance Web App`
- Primary user workflow: `quick expense capture -> household aggregation -> budget & insights`
- Runtime surfaces: `web (frontend)` / `Cloudflare Workers (backend)` / `D1 (database)`
- Source of truth for product behavior: `docs/product-specs/`

## Domain Map

| Domain | Purpose | Primary Entry Points | Related Spec |
|--------|---------|----------------------|--------------|
| `expenses` | Record, validate, and store expense items | `apps/web` UI forms -> `apps/worker` routes (POST /expenses) | `docs/product-specs/expense-tracking.md` |
| `households` | Household membership, roles, visibility | `apps/worker` routes (household CRUD, membership) -> `apps/web` views | `docs/product-specs/household-management.md` |
| `auth` | Verify and map user identity (Firebase ID tokens -> local users) | `apps/web` (frontend auth) -> `apps/worker` (token verification via JWKS + jose) | `docs/product-specs/authentication.md` |
| `insights` | Aggregation, budgets, basic analytics | `apps/worker` aggregation routes -> `apps/web` dashboards | `docs/product-specs/insight-analytics.md` |

## Layer Model

Use a fixed directional model so agents do not invent ad hoc architecture:

`Types -> Config -> Repo -> Service -> Runtime -> UI`

Cross-cutting concerns should enter through explicit provider or adapter
boundaries instead of reaching across layers directly.

## Hard Dependency Rules

- Lower layers must not depend on higher layers.
- UI must not bypass runtime or service contracts.
- Data access must enter through repositories or equivalent adapters.
- Shared utilities must remain generic and must not accumulate domain logic.
- New dependencies should be justified in the matching plan or design doc.

## Cross-Cutting Interfaces

| Concern | Approved Boundary | Notes |
|--------|-------------------|-------|
| Logging and tracing | `packages/*/lib/log` (or `apps/*/src/lib/log`) | Structured logs only; avoid ad-hoc console use in production paths |
| Auth | `apps/worker/src/lib/auth` | Worker verifies Firebase ID tokens using JWKS + `jose` (lightweight, Cloudflare-friendly). Do not couple UI directly to DB access. |
| External APIs | `apps/worker/src/lib/clients` | External calls must implement retry and timeout policies. Keep clients behind adapters. |
| Feature flags | `apps/worker/src/lib/flags` | Feature flags evaluated in backend when behavior changes are sensitive |

## Current Hot Spots

- `[area that is hardest for agents to change safely]`
- `[area with weak boundaries or fragile tests]`

## Change Checklist

When you touch architecture-relevant code:

1. Update this file if the domain map or allowed boundaries changed.
2. Update the related design doc in `docs/design-docs/` if the reasoning changed.
3. Add or update an executable check if the rule should be enforced mechanically.

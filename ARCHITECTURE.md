# ARCHITECTURE.md

Top-level system map. Stay concise, point to deeper docs when needed.

## System Shape

- Product: `Household Finance Web App`
- Primary user workflow: `quick expense capture -> household aggregation -> budget & insights`
- Runtime surfaces: `web (frontend)` / `Cloudflare Workers (backend)` / `D1 (database)`
- Source of truth for product behavior: `docs/product-specs/`

## Domain Map

| Domain | Purpose | Primary Entry Points | Related Spec |
|--------|---------|----------------------|--------------|
| `expenses` | Record, validate, store expense items | `apps/web` UI forms -> `apps/worker` routes (POST /expenses) | `docs/product-specs/expense-tracking.md` |
| `households` | Household membership, roles, visibility | `apps/worker` routes (household CRUD, membership) -> `apps/web` views | `docs/product-specs/household-management.md` |
| `auth` | Verify and map user identity (Firebase ID tokens -> local users) | `apps/web` (frontend auth) -> `apps/worker` (token verification via JWKS + `jose`) | `docs/product-specs/authentication.md` |
| `insights` | Aggregation, budgets, basic analytics | `apps/worker` aggregation routes -> `apps/web` dashboards | `docs/product-specs/insight-analytics.md` |

## Layer Model

Fixed directional model — agents must not invent ad hoc architecture:

`Types -> Config -> Repo -> Service -> Runtime -> UI`

Cross-cutting concerns enter through explicit provider or adapter boundaries, not across layers directly.

## Hard Dependency Rules

- Lower layers must not depend on higher layers.
- UI must not bypass runtime or service contracts.
- Data access must enter through repositories or equivalent adapters.
- Shared utilities must remain generic, must not accumulate domain logic.
- New dependencies must be justified in matching plan or design doc.

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

When touching architecture-relevant code:

1. Update this file if domain map or allowed boundaries changed.
2. Update related design doc in `docs/design-docs/` if reasoning changed.
3. Add or update executable check if rule should be enforced mechanically.

## Meaningful Namespaces and File Organization

- Agents navigate code primarily via filesystem; file and folder names are an important API.
- Prefer descriptive paths (e.g., billing/invoices/compute.ts) over generic helpers — improves discoverability and intent signaling.
- Keep files small and focused so agents can load and reason about whole files without truncation.
- When a file is long and contains many tasks, split it into smaller files.
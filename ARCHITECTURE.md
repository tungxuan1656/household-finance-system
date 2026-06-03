# ARCHITECTURE.md

System map. Keep short. Route deeper behavior to exact docs.

## System Shape

- Product: household finance web app.
- Core flow: quick expense capture → household aggregation → budgets + insights.
- Surfaces: `apps/web` (Next.js browser client), `apps/tma` (Telegram Mini App client), `apps/worker` (Cloudflare Worker API), D1 database.
- Product behavior source: `docs/product-specs/index.md` → exact feature spec.

## Domain Map

| Domain | Purpose | Entry | Spec |
|--------|---------|-------|------|
| `auth` | Verify identity, map provider user to local user | web auth or TMA launch context → worker auth | `docs/product-specs/shared/authentication-session.md` |
| `households` | Membership, roles, visibility | worker routes + web views | `docs/product-specs/shared/household-management.md` |
| `expenses` | Capture, validate, query expenses | web forms → worker routes | `docs/product-specs/shared/expense-tracking.md` |
| `budgets` | Budget setup and tracking | worker aggregates + web budget views | `docs/product-specs/shared/budget-management.md` |
| `insights` | Analytics, comparisons, exports | worker analytics + web dashboards | `docs/product-specs/shared/analytics-overview.md` |

## Layer Model

Direction is fixed:

`Types -> Config -> Repo -> Service -> Runtime -> UI`

Rules:
- Lower layers do not depend on higher layers.
- UI does not bypass runtime/service contracts.
- Data access enters through repositories/adapters.
- Shared utilities stay generic. No domain dumping ground.
- New dependency needs plan/design justification.

## Boundaries

| Concern | Boundary |
|---------|----------|
| Frontend | `docs/FRONTEND.md` |
| TMA | `docs/TMA.md` |
| Backend | `docs/BACKEND.md` |
| API contracts | `docs/references/backend/api-contract-and-validation.md` |
| Auth/security | `docs/references/backend/security-and-auth-pattern.md`, `docs/SECURITY.md` |
| Testing placement | `docs/testing/test-placement-and-sharding-convention.md` |
| Product behavior | `docs/product-specs/index.md` |

## File Organization Rules

- Descriptive paths are API for agents.
- Prefer focused files over large mixed files.
- Split when file mixes unrelated concerns or becomes hard to review.
- Put reusable rules in `docs/references/*`; keep this file system-level only.

## Change Checklist

When architecture changes:
1. Update this file only for domain/layer/boundary changes.
2. Update exact child reference/spec affected.
3. Add executable check when rule can be enforced mechanically.

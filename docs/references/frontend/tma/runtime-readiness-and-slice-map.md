# TMA runtime readiness and slice map

Use this doc when the team asks: "Do we have enough docs to start this TMA slice, and exactly what must be read first?"

## Scope

Use this doc for:

- feat-by-feat TMA readiness
- locked default decisions before runtime code starts
- exact doc-reading sets for `feat-079` through `feat-085`
- remaining prerequisites that still belong in ExecPlans, not in generic reference docs

## Locked defaults

- Package line: use `@tma.js/*` for new TMA runtime work.
- Cold-open auth: exchange Telegram launch context on each supported cold open.
- Token persistence: keep access token in memory; persist refresh token in `SecureStorage` only when supported.
- Unsupported `SecureStorage`: keep the session memory-only and re-exchange on next supported launch.
- Bot runtime: start worker-first inside `apps/worker` behind an explicit bot adapter boundary.

## Read sets by feature slice

### feat-079 — workspace scaffold and bootstrap

Read first:

- `docs/design-docs/frontend/tma/telegram-mini-app-client-architecture.md`
- `docs/references/frontend/tma/app-structure-and-client-rules.md`
- `docs/references/frontend/tma/native-ui-and-navigation-pattern.md`
- `docs/references/frontend/tma/development-and-hardening-pattern.md`
- `ARCHITECTURE.md`

Preserve these repo truths:

- `apps/tma` is a separate workspace app.
- The scaffold stops short of Telegram auth or domain CRUD.

### feat-080 — auth provider exchange and session bootstrap

Read first:

- `docs/product-specs/shared/authentication-session.md`
- `docs/product-specs/tma/launch-and-auth.md`
- `docs/references/frontend/tma/state-and-storage-pattern.md`
- `docs/references/frontend/tma/auth-and-bot-pattern.md`
- `docs/references/backend/api-contract-and-validation.md`
- `docs/references/backend/security-and-auth-pattern.md`
- `docs/references/backend/cloudflare-workers.md`
- `docs/references/shared/type-naming-pattern.md`

Preserve these repo truths:

- worker session lifecycle remains shared with web
- current worker route is `/api/v1/auth/provider/exchange`

### feat-081 — expense capture flow

Read first:

- `docs/product-specs/shared/expense-tracking.md`
- `docs/product-specs/shared/expense-management.md`
- `docs/product-specs/shared/expense-categorization.md`
- `docs/product-specs/shared/expense-grouping.md`
- `docs/product-specs/shared/expense-household-context.md`
- `docs/product-specs/tma/expense-capture.md`
- `apps/tma/DESIGN.md`
- `docs/references/frontend/tma/native-ui-and-navigation-pattern.md`
- `docs/references/frontend/tma/state-and-storage-pattern.md`

Preserve these repo truths:

- TMA expense flow is `date + category -> amount + source + note -> household + group + preview`
- shared worker expense semantics stay unchanged

### feat-082 — household and invite flows

Read first:

- `docs/product-specs/shared/household-management.md`
- `docs/product-specs/shared/household-invitation.md`
- `docs/product-specs/shared/role-permission.md`
- `docs/product-specs/tma/invite-entrypoints.md`
- `docs/references/frontend/tma/auth-and-bot-pattern.md`
- `docs/references/frontend/tma/native-ui-and-navigation-pattern.md`

Preserve these repo truths:

- invite, membership, and role rules remain worker-owned
- TMA deep links continue into the same invite preview/accept logic

### feat-083 — budgets, groups, and insights read surfaces

Read first:

- `docs/product-specs/shared/budget-management.md`
- `docs/product-specs/shared/expense-querying.md`
- `docs/product-specs/shared/analytics-overview.md`
- `docs/product-specs/shared/expense-grouping.md`
- `apps/tma/DESIGN.md`
- `docs/references/frontend/tma/app-structure-and-client-rules.md`
- `docs/references/frontend/tma/native-ui-and-navigation-pattern.md`
- `docs/references/frontend/tma/state-and-storage-pattern.md`

Preserve these repo truths:

- worker data contracts stay shared
- TMA read surfaces optimize for scan and drill-down, not desktop parity

### feat-084 — device hardening and performance QA

Read first:

- `docs/references/frontend/tma/native-ui-and-navigation-pattern.md`
- `docs/references/frontend/tma/state-and-storage-pattern.md`
- `docs/references/frontend/tma/development-and-hardening-pattern.md`
- `docs/design-docs/frontend/tma/telegram-mini-app-client-architecture.md`

Preserve these repo truths:

- verification must happen on real Telegram surfaces, not only standard mobile browsers
- unsupported capability fallback is part of the acceptance bar

### feat-085 — bot companion launch and notifications

Read first:

- `docs/references/frontend/tma/auth-and-bot-pattern.md`
- `docs/product-specs/shared/household-invitation.md`
- `docs/product-specs/shared/budget-notification.md`
- `docs/product-specs/shared/notification-system.md`
- `docs/design-docs/frontend/tma/telegram-mini-app-client-architecture.md`

Preserve these repo truths:

- bot is companion UX only
- default deployment is worker-first behind an adapter boundary

## Short readiness verdict

Current docs are enough to start `feat-079` immediately and to plan `feat-080` without reopening core TMA architecture questions.

The remaining work before code is slice-level sequencing and exact file-level implementation planning, not missing platform direction.

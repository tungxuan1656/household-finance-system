# TMA runtime readiness and slice map

Use this doc when the team asks: "Do we have enough docs to start this TMA slice, and exactly what must be read first?"

## Scope

Use this doc for:

- feat-by-feat TMA readiness
- locked default decisions before runtime code starts
- exact doc-reading sets for `feat-079` through `feat-085`
- remaining prerequisites that still belong in ExecPlans, not in generic reference docs

## Locked defaults

These defaults are now the repo recommendation unless a later design decision overrides them with evidence.

- Package line: use `@tma.js/*` for new TMA runtime work.
- Cold-open auth: exchange Telegram launch context on each supported cold open.
- Token persistence: keep access token in memory; persist refresh token in `SecureStorage` only when supported.
- Unsupported `SecureStorage`: keep the session memory-only and re-exchange on next supported launch.
- Bot runtime: start worker-first inside `apps/worker` behind an explicit bot adapter boundary.

## What these docs now cover

The current TMA docs are now sufficient to start the first runtime slice because they cover:

- client boundary and stack direction
- package and folder ownership
- native navigation and Telegram chrome responsibilities
- state/cache/storage policy
- auth and bot boundary rules
- local development and hardening expectations
- phased rollout order

What they do not replace:

- per-slice ExecPlans
- exact runtime file lists for implementation batches
- domain product specs for expense, household, budget, and analytics behavior

## Read sets by feature slice

### feat-079 — workspace scaffold and bootstrap

Read first:

- `docs/design-docs/telegram-mini-app-client-architecture.md`
- `docs/references/tma/app-structure-and-client-rules.md`
- `docs/references/tma/native-ui-and-navigation-pattern.md`
- `docs/references/tma/development-and-hardening-pattern.md`
- `docs/references/frontend/project-folder-structure.md`
- `docs/references/frontend/naming-and-conventions-pattern.md`
- `ARCHITECTURE.md`

Preserve these repo truths:

- `apps/tma` is a separate workspace app.
- Root `package.json` and `init.sh` currently know only `web` and `worker`.
- The scaffold should stop short of Telegram auth or domain CRUD.

Remaining prerequisite:

- use the active ExecPlan `docs/exec-plans/plans/2026-06-02-telegram-mini-app-runtime-scaffold.md` as the coding entry point

### feat-080 — auth provider exchange and session bootstrap

Read first:

- `docs/product-specs/authentication.md`
- `docs/product-specs/telegram-mini-app.md`
- `docs/references/tma/state-and-storage-pattern.md`
- `docs/references/tma/auth-and-bot-pattern.md`
- `docs/references/backend/api-contract-and-validation.md`
- `docs/references/backend/security-and-auth-pattern.md`
- `docs/references/backend/cloudflare-workers.md`
- `docs/references/shared/type-naming-pattern.md`

Preserve these repo truths:

- worker session lifecycle remains shared with web
- current worker route is `/api/v1/auth/provider/exchange`
- current runtime request still uses Firebase-shaped naming

Remaining prerequisite:

- auth ExecPlan that names the contract normalization, worker crypto path, and refresh-token persistence implementation

### feat-081 — expense capture flow

Read first:

- `docs/product-specs/telegram-mini-app.md`
- `docs/product-specs/expense-tracking.md`
- `docs/product-specs/expense-management.md`
- `docs/product-specs/expense-categorization.md`
- `docs/product-specs/expense-grouping.md`
- `docs/product-specs/expense-household-context.md`
- `apps/tma/DESIGN.md`
- `docs/references/tma/native-ui-and-navigation-pattern.md`
- `docs/references/tma/state-and-storage-pattern.md`

Preserve these repo truths:

- TMA expense flow is `date + category -> amount + source + note -> household + group + preview`
- shared worker expense semantics stay unchanged
- TMA-specific UX is allowed only where it improves interaction quality, not domain behavior

Remaining prerequisite:

- flow-shell and store plan naming the first route set and bottom-button ownership

### feat-082 — household and invite flows

Read first:

- `docs/product-specs/household-management.md`
- `docs/product-specs/household-invitation.md`
- `docs/product-specs/role-permission.md`
- `docs/product-specs/new-user-onboarding.md`
- `docs/references/tma/auth-and-bot-pattern.md`
- `docs/references/tma/native-ui-and-navigation-pattern.md`

Preserve these repo truths:

- invite, membership, and role rules remain worker-owned
- TMA deep links continue into the same invite preview/accept logic
- no TMA-only household permission model is introduced

Remaining prerequisite:

- deep-link and post-auth routing plan for invite preview/accept inside one SPA session

### feat-083 — budgets, groups, and insights read surfaces

Read first:

- `docs/product-specs/budget-management.md`
- `docs/product-specs/expense-querying.md`
- `docs/product-specs/analytics-overview.md`
- `docs/product-specs/expense-grouping.md`
- `apps/tma/DESIGN.md`
- `docs/references/tma/app-structure-and-client-rules.md`
- `docs/references/tma/native-ui-and-navigation-pattern.md`
- `docs/references/tma/state-and-storage-pattern.md`

Preserve these repo truths:

- worker data contracts stay shared
- TMA read surfaces optimize for scan and drill-down, not desktop parity
- heavy charts remain lazy by default

Remaining prerequisite:

- route-by-route plan for the first read pages and their query strategy

### feat-084 — device hardening and performance QA

Read first:

- `docs/references/tma/native-ui-and-navigation-pattern.md`
- `docs/references/tma/state-and-storage-pattern.md`
- `docs/references/tma/development-and-hardening-pattern.md`
- `docs/design-docs/telegram-mini-app-client-architecture.md`

Preserve these repo truths:

- verification must happen on real Telegram surfaces, not only standard mobile browsers
- unsupported capability fallback is part of the acceptance bar
- primary flows are launch, auth bootstrap, invite accept, and expense capture

Remaining prerequisite:

- QA matrix and evidence plan per client/platform/version combination

### feat-085 — bot companion launch and notifications

Read first:

- `docs/references/tma/auth-and-bot-pattern.md`
- `docs/product-specs/household-invitation.md`
- `docs/product-specs/budget-notification.md`
- `docs/product-specs/notification-system.md`
- `docs/design-docs/telegram-mini-app-client-architecture.md`

Preserve these repo truths:

- bot is companion UX only
- default deployment is worker-first behind an adapter boundary
- outbound failures, rate limits, and retries must stay explicit

Remaining prerequisite:

- delivery plan for webhook handling, outbound send path, and notification trigger ownership

## Short readiness verdict

Current docs are enough to start `feat-079` immediately and to plan `feat-080` without reopening core TMA architecture questions.

The remaining work before code is not missing platform direction. It is slice-level sequencing and exact file-level implementation planning.

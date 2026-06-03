# Task Map

Use this file to pick the minimum docs for the current TMA slice.

## feat-079 — scaffold and bootstrap

Read:

- `docs/TMA.md`
- `docs/references/frontend/tma/app-structure-and-client-rules.md`
- `docs/references/frontend/tma/native-ui-and-navigation-pattern.md`
- `docs/references/frontend/tma/development-and-hardening-pattern.md`
- `docs/exec-plans/plans/2026-06-02-telegram-mini-app-runtime-scaffold.md`

Preserve:

- `apps/tma` is separate from `apps/web`
- `@tma.js/sdk-react` is the primary dependency
- no auth or domain CRUD lands in the scaffold

## feat-080 — auth and session bootstrap

Read:

- `docs/product-specs/shared/authentication-session.md`
- `docs/product-specs/tma/launch-and-auth.md`
- `docs/references/frontend/tma/state-and-storage-pattern.md`
- `docs/references/frontend/tma/auth-and-bot-pattern.md`

Preserve:

- worker session lifecycle stays shared with web
- unsupported `SecureStorage` means memory-only fallback

## feat-081 — expense capture

Read:

- `docs/product-specs/shared/expense-tracking.md`
- `docs/product-specs/tma/expense-capture.md`
- `apps/tma/DESIGN.md`
- `docs/references/frontend/tma/native-ui-and-navigation-pattern.md`
- `docs/references/frontend/tma/state-and-storage-pattern.md`

Preserve:

- flow is `date + category -> amount + source + note -> household + group + preview`
- shared expense semantics stay worker-owned

## feat-082 — household and invite

Read:

- `docs/product-specs/shared/household-management.md`
- `docs/product-specs/shared/household-invitation.md`
- `docs/product-specs/tma/invite-entrypoints.md`
- `docs/references/frontend/tma/auth-and-bot-pattern.md`

Preserve:

- invite and membership rules remain worker-owned
- deep links continue into the same preview and accept logic

## feat-083 — read surfaces

Read:

- `docs/product-specs/shared/budget-management.md`
- `docs/product-specs/shared/analytics-overview.md`
- `apps/tma/DESIGN.md`
- `docs/references/frontend/tma/app-structure-and-client-rules.md`
- `docs/references/frontend/tma/native-ui-and-navigation-pattern.md`

Preserve:

- read surfaces optimize for scan and drill-down
- heavy views stay lazy by default

## feat-084 — hardening and QA

Read:

- `docs/references/frontend/tma/native-ui-and-navigation-pattern.md`
- `docs/references/frontend/tma/state-and-storage-pattern.md`
- `docs/references/frontend/tma/development-and-hardening-pattern.md`

Preserve:

- verify on real Telegram surfaces
- unsupported capability fallback is part of acceptance

## feat-085 — bot companion

Read:

- `docs/references/frontend/tma/auth-and-bot-pattern.md`
- `docs/product-specs/shared/household-invitation.md`
- `docs/design-docs/frontend/tma/telegram-mini-app-client-architecture.md`

Preserve:

- bot is companion UX only
- default deployment shape is worker-first

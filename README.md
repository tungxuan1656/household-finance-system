# Household Finance System

Personal and Family Expense Management System.

This project helps households track spending transparently, control budgets, and understand cash flow through simple analytics.

## What this repository contains

This is a `pnpm` monorepo with two main apps:

- `apps/web`: React 19 + TypeScript + Vite + Tailwind + shadcn UI
- `apps/worker`: Cloudflare Workers + Hono + D1 + Zod

Core intent:

- quick expense capture
- household-level visibility and roles
- monthly budget control
- clear and actionable spending insights

## Repository structure

```text
.
|- apps/
|  |- web/      # Frontend (Vite + React)
|  |- worker/   # Backend/Edge API (Cloudflare Worker)
|- docs/        # Product, architecture, plans, standards
|- init.sh      # Standard setup + verification entry point
|- AGENTS.md    # Working rules for agent and team workflow
```

## Required reading before coding

Follow this order for fastest onboarding:

1. `AGENTS.md`
2. `ARCHITECTURE.md`
3. `docs/PRODUCT.md`
4. `docs/PLANS.md`
5. `docs/product-specs/index.md`
6. `docs/RELIABILITY.md`
7. `docs/SECURITY.md`
8. `docs/FRONTEND.md`

These files define scope, boundaries, verification, and quality expectations.

## Prerequisites

- Node.js 20+
- pnpm 10+
- Cloudflare Wrangler (for worker local/dev/deploy flows)

## Quick start

From repository root:

```bash
pnpm install
./init.sh
```

`./init.sh` runs the standard verification path:

- install dependencies
- lint
- typecheck
- tests (web + worker)
- web build

## Common commands

Run from repository root.

```bash
# Development
pnpm dev:web
pnpm dev:worker

# Quality
pnpm lint
pnpm lint:fix
pnpm typecheck
pnpm test:web
pnpm test:worker

# Build / deploy
pnpm build:web
pnpm deploy:worker
```

## One-feature-at-a-time workflow

The project follows a strict execution workflow:

1. Work on one feature/plan per session.
2. Keep boundaries from `ARCHITECTURE.md`.
3. Verify before claiming done (`./init.sh`).
4. Record evidence and progress in required artifacts.

Expected project artifacts (per `AGENTS.md`):

- `harness/feature_index.json`: lightweight feature state tracker
- `harness/features/*.json`: detailed per-feature records
- `harness/progress.md`: session progress log
- `harness/session-handoff.md`: optional handoff file

If these files are missing, create and maintain them as part of the team workflow.

## Product scope (MVP snapshot)

- Authentication and user profile basics
- Expense CRUD with payer vs creator model
- Personal vs household visibility
- Household membership and role-permission model
- Monthly budgets
- Grouping/event-based expenses
- Basic analytics and filtering

Detailed behavior lives in `docs/product-specs/`.

## Notes for contributors

- Keep code consistent and maintainable.
- Do not bypass service/runtime boundaries.
- Justify new dependencies in plans or design docs.
- Prefer small, verifiable changes with clear evidence.

## License

Current package metadata is `ISC`.
If your team needs a different license policy, update root metadata and this section together.

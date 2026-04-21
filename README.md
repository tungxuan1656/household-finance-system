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

## Architecture & Harness

This repository's architecture and development "harness" follow modern
harness-engineering guidance. In particular, we adopt the five-subsystem
approach (Instructions, State, Verification, Scope, Lifecycle) to ensure
reproducible agent workflows, session continuity, and clear verification
paths across features. See `docs/knowledge/harness-engineering.md` for
additional detail and templates used in this project.

Primary sources and inspirations:

- OpenAI — Harness Engineering: https://openai.com/index/harness-engineering/
- WalkingLabs — Learn Harness Engineering: https://github.com/walkinglabs/learn-harness-engineering

Many thanks to the authors and maintainers of those resources for their
guidance and examples that informed this repository's harness design.

## Knowledge & Guides

This repository includes a small set of concise knowledge guides used as
reference material for agent workflows, architecture, and execution planning.
Below are the key documents with short summaries and links into the repo.

- [AI Is Forcing Us To Write Good Code](docs/knowledge/ai-is-forcing-us-to-write-good-code.md#L1): Argues that strong engineering practices (tests, types, fast automation, clear file structure) are now essential to make agent-driven development safe and productive.
- [ARCHITECTURE (Guide)](docs/knowledge/architecture-guide.md#L1): High-level map of the codebase — what to include in a stable architecture doc, boundaries, invariants, and maintenance guidance.
- [ExecPlan: Using PLANS.md (Codex ExecPlan)](docs/knowledge/codex-exec-plan.md#L1): A structured ExecPlan template for multi-hour tasks with observable acceptance criteria, commands, progress logs, and idempotent steps.
- [Harness Engineering — Condensed Summary](docs/knowledge/harness-engineering.md#L1): Condensed summary of harness engineering covering the five-subsystem harness, design principles, verification, state, lifecycle, and practical artifacts.

If you'd like the full text of any of these guides embedded directly into this README, tell me which one(s) and I'll paste them inlined beneath their summaries.


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

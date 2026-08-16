# Household Finance System

Personal and Family Expense Management System.

This project helps households track spending transparently, control budgets, and understand cash flow through simple analytics.

## What this repository contains

This is a `pnpm` monorepo with three main runtime surfaces:

- `apps/web`: React 19 + TypeScript + Next.js App Router + Tailwind + shadcn UI
- `apps/tma`: React + TypeScript + Vite SPA for Telegram Mini App
- `apps/worker`: Cloudflare Workers + Hono + D1 + Zod

The worker also hosts a Telegram bot companion (under `apps/worker/src/bot/`) for chat-first expense capture, read commands, and notifications. The bot is a surface, not a separate runtime; it shares one D1 truth and one auth contract with the rest of the system.

Core intent:

- quick expense capture (web forms, TMA, or one Telegram chat line)
- household-level visibility and roles
- monthly budget control
- clear and actionable spending insights
- a chat-first companion surface for fast finance actions without opening the TMA

## Repository structure

```text
.
|- apps/
|  |- web/      # Frontend (Next.js + React)
|  |- tma/      # Telegram Mini App (Vite + React)
|  |- worker/   # Backend/Edge API (Cloudflare Worker) + Telegram bot companion
|- docs/        # Product, architecture, plans, standards
|- init.sh      # Standard setup + verification entry point
|- AGENTS.md    # Working rules for agent and team workflow
```

## Required reading before coding

Read least docs that fully cover the task. Start with `AGENTS.md`, then follow
its task-specific route to the relevant parent doc, index, and exact leaf
references. Do not read broad folders by default.

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

`./init.sh` runs format, lint, typecheck, tests, and web/TMA builds. Worker
build is explicitly skipped. It does not deploy.

## Common commands

Run from repository root.

```bash
# Development
pnpm dev:web
pnpm dev:worker

# Quality (after `pnpm install`)
./init.sh

# Build / deploy
pnpm deploy:worker
```

## Feature state

Root `feature_index.json`, `features/*.md`, and `progress.md` are the only
feature-state files. See `AGENTS.md` for status, planning, recovery, and
verification rules.

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

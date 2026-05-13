# AGENTS.md

Personal & Family Expense Management System. Open-source household finance app for income, expenses, budgets, insights, categories, groups, recurring deductions, and family sharing.

## Stack

- Web: `apps/web` — React 19, TypeScript, Next.js App Router, Tailwind CSS, shadcn/ui, sonner, date-fns.
- Worker: `apps/worker` — Cloudflare Workers, Hono, D1, Wrangler, `zod`, `jose`, `ulid`.
- Tooling: `pnpm` monorepo, ESLint, Prettier, Vitest, TypeScript.

## Doc Architecture

- Parent docs route to child docs.
- Child docs hold rules. Child docs do not need parent backrefs.
- One rule area = one canonical home.
- Index docs route only. Do not duplicate rule bodies in indexes.
- Write prose short: caveman-lite/full. Keep technical terms exact.

## Minimal Reading Tree

Read least docs that fully cover task.

| Task | Read |
|------|------|
| Any session | `AGENTS.md` |
| Architecture/layer change | `ARCHITECTURE.md` |
| Frontend work | `docs/FRONTEND.md` → exact `docs/references/frontend/*` needed |
| Backend work | `docs/BACKEND.md` → exact `docs/references/backend/*` needed |
| Shared type/API naming | `docs/references/shared/type-naming-pattern.md` |
| Product behavior | `docs/product-specs/index.md` → exact feature spec |
| Plan creation/update | `docs/PLANS.md` → plan template/index as needed |
| UI durable design decision | `docs/design-docs/index.md` → exact design doc |
| Security-sensitive work | `docs/SECURITY.md` + exact backend/frontend refs |
| Reliability/runtime health | `docs/RELIABILITY.md` |
| Product judgment gap | `docs/PRODUCT_SENSE.md` |
| Harness/session tracking | `harness/feature_index.json` + exact `harness/features/*.json` |

Do not read broad folders by default. Use indexes to choose exact leaf docs.

## Session Rules

- Use `using-skills` first. Load task skill if applies.
- One feature/plan per session. Do not mix scopes.
- Before code edits, run required GitNexus impact checks for touched symbols.
- After code/doc edits, run `pnpm lint:fix` from repo root.
- Before claiming done, verify. Prefer `./init.sh` for full workspace.
- Before commit-ready summary, run `gitnexus_detect_changes(scope: "all")`.
- Update harness feature state + `harness/progress.md` before end session.
- Commit only when user explicitly asks.

## Required Artifacts

- `harness/feature_index.json`: feature list and status.
- `harness/features/*.json`: feature scope, dependencies, evidence.
- `harness/progress.md`: newest-first session log.
- `harness/session-handoff.md`: unfinished-session handoff when needed.
- `init.sh`: standard restart/verification path.

## Definition of Done

Done means:
- Implementation/docs complete.
- Verification passes: lint, type-check, tests, build as scope requires.
- Evidence recorded in harness artifacts.
- Progress logged.
- Repo restart path works.
- Changes committed only if user requested commit.

## Commands

- Full verification: `./init.sh`
- Required auto-fix after edits: `pnpm lint:fix`

`./init.sh` installs deps, checks harness, lints, type-checks, tests, builds web.

## GitNexus

Use GitNexus for unfamiliar/high-risk changes. If index stale, run `./scripts/sync_gitnexus.sh`.

Required:
- Before editing function/class/method: `gitnexus_impact({ target: "symbolName", direction: "upstream" })`.
- Report blast radius and risk.
- Warn before proceeding on HIGH/CRITICAL risk.
- Before commit-ready summary: `gitnexus_detect_changes({ scope: "all" })`.
- Explore flows with `gitnexus_query`; inspect symbols with `gitnexus_context`.

Useful resources:
- `gitnexus://repo/household-finance-system/context`
- `gitnexus://repo/household-finance-system/clusters`
- `gitnexus://repo/household-finance-system/processes`
- `gitnexus://repo/household-finance-system/process/{name}`


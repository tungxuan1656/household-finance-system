# AGENTS.md

Personal & Family Expense Management System. Open-source household finance app for income, expenses, budgets, insights, categories, groups, recurring deductions, and family sharing.

## Stack

- Web: `apps/web` — React 19, TypeScript, Next.js App Router, Tailwind CSS, shadcn/ui, sonner, date-fns.
- TMA: `apps/tma` — React, TypeScript, Vite SPA, React Router, TanStack Query, Zustand, Framer Motion. Uses Telegram bridge for native WebView features.
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
| Architecture/layer change | `docs/references/backend/architecture-and-boundaries.md` |
| Frontend work | `docs/FRONTEND.md` → exact `docs/references/frontend/*` needed |
| TMA work | `docs/TMA.md` → exact `docs/references/tma/*` needed |
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
- Before execution, state the planning mode for the task: tiny direct-task note for one-shot mechanical work, explicit inline plan for normal multi-step Level 1 work, ExecPlan for Level 2/3.
- One feature/plan per session. Do not mix scopes.
- Before code edits, run required GitNexus impact checks for touched symbols.
- Use `./init.sh <param>` instead of `pnpm <cmd>` for install/lint/typecheck/test/build.
- Params: `install`, `lint`, `typecheck`, `test`, `build`, `sync`.
- Manual one-file lint/test OK for focused debug.
- Run full `./init.sh` only at final verification.
- Before commit-ready summary, run `gitnexus_detect_changes(scope: "all")`.
- Before any done/ready claim, explicitly apply `verification-before-completion` discipline and report command/result/evidence, or say what was not verified and what risk remains.
- Update harness feature state + `harness/progress.md` before end session.
- Commit only when user explicitly asks.

## Workflow Routing

- Before `writing-plans`, use `grill-with-docs` when terminology, edge cases, or repo-truth behavior still need pressure.
- After an approved plan exists, use `to-issues` when the next problem is vertical slice granularity rather than direction.
- When new work arrives as an issue or report, use `triage` before planning or coding.
- When UX flow or logic shape is still too uncertain, use `prototype` to answer the question with a disposable spike.
- When stopping mid-stream, use `handoff` to update `harness/session-handoff.md`.
- Run `improve-codebase-architecture` periodically on churn-heavy or high-friction hotspots instead of waiting for large refactors.

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

- Install: `./init.sh install`
- Lint: `./init.sh lint`
- Typecheck: `./init.sh typecheck`
- Test: `./init.sh test`
- Build: `./init.sh build`
- Sync GitNexus: `./init.sh sync`
- Final full verify: `./init.sh`

Full `./init.sh`: install, harness, lint, typecheck, test, sync. No build.

## GitNexus

Use GitNexus for unfamiliar/high-risk changes. If index stale, run `./init.sh sync`.

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


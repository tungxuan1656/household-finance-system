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

Read least docs that fully cover the task.

| Task | Read |
|------|------|
| Any session | `AGENTS.md` |
| Architecture/layer change | `docs/references/backend/architecture-and-boundaries.md` |
| Frontend work, surface unclear | `docs/FRONTEND.md` |
| Web work | `docs/WEB.md` → exact `docs/references/frontend/web/*` needed |
| TMA work | `docs/TMA.md` → exact `docs/references/frontend/tma/*` needed |
| Backend work | `docs/BACKEND.md` → exact `docs/references/backend/*` needed |
| Shared type/API naming | `docs/references/shared/type-naming-pattern.md` |
| Product behavior | `docs/product-specs/index.md` → exact shared or surface spec |
| Plan creation/update | Feature plans are inline by default; create `docs/plans/feat-<id>.md` only for substantial active work when actually needed |
| UI durable design decision | `docs/design-docs/index.md` → exact design doc |
| Security-sensitive work | `docs/SECURITY.md` + exact backend/frontend refs |
| Reliability/runtime health | `docs/RELIABILITY.md` |
| Feature state | `feature_index.json`, `features/<feature-id>.md`, `progress.md` |

Do not read broad folders by default. Use indexes to choose exact leaf docs.

## Feature State

- The only harness state is root `feature_index.json`, `features/*.md`, and `progress.md`.
- `feature_index.json` has a top-level `features` array. Each feature entry has exactly these tracking fields: `id`, `title`, `status`, and `depends_on`; `depends_on` is an array of feature IDs.
- Status values are exactly `todo`, `active`, `blocked`, and `done`; at most one feature may be `active`.
- Assess task scale, complexity, and impact with `harness-task` when available.
- Use no feature or progress state for read-only or lightweight work. Create state only for material tracked work.
- Activate a feature only after every feature in its `depends_on` list is `done`.
- Legacy state is Git-only history. Do not maintain an active legacy product feature.
- Feature plans are inline by default. `docs/plans/feat-<id>.md` exists only for substantial active work when actually created; do not archive completed plans.
- The feature `Handoff` section owns recovery. Do not create a separate session-handoff file.
- Append progress only below the template marker, and record material feature state only.
- Product specs retain current/proposed roadmap status labels.

## Session Rules

- Use `using-skills` first when a task skill applies.
- Before execution, state the planning mode: tiny direct-task note for one-shot mechanical work, or an explicit inline plan for normal multi-step work.
- Work on one feature/plan per session. Do not mix scopes.
- Dependencies are installed separately with `pnpm install`; `init.sh` does not install dependencies.
- Use the repository verification commands assigned to the task. Manual one-file lint/test is OK for focused debug.
- Before any done/ready claim, report command, result, and evidence, or state what was not verified and the remaining risk.
- Update the relevant root feature state and progress before ending a session.
- Commit only when explicitly requested.

## Workflow Routing

- When terminology, edge cases, or repo-truth behavior need pressure, use `grill-with-docs` before planning.
- After an approved plan, use `to-issues` when the next problem is vertical-slice granularity rather than direction.
- When new work arrives as an issue or report, use `triage` before planning or coding.
- When UX flow or logic shape is too uncertain, use `prototype` to answer the question with a disposable spike.
- Run `improve-codebase-architecture` periodically on churn-heavy or high-friction hotspots.

## Verification

The full `./init.sh` path runs format, lint, typecheck, tests, and web/TMA builds. Worker build is explicitly skipped. It does not deploy.

## Definition of Done

Done means:

- Implementation/docs complete.
- Required verification passes for the scope.
- Evidence is recorded in the relevant feature Handoff and progress entry.
- The repository restart and verification path remains usable.
- Changes are committed only when explicitly requested.

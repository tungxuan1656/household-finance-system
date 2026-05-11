# AGENTS.md

Personal & Family Expense Management System — Open Source, Long-term Maintenance

This repository supports a small team building a reliable expense management app for income, expenses, statistics, grouping, templates, habits, recurring deductions, categorization, and family group expense sharing.

## Tech Stack

- Frontend (`apps/web`): React 19, TypeScript, Next.js App Router, Tailwind CSS, shadcn UI, sonner, date-fns
- Backend / Edge (`apps/worker`): Cloudflare Workers, Hono, D1, Wrangler, `zod`, `jose`, `ulid`
- Tooling: `pnpm` monorepo, ESLint, Prettier, Vitest, TypeScript

## Quick Start

Before writing or changing code:
1. Always read the `using-skills` skill first to determine which workflow skill applies.
2. Read this file and [ARCHITECTURE.md](ARCHITECTURE.md).
3. Run `./init.sh`.
4. Review `harness/feature_index.json` and the relevant file in `harness/features/`.
5. For plan or product-behavior context, read `docs/PLANS.md` and `docs/product-specs/` as needed.

## Session Rules

- Work on one feature or plan per session. Do not mix scopes.
- Run verification before claiming a feature is done.
- MUST run `pnpm lint:fix` (or lint with `--fix`) from the repo root after writing/changing code. Do NOT use lint-only commands when the goal is to apply fixes.
- Use clear, consistent, maintainable code.
- Commit with a descriptive message.
- Update `harness/progress.md` after each session.
- Update harness feature state before ending a session.
- Leave the repository in a clean, restartable state via the standard startup path.

## Required Artifacts

- `harness/feature_index.json`: feature index and status
- `harness/features/*.json`: per-feature records, dependencies, and evidence
- `harness/progress.md`: newest-first session log with blockers and next steps
- `harness/session-handoff.md`: handoff file for unfinished sessions when needed
- `init.sh`: standard repository initialization and verification script

## Definition of Done

A feature is done only when:
- Implementation is complete and committed.
- All verification steps pass: lint, type-check, tests, build.
- Evidence is recorded in `harness/features/*.json` and reflected in `harness/feature_index.json`.
- Progress is logged in `harness/progress.md`.
- The repository can be restarted cleanly from the standard startup path.

## Commands
`./init.sh` is the default full-workspace verification path. It runs install, harness checks, lint, type-check, tests, and the web build.

## References

Read these before deeper changes:
- `ARCHITECTURE.md`: system map, layer model, dependency rules
- `docs/PLANS.md`: plan lifecycle and execution policy
- `docs/product-specs/`: product behavior and acceptance targets
- `docs/FRONTEND.md`: frontend constraints, accessibility, and design system rules
- `docs/BACKEND.md`: backend API, data, validation, and security rules
- `docs/design-docs/shadcn-first-ui-web-guide.md`: web UI governance
- `docs/design-docs/index.md`, `docs/QUALITY_SCORE.md`, `docs/RELIABILITY.md`, `docs/SECURITY.md`: supporting operational guidance

---

## GitNexus

Use GitNexus for unfamiliar or high-risk code changes. If the index is stale, run `./scripts/sync_gitnexus.sh` (not `npx gitnexus analyze`) first.

Required:
- Before editing any function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius and risk.
- Warn the user before proceeding if impact analysis returns HIGH or CRITICAL risk.
- Before committing, run `gitnexus_detect_changes()`.
- Use `gitnexus_query({query: "concept"})` to explore execution flows, and `gitnexus_context({name: "symbolName"})` when you need full symbol context.

Reference:
- `gitnexus://repo/household-finance-system/context` for codebase overview and index freshness.
- `gitnexus://repo/household-finance-system/clusters` for functional areas.
- `gitnexus://repo/household-finance-system/processes` for execution flows.
- `gitnexus://repo/household-finance-system/process/{name}` for a step-by-step trace.
- `.agents/skills/gitnexus/gitnexus-exploring/SKILL.md` for architecture questions.
- `.agents/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` for blast-radius checks.
- `.agents/skills/gitnexus/gitnexus-debugging/SKILL.md` for bug tracing.
- `.agents/skills/gitnexus/gitnexus-refactoring/SKILL.md` for rename/extract/split work.
- `.agents/skills/gitnexus/gitnexus-guide/SKILL.md` for tool and schema reference.
- `.agents/skills/gitnexus/gitnexus-cli/SKILL.md` for index/status/clean/wiki commands.


# AGENTS.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge these baseline rules with project-specific instructions as needed.

**Tradeoff:** these guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them instead of picking silently.
- If a simpler approach exists, say so.
- If something is unclear, stop and name the confusion.

## 2. Simplicity First

**Use the minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No flexibility or configurability that was not requested.
- No error handling for impossible scenarios.
- If 200 lines can be 50, rewrite it.

Ask: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Do not improve adjacent code, comments, or formatting.
- Do not refactor unrelated code.
- Match existing style, even if you would choose differently.
- If you notice unrelated dead code, mention it instead of deleting it.

When your changes create orphans:
- Remove imports, variables, or functions made unused by your changes.
- Do not remove pre-existing dead code unless asked.

The test: every changed line should trace directly to the request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Translate vague requests into checks you can prove:
- "Add validation" -> write tests for invalid inputs, then make them pass.
- "Fix the bug" -> reproduce it with a test, then make it pass.
- "Refactor X" -> ensure behavior is unchanged before and after.

For multi-step work, state a brief plan:

```text
1. [Step] -> verify: [check]
2. [Step] -> verify: [check]
3. [Step] -> verify: [check]
```

Strong success criteria reduce unnecessary clarification loops.

---

**These guidelines are working if:** diffs stay focused, overbuilt solutions decrease, and clarification happens before implementation instead of after mistakes.

---

# PRODUCT

Personal & Family Expense Management System — Open Source, Long-term Maintenance

This repository supports a small team building a reliable expense management app for income, expenses, statistics, grouping, templates, habits, recurring deductions, categorization, and family group expense sharing.

## Tech Stack

- Frontend (`apps/web`): React 19, TypeScript, Next.js App Router, Tailwind CSS, shadcn UI, sonner, date-fns
- Backend / Edge (`apps/worker`): Cloudflare Workers, Hono, D1, Wrangler, `zod`, `jose`, `ulid`
- Tooling: `pnpm` monorepo, ESLint, Prettier, Vitest, TypeScript

## Quick Start

Before writing or changing code:
1. Read this file and [ARCHITECTURE.md](ARCHITECTURE.md).
2. Run `./init.sh`.
3. Review `harness/feature_index.json` and the relevant file in `harness/features/`.
4. For plan or product-behavior context, read `docs/PLANS.md` and `docs/product-specs/` as needed.

## Session Rules

- Work on one feature or plan per session. Do not mix scopes.
- Run verification before claiming a feature is done.
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

```bash
# Full workspace initialization and verification
./init.sh

# Frontend dev
pnpm dev:web

# Worker dev
pnpm dev:worker

# Frontend build
pnpm build:web

# Worker deploy
pnpm deploy:worker
```

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

## Frontend Requirements

All frontend work in `apps/web` must follow `docs/FRONTEND.md` and the shadcn-first UI guide.

Component decomposition is mandatory:
1. Keep `views/*` pages as orchestrators for route, store, query, and top-level flow.
2. Put feature-bounded smart components in `apps/web/src/components/<feature>/`.
3. Put cross-feature reusable components in `apps/web/src/components/shared/`.
4. Split early when a component grows large or mixes concerns.
5. Keep abstractions pragmatic and concrete.

Before any UI task in `apps/web`, read:
1. `.agents/skills/shadcn/SKILL.md`
2. `.agents/skills/shadcn/rules/styling.md`
3. `.agents/skills/shadcn/rules/forms.md`
4. `.agents/skills/shadcn/rules/composition.md`

Skipping this pre-read is non-compliant.

---

Always consult GitNexus before major code changes. Use it to understand architecture, dependencies, and impact, then design and apply the code edits.

---

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **household-finance-system** (4896 symbols, 7335 relationships, 143 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/household-finance-system/context` | Codebase overview, check index freshness |
| `gitnexus://repo/household-finance-system/clusters` | All functional areas |
| `gitnexus://repo/household-finance-system/processes` | All execution flows |
| `gitnexus://repo/household-finance-system/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.agents/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.agents/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.agents/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.agents/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.agents/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.agents/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->

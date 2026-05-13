# Docs clean architecture and minimal reading

## Title

Docs clean architecture and minimal reading

## Purpose / Big Picture

Make repo docs easier for AI agents to navigate. Agents should read minimum docs needed for a task, then act with enough context. Docs should use parent-to-child routing, no duplicate rule sources, and caveman-style terse prose.

Observable result: `AGENTS.md` gives one reading tree; top-level docs route by task; leaf reference docs hold exact rules.

## Scope

In scope:
- Root routers: `AGENTS.md`, `ARCHITECTURE.md`
- Task routers: `docs/FRONTEND.md`, `docs/BACKEND.md`, `docs/PLANS.md`
- Indexes: `docs/references/index.md`, `docs/product-specs/index.md`, `docs/design-docs/index.md`, `docs/exec-plans/index.md`
- Cross-cutting docs: `docs/RELIABILITY.md`, `docs/SECURITY.md`, `docs/PRODUCT_SENSE.md`
- Stale frontend references: `docs/references/frontend/project-folder-structure.md`, `docs/references/frontend/component-structure-pattern.md`
- Harness: `harness/feature_index.json`, `harness/features/feat-054.json`, `harness/progress.md`

Out of scope:
- No product behavior change.
- No app or worker code change.
- No wholesale rewrite of completed ExecPlans.
- No deletion of historical docs unless broken/stale reference blocks current routing.

## Non-negotiable Requirements

- `AGENTS.md` stays router, not encyclopedia.
- Parent docs reference child docs. Child docs do not need parent backrefs.
- One canonical home per rule area.
- Index docs route; they do not repeat rule bodies.
- Broken link `docs/design-docs/shadcn-first-ui-web-guide.md` removed or replaced.
- Prose uses caveman-lite/full style: short, imperative, no filler.

## Progress

- [x] Read current root docs, task docs, indexes, harness state.
- [x] Map duplicate docs and broken references.
- [x] Rewrite core docs and indexes.
- [x] Update stale frontend references.
- [x] Update harness artifacts.
- [x] Run verification.

## Surprises & Discoveries

- `docs/FRONTEND.md` references missing `docs/design-docs/shadcn-first-ui-web-guide.md`.
- `docs/references/frontend/project-folder-structure.md` still describes old SPA/Vite-style folders, not current Next.js App Router shape.
- `docs/references/frontend/responsive-navigation-shell-pattern.md` exists but is missing from `docs/references/index.md`.

## Decision Log

- Decision: Use clean-doc architecture, not full doc compression.
  Rationale: User wants consistency and minimal reading; full rewrite of history risks losing nuance.
  Date/Author: 2026-05-13 / Orchestrator
- Decision: Keep completed ExecPlans historical even when they reference old docs.
  Rationale: They are execution history, not current routing rules.
  Date/Author: 2026-05-13 / Orchestrator

## Outcomes & Retrospective

- Root and task docs now route by task instead of duplicating leaf rules.
- Reference/product/design indexes now act as maps.
- Frontend folder/component references now match `apps/web/src` and Next.js App Router.
- Broken active references to the removed shadcn-first design doc were replaced with `docs/design-docs/shadcn-card-composition-architecture-guide.md`.
- Verification passed: `pnpm lint:fix`, JSON validation, `./init.sh`, and GitNexus change detection.
- GitNexus reported docs-only low risk: 29 changed files, 116 changed symbols, 0 affected processes.

## Context and Orientation

- `AGENTS.md`: root agent router and session contract.
- `ARCHITECTURE.md`: system map and layer rules.
- `docs/FRONTEND.md`, `docs/BACKEND.md`, `docs/PLANS.md`: task routers.
- `docs/references/*`: leaf standards.
- `docs/product-specs/*`: user-visible behavior specs.
- `docs/design-docs/*`: durable design decisions.
- `harness/*`: session evidence and feature state.

## Plan of Work (Narrative)

1. Rewrite `AGENTS.md` around the reading tree and required session rules.
2. Tighten `ARCHITECTURE.md` as system map only.
3. Rewrite frontend/backend/plan docs as routers with minimal rules and child links.
4. Rewrite reference/product/design indexes as maps only.
5. Fix stale frontend folder/component references to current Next.js structure.
6. Update harness feature state and progress log.
7. Run formatting/lint and full verification where feasible.

## Concrete Steps (Commands)

Run from repo root:

```bash
pnpm lint:fix
python3 -m json.tool harness/feature_index.json >/tmp/feature_index.json
python3 -m json.tool harness/features/feat-054.json >/tmp/feat-054.json
./init.sh
```

Expected:
- `pnpm lint:fix` exits `0` or reports only pre-existing warnings.
- JSON commands exit `0`.
- `./init.sh` exits `0`.

## Validation and Acceptance

- `AGENTS.md` contains task-driven reading tree.
- `docs/FRONTEND.md` no longer references missing shadcn-first design doc.
- `docs/references/index.md` lists current frontend/backend/shared references.
- `docs/product-specs/index.md` stays behavior index, not implementation guide.
- `docs/design-docs/index.md` lists active durable design docs.
- `harness/features/feat-054.json` records evidence.

## Idempotence & Recovery

Docs-only edits. Safe to re-run lint, JSON validation, and `./init.sh`. Recovery: revert changed Markdown/JSON files from git if needed.

## Artifacts and Notes

- Evidence goes to `harness/features/feat-054.json` and `harness/progress.md`.
- GitNexus change detection runs before final summary.

## Interfaces & Dependencies

- No runtime dependency changes.
- Documentation depends on current repo structure and harness contract.

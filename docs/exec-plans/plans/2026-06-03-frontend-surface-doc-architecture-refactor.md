# Frontend Surface Docs Architecture Refactor

## Purpose / Big Picture

Refactor the docs tree so frontend guidance scales cleanly across multiple client surfaces instead of treating `web` as the only frontend. After this lands, contributors will enter frontend work through `docs/FRONTEND.md`, then route explicitly into `docs/WEB.md`, `docs/TMA.md`, or the future `docs/MOBILE_APP.md`, while shared product rules stay separate from surface-specific behavior. The user-visible outcome for contributors is simpler, less ambiguous reading paths and fewer mixed-surface specs.

## Scope

- Change top-level frontend doc routers: `docs/FRONTEND.md`, `docs/WEB.md`, `docs/TMA.md`, `docs/MOBILE_APP.md`.
- Restructure product specs under `docs/product-specs/shared/`, `docs/product-specs/web/`, `docs/product-specs/tma/`, and `docs/product-specs/mobile-app/`.
- Restructure frontend references under `docs/references/frontend/web/`, `docs/references/frontend/tma/`, and `docs/references/frontend/mobile-app/`.
- Restructure design docs under `docs/design-docs/shared/` and `docs/design-docs/frontend/{web,tma,mobile-app}/`.
- Update active router/index docs and current repo guidance files that depend on the moved paths: `AGENTS.md`, `CLAUDE.md`, `README.md`, `ARCHITECTURE.md`, `docs/references/index.md`, `docs/product-specs/index.md`, `docs/design-docs/index.md`, project-owned TMA skill docs, and active TMA docs/harness records.
- Update harness artifacts for this refactor.

Out of scope:

- Runtime code changes in `apps/web`, `apps/tma`, or `apps/worker`.
- Rewriting completed historical ExecPlans just to modernize path references inside old narrative text.
- Inventing detailed mobile-app product rules beyond stub routers/indexes.

## Non-negotiable Requirements

- The refactor must leave one clear home for shared product truth and separate homes for surface-specific behavior.
- `docs/FRONTEND.md` must become a parent router, not a synonym for `web`.
- TMA-specific behavior must not live inside web-only specs after the refactor.
- Product rules, reference rules, and design decisions must keep their current separation of concerns.

## Progress

- [x] 2026-06-03 Create plan + harness records for the refactor.
- [x] 2026-06-03 Move product-spec, reference, and design-doc files into the new surface-aware tree.
- [x] 2026-06-03 Rewrite router/index docs and current cross-links to the new paths.
- [x] 2026-06-03 Update harness/progress, run docs-only verification, and finalize the plan/index state.

## Surprises & Discoveries

- The old flat `docs/product-specs/` tree hid two different kinds of truth: shared domain semantics and surface-only UX flow. The split clarified most ambiguities immediately.
- Existing frontend reference leaves were more web-first than cross-surface. Instead of inventing a premature `frontend/shared` rule branch, the refactor kept them under `frontend/web` and left TMA with its own dedicated rule branch.

## Decision Log

- Decision: Keep `docs/FRONTEND.md` as the parent router for all client surfaces.
  Rationale: the repo will likely gain more than one frontend surface, so `FRONTEND` should mean the whole client layer, not only `web`.
  Date/Author: 2026-06-03 / Codex

- Decision: Split product specs into `shared`, `web`, `tma`, and `mobile-app` subtrees.
  Rationale: current ambiguity lives mostly in `product-specs`, where shared domain truth and surface UX are mixed together.
  Date/Author: 2026-06-03 / Codex

- Decision: Keep current generic frontend implementation leaves under `docs/references/frontend/web/` instead of inventing a new shared implementation branch.
  Rationale: the existing leaves are still materially web-first (`apps/web`, shadcn, Next.js, responsive shell). TMA already has its own dedicated implementation branch and should not inherit web rules by accident.
  Date/Author: 2026-06-03 / Codex

## Outcomes & Retrospective

- `docs/FRONTEND.md` is now the parent router for client surfaces.
- `docs/WEB.md`, `docs/TMA.md`, and `docs/MOBILE_APP.md` now express clearer surface ownership.
- Product specs now separate shared domain truth from web-only and TMA-only UX.
- Frontend references and design docs now reflect the same surface split.
- Active repo guidance and the TMA skill now point to the new tree, so future sessions can start from the new structure directly.

## Context and Orientation

- Parent frontend router today: `docs/FRONTEND.md`
- TMA router today: `docs/TMA.md`
- Product spec index today: `docs/product-specs/index.md`
- Reference index today: `docs/references/index.md`
- Design-doc index today: `docs/design-docs/index.md`
- Repo-specific TMA skill routing: `.agents/skills/tma-development/**`

## Plan of Work (Narrative)

First, create the new directory structure and move existing docs into the new canonical homes. Shared domain specs will move under `docs/product-specs/shared/`; web-only and TMA-only specs will move into `docs/product-specs/web/` and `docs/product-specs/tma/`; and a stub `docs/product-specs/mobile-app/index.md` will mark the future surface. Existing `docs/references/frontend/*` leaves will move under `docs/references/frontend/web/`, and existing `docs/references/tma/*` leaves will move under `docs/references/frontend/tma/`. Existing durable design docs will move into `docs/design-docs/shared/` or `docs/design-docs/frontend/{web,tma}/`.

Second, rewrite the router docs to match the new tree. `docs/FRONTEND.md` will become the parent frontend router. The current web-specific guidance from `docs/FRONTEND.md` will move into `docs/WEB.md`. `docs/TMA.md` will stay as a child router but point to the new `docs/references/frontend/tma/*` and `docs/product-specs/tma/*` paths. `docs/MOBILE_APP.md` will be a truthful stub that explains the surface does not exist yet.

Third, rewrite the current, actively used indexes and repo guidance to the new paths. This includes `AGENTS.md`, `CLAUDE.md`, `README.md`, `ARCHITECTURE.md`, and the doc indexes. Update the repo-owned TMA skill references and active TMA planning/harness docs so current sessions do not keep reading old paths.

Fourth, run docs-only verification, record evidence in harness artifacts, and move the plan entry from Active to Completed in `docs/exec-plans/index.md` if the refactor finishes in this session.

## Concrete Steps (Commands)

Run from repo root:

```bash
# inspect current references before moving
rg -n "docs/FRONTEND\.md|docs/TMA\.md|docs/references/frontend/|docs/references/tma/|docs/product-specs/" -S .

# create/move docs into the new tree
mkdir -p docs/product-specs/{shared,web,tma,mobile-app} docs/references/frontend/{web,tma,mobile-app} docs/design-docs/{shared,frontend/web,frontend/tma,frontend/mobile-app}

# verify docs-only artifact hygiene
./scripts/check_harness_size.sh
git diff --check

# final docs-focused blast radius
python3 -m json.tool harness/feature_index.json >/dev/null
python3 -m json.tool harness/features/feat-089.json >/dev/null
gitnexus_detect_changes(scope: 'all')
```

Expected outputs:

- `Harness size checks passed`
- no output from `git diff --check`
- JSON parse commands exit cleanly
- GitNexus returns `LOW` or otherwise explainable docs-only risk with no affected runtime processes

## Validation and Acceptance

- `docs/FRONTEND.md` clearly routes to `WEB.md`, `TMA.md`, and `MOBILE_APP.md`.
- `docs/WEB.md` contains the old web-only guidance that previously lived in `docs/FRONTEND.md`.
- `docs/TMA.md` routes only to TMA-specific product/reference docs.
- `docs/product-specs/index.md` clearly separates shared vs web vs tma vs mobile-app product rules.
- `docs/references/index.md` clearly separates frontend web vs frontend tma vs frontend mobile-app rules.
- `docs/design-docs/index.md` clearly separates shared decisions from frontend/web and frontend/tma decisions.
- Current repo guidance files no longer instruct readers to open old paths that no longer exist.

## Idempotence & Recovery

- Directory creation and file moves are safe to re-run if guarded by current existence checks.
- This is a docs-only refactor; rollback is a normal git revert if needed.
- No runtime data or migrations are involved.

## Artifacts and Notes

- Harness updates required: `harness/feature_index.json`, `harness/features/feat-089.json`, `harness/progress.md`.
- Plan index update required: `docs/exec-plans/index.md`.

## Interfaces & Dependencies

- Depends on current doc routers: `AGENTS.md`, `docs/FRONTEND.md`, `docs/TMA.md`, `docs/product-specs/index.md`, `docs/references/index.md`, `docs/design-docs/index.md`.
- Depends on repo-owned TMA skill routing: `.agents/skills/tma-development/SKILL.md` and `.agents/skills/tma-development/references/task-map.md`.
- Depends on harness records for the active TMA rollout features (`feat-078` through `feat-088`) because those records mention current docs paths.

# Refactor apps/web to feature-first folder architecture

## Purpose / Big Picture

Move `apps/web/src` from the current mixed layer-first structure into a feature-first structure so each web domain has one obvious filesystem home. Users should not see product behavior changes; the visible result is safer long-term maintenance, clearer route ownership, and documentation that matches the real code layout.

## Scope

- In scope:
  - `apps/web/src/app/**` route files that currently import from `views/`
  - `apps/web/src/views/**` migration into `apps/web/src/features/**`
  - domain-local folders under `apps/web/src/components/*` that should become feature-local
  - domain-local web `api`, `hooks`, `types`, `stores`, and `utils` that belong inside one feature
  - frontend canonical docs that currently describe `views/` and `components/<feature>` as the main structure
  - harness artifacts for this refactor session
- Out of scope:
  - backend contracts, worker routes, database changes, or URL changes
  - visual redesign of existing screens
  - broad rewrites of stable shared primitives in `apps/web/src/components/ui`
  - moving truly shared app-shell code into features when ownership is still cross-feature

## Non-negotiable Requirements

- The plan is self-contained and executable by a fresh agent.
- Route files under `apps/web/src/app/**` stay thin and continue to satisfy Next.js App Router placement rules.
- `apps/web/src/views` is removed by the end of the refactor.
- Shared code is promoted only when reuse is real; otherwise default to feature-local placement.
- All touched docs must be updated so the new folder rules become canonical.
- Verification must use `./init.sh <param>` commands from repo root, with full `./init.sh` only at final verification.

## Progress

- [x] 2026-05-19 Draft durable design doc in `docs/design-docs/2026-05-19-web-feature-first-folder-architecture-design.md` and get user approval.
- [ ] Create feature record and activate plan index entry for the refactor.
- [ ] Map current `apps/web/src` code into target `features/<domain>` ownership buckets.
- [ ] Run required pre-edit GitNexus impact checks for touched page/view symbols before code edits.
- [ ] Create base `apps/web/src/features/**` structure and migrate low-risk proof features (`more`, `onboarding`).
- [ ] Migrate overlap-heavy features (`settings`, `insights`, `overview`) and normalize their naming.
- [ ] Migrate remaining route domains (`budgets`, `groups`, `households`, `expenses`, `auth`, `invitations`).
- [ ] Remove `apps/web/src/views` and clean dead barrels/import bridges.
- [ ] Update canonical frontend docs and any touched design/plan references that still mention the old structure.
- [ ] Update harness artifacts and run final verification.

## Surprises & Discoveries

- Current docs still canonize `views/` as route-level orchestration even though real ownership already overlaps with `components/home`, `components/profile`, and `components/analytics`.
- Current naming drift is structural, not cosmetic: `/home` imports `overview`, `/settings` imports `profile-settings`, and `/insights` still relies on `components/analytics` naming.

## Decision Log

- Decision: Use `features/<domain>` as the canonical home for domain-local web code.
  Rationale: The repo now has stable business domains and the current `views/` split adds ambiguity without adding a durable boundary.
  Date/Author: 2026-05-19 / Orchestrator + User

- Decision: Keep `apps/web/src/app/**` route files in place and make them thin import bridges.
  Rationale: Next.js App Router requires route files at exact filesystem paths; feature-first cannot replace `app/`.
  Date/Author: 2026-05-19 / Orchestrator

- Decision: Canonical feature names are `overview`, `settings`, and `insights` for the currently inconsistent domains.
  Rationale: Avoid mixed code ownership names while preserving current user-facing route segments `/home`, `/settings`, and `/insights`.
  Date/Author: 2026-05-19 / Orchestrator + oracle review

## Outcomes & Retrospective

- Target outcome: `apps/web/src/views` removed, route files import from `apps/web/src/features/**`, docs match the new structure, and final verification passes.
- Retrospective to fill after implementation: note which domains still intentionally remain shared-root owned and why.

## Context and Orientation

- Current route tree: `apps/web/src/app/**`
- Current page orchestration layer to remove: `apps/web/src/views/**`
- Current mixed domain component roots: `apps/web/src/components/home`, `apps/web/src/components/profile`, `apps/web/src/components/analytics`, `apps/web/src/components/expense`, `apps/web/src/components/budget`, `apps/web/src/components/group`, `apps/web/src/components/household`, `apps/web/src/components/auth`, `apps/web/src/components/landing`
- Canonical frontend router doc: `docs/FRONTEND.md`
- Canonical folder placement doc: `docs/references/frontend/web/project-folder-structure.md`
- Canonical component boundary docs: `docs/references/frontend/web/component-structure-pattern.md`, `docs/references/frontend/web/frontend-component-architecture-guide.md`, `docs/references/frontend/web/naming-and-conventions-pattern.md`
- Approved design doc for this change: `docs/design-docs/2026-05-19-web-feature-first-folder-architecture-design.md`
- Harness records to update: `harness/feature_index.json`, `harness/features/feat-062.json`, `harness/progress.md`

## Scope Map

### Expected file areas to change

- `apps/web/src/app/(protected)/**/page.tsx`
- `apps/web/src/app/(public)/**/page.tsx`
- `apps/web/src/app/invitations/[token]/page.tsx`
- `apps/web/src/views/**`
- selected domain-local roots under `apps/web/src/components/**`
- selected domain-local roots under `apps/web/src/api/**`, `apps/web/src/hooks/**`, `apps/web/src/types/**`, `apps/web/src/stores/**`, `apps/web/src/utils/**` when ownership is clearly one feature
- `docs/FRONTEND.md`
- `docs/references/frontend/web/project-folder-structure.md`
- `docs/references/frontend/web/component-structure-pattern.md`
- `docs/references/frontend/web/frontend-component-architecture-guide.md`
- `docs/references/frontend/web/naming-and-conventions-pattern.md`
- `docs/design-docs/index.md` if the design status changes
- harness files listed above

### Layer impact

`Types -> Config -> Repo -> Service -> Runtime -> UI`

This refactor is primarily **UI + runtime-organization** scope. It must not introduce lower-layer dependency inversions:

- UI must keep consuming existing API/runtime contracts rather than bypassing them.
- No feature folder may import upward into route files.
- Shared runtime helpers remain below UI and must not start depending on feature UI modules.

### Dependency justification

- No new external dependency is allowed for this refactor.
- New internal folder boundaries are allowed only to clarify ownership and reduce cross-folder drift.

## Standards and Reference Constraints

Required references for implementation:

- `docs/references/frontend/web/project-folder-structure.md`
  - Update canonical structure from `views/` + `components/<feature>` to `features/<domain>` + shared root folders.
- `docs/references/frontend/web/component-structure-pattern.md`
  - Replace `views/` wording with feature page orchestration wording while keeping route files thin.
- `docs/references/frontend/web/frontend-component-architecture-guide.md`
  - Update import direction to `app route/page -> features/<domain>/pages -> features/<domain>/components -> components/shared -> components/ui`.
- `docs/references/frontend/web/naming-and-conventions-pattern.md`
  - Keep `kebab-case`, named exports, and consistent canonical names in touched files.
- `docs/testing/test-placement-and-sharding-convention.md`
  - Preserve the no component/page render test rule for `apps/web`.

Companion skills during implementation:

- `test-driven-development` before refactor edits that risk behavior drift.
- `subagent-driven-development` as the default execution mode after plan handoff.
- `requesting-code-review` after the major migration batches.
- `verification-before-completion` before any completion claim.
- `typescript-reviewer` for the final TypeScript/JavaScript code review.

## Plan of Work (Narrative)

1. **Activate harness records and plan tracking.** Add `feat-062` for the web feature-first folder refactor, record the plan in `docs/exec-plans/index.md`, and log the planning session in `harness/progress.md`.

2. **Map current ownership before moving files.** Inventory every route entry under `apps/web/src/app/**` and map it to a target feature folder, then inventory `views/**` and each domain-local `components/<domain>` folder to decide which files move to `features/<domain>/pages`, `features/<domain>/components`, `features/<domain>/api`, `features/<domain>/hooks`, and which roots stay shared.

3. **Run pre-edit GitNexus impact checks.** For each route-level page/view symbol that will move or be renamed, run upstream impact checks and note blast radius before touching code. If any symbol returns HIGH/CRITICAL risk, stop and note the risk before continuing.

4. **Create `apps/web/src/features/**` foundation and migrate proof domains.** Start with `more` and `onboarding` to establish path patterns, update route imports, and prove the thin-route + feature-page structure without high churn.

5. **Migrate overlap-heavy domains with naming normalization.** Move `profile-settings` plus `components/profile/*` into `features/settings/**`; move `views/app/insights*` plus `components/analytics/*` into `features/insights/**`; move `views/app/overview*` plus `components/home/*` into `features/overview/**`. During each move, rename files/folders only where needed to lock canonical names.

6. **Migrate the remaining feature domains.** Move `budgets`, `groups`, `households`, `expenses`, `auth`, and `invitations` into `features/**`, colocating domain-local page orchestrators, smart components, and feature-local hooks/helpers while leaving clearly shared app-wide modules at the root.

7. **Remove `apps/web/src/views` and clean import surfaces.** Delete the old `views` tree only after all route imports and internal references point at `features/**`. Remove obsolete barrels or compatibility bridges.

8. **Update canonical docs to match reality.** Rewrite frontend folder placement docs and component architecture docs so future work follows the new feature-first structure. If design status changes from proposed to accepted during completion, update `docs/design-docs/index.md` accordingly.

9. **Finish harness + verification.** Update `feat-062`, refresh `harness/progress.md`, run focused checks during migration, then full `./init.sh`, and finally run `gitnexus_detect_changes(scope: all)` before the completion summary.

## Concrete Steps (Commands)

Run from repo root unless stated otherwise.

```bash
# sync GitNexus index before impact checks if needed
./init.sh sync

# focused lint after a migration batch
./init.sh lint

# focused typecheck after a migration batch
./init.sh typecheck

# final full verification
./init.sh
```

Expected short outputs:

- `./init.sh sync` -> `OK`
- `./init.sh lint` -> `OK`
- `./init.sh typecheck` -> `OK`
- `./init.sh` -> `Done!`

Supplemental evidence commands when needed:

```bash
# validate harness JSON records after edits
python3 -m json.tool harness/feature_index.json >/dev/null
python3 -m json.tool harness/features/feat-062.json >/dev/null
```

Expected output: silent success / exit code `0`.

## Validation and Acceptance

### Happy path

- Every `apps/web/src/app/**/page.tsx` continues to resolve and imports from `@/features/**` instead of `@/views/**`.
- `apps/web/src/views` no longer exists.
- Shared roots contain only truly shared concerns (`components/ui`, `components/shared`, shared global stores/hooks/api/helpers).
- Existing screens still build and typecheck without route breakage.

### Regression checks

- `home`, `settings`, `insights`, `expenses`, `groups`, `households`, `budgets`, `onboarding`, `more`, `auth`, and invitation routes still compile after imports move.
- Any moved pure helper/store/API tests still pass at their new paths or with updated imports.
- No new component/page render tests are introduced for `apps/web`.

### Documentation checks

- `docs/FRONTEND.md` points to the updated canonical folder structure guidance.
- Frontend reference docs no longer describe `views/` as the canonical route orchestration layer.
- Design docs and plan index entries reference the active refactor correctly.

### Acceptance artifacts

- `docs/design-docs/2026-05-19-web-feature-first-folder-architecture-design.md`
- `docs/exec-plans/plans/2026-05-19-web-feature-first-folder-refactor.md`
- updated frontend reference docs
- `gitnexus_detect_changes(scope: all)` output recorded in the final summary
- final `./init.sh` transcript ending with `Done!`

## Idempotence & Recovery

- File moves and doc edits are safe to re-run as long as paths are re-checked before each patch batch.
- Prefer incremental migration commits/patches by feature so a partial failure can be recovered by restoring one feature tree instead of the whole `apps/web` structure.
- If a migration batch creates import breakage, revert only the affected feature subtree and route imports before continuing.
- No destructive data operations are involved.

## Artifacts and Notes

- Design doc already approved by user: `docs/design-docs/2026-05-19-web-feature-first-folder-architecture-design.md`
- Oracle review already recommended full `views/` removal, phased migration, and canonical naming normalization.
- Final completion must mention which root-level folders intentionally remain shared and why.

## Interfaces & Dependencies

- Next.js App Router: `apps/web/src/app/**` route/layout filesystem contract must remain intact.
- Shared UI primitives: `apps/web/src/components/ui/**` remain shadcn-first and domain-free.
- Shared app state: root `stores/**` stays available for global state such as auth/session or other cross-feature state.
- Existing web API clients and contracts must keep their current runtime behavior; this plan changes placement/ownership, not request semantics.

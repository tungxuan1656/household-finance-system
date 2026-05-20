# Remove frontend compatibility shims after feat-062

## Purpose / Big Picture

Finish the frontend feature-first migration by removing the temporary compatibility shims left behind after feat-062. Users should not see any product behavior changes; the visible outcome is cleaner ownership, one canonical import path per module, and lower maintenance cost because old root re-export files no longer exist.

## Scope

- In scope:
  - `apps/web/src/components/expense/**` legacy shim tree
  - `apps/web/src/components/budget/**` legacy shim tree
  - `apps/web/src/components/household/**` legacy shim tree
  - `apps/web/src/api/household.ts`
  - `apps/web/src/types/household.ts`
  - `apps/web/src/types/budget.ts`
  - `apps/web/src/lib/forms/household.schema.ts`
  - `apps/web/src/utils/household/labels.ts`
  - `apps/web/src/hooks/api/use-budgets.ts`
  - `apps/web/src/hooks/api/use-households.ts`
  - `apps/web/src/hooks/api/use-analytics.ts`
  - any in-tree consumers still importing from those legacy paths
  - budget field ownership normalization where feature files still point back to old component paths
  - harness/doc updates that record the cleanup and any canonical placement changes
- Out of scope:
  - backend routes/contracts/database
  - URL or navigation changes
  - removing truly shared root infrastructure (`api/client.ts`, `api/endpoints.ts`, `api/reference-data.ts`, `hooks/api/use-reference-data.ts`, `hooks/api/use-profile.ts`, `types/api.ts`, `types/profile.ts`, `types/reference-data.ts`)
  - broader visual or UX redesign

## Non-negotiable Requirements

- The cleanup must preserve all current frontend behavior.
- Every deleted shim path must have zero remaining in-tree consumers first.
- Budget field implementations must be canonical under `apps/web/src/features/budgets/components/fields/*` before old root budget field files are removed.
- Shared root modules must remain only when they are truly shared after the cleanup.
- Verification must use `./init.sh <param>` commands from repo root; full `./init.sh` only at final verification.

## Progress

- [x] 2026-05-20 User approved cleanup design for shim removal and ownership normalization.
- [ ] Add plan index entry and feature tracking for feat-063.
- [ ] Run pre-edit GitNexus impact checks for key shim-owned entrypoints and seam hooks.
- [ ] Batch 1: rewrite any remaining expense consumers to `@/features/expenses/**`, then delete `apps/web/src/components/expense/**`.
- [ ] Batch 2: normalize budget field ownership under `features/budgets/components/fields/*`, rewrite any remaining consumers, then delete `apps/web/src/components/budget/**` and `apps/web/src/types/budget.ts`.
- [ ] Batch 3: rewrite household/store/onboarding/test consumers to canonical feature-first paths, then delete household and hook/type shims.
- [ ] Remove now-empty legacy directories when practical and verify zero stale imports remain.
- [ ] Update harness records and progress log.
- [ ] Run final verification and final GitNexus change detection.

## Surprises & Discoveries

- Feat-062 removed `views/` and made route files thin, but intentionally left shim layers for compatibility.
- Expense and budget top-level shim trees now have little or no in-tree value; they mostly preserve duplicate import surfaces.
- Household and hook/type shims still have real consumers in stores, onboarding, overview, and household summary paths.
- Budget field ownership is still partially inverted: feature files point back to old `components/budget/fields/*` implementations.

## Decision Log

- Decision: remove compatibility shims instead of keeping them as long-lived aliases.
  Rationale: feat-063 exists to complete feature-first ownership, reduce maintenance overhead, and enforce one canonical import path per module.
  Date/Author: 2026-05-20 / Orchestrator + User

- Decision: execute in three ordered batches (expense, budgets, household/hooks/types).
  Rationale: expense shims look safest, budgets need ownership normalization first, and household/root shims still have multiple consumer types (store/test/onboarding).
  Date/Author: 2026-05-20 / Orchestrator

- Decision: keep truly shared root infrastructure in place.
  Rationale: the cleanup targets migration scaffolding, not valid cross-feature modules.
  Date/Author: 2026-05-20 / Orchestrator

## Outcomes & Retrospective

- Target outcome: legacy compatibility shims removed, canonical feature-first import paths used everywhere in-tree, and final verification passing.
- Retrospective to fill after implementation: note any shared-root modules that were reconsidered but intentionally retained.

## Context and Orientation

- Approved design: `docs/design-docs/2026-05-20-web-shim-cleanup-and-ownership-normalization-design.md`
- Completed parent refactor: `docs/exec-plans/plans/2026-05-19-web-feature-first-folder-refactor.md`
- Canonical folder rules: `docs/references/frontend/project-folder-structure.md`
- Canonical component/page split: `docs/references/frontend/component-structure-pattern.md`
- Canonical naming/import rules: `docs/references/frontend/naming-and-conventions-pattern.md`
- API/hook ownership rules: `docs/references/frontend/api-react-query-pattern.md`
- Store ownership rules: `docs/references/frontend/zustand-store-pattern.md`
- Current feature record: `harness/features/feat-063.json`
- Progress log: `harness/progress.md`

## Scope Map

### Expected file areas to change

- `apps/web/src/components/expense/**`
- `apps/web/src/components/budget/**`
- `apps/web/src/components/household/**`
- `apps/web/src/features/expenses/**` consumers and possibly local barrels
- `apps/web/src/features/budgets/**` field/component ownership paths
- `apps/web/src/features/households/**` public paths and dependent consumers
- `apps/web/src/features/onboarding/**`
- `apps/web/src/features/overview/**`
- `apps/web/src/stores/household.store.ts`
- `apps/web/src/stores/household.store.test.ts`
- `apps/web/src/api/household.ts`
- `apps/web/src/types/household.ts`
- `apps/web/src/types/budget.ts`
- `apps/web/src/lib/forms/household.schema.ts`
- `apps/web/src/utils/household/labels.ts`
- `apps/web/src/hooks/api/use-budgets.ts`
- `apps/web/src/hooks/api/use-households.ts`
- `apps/web/src/hooks/api/use-analytics.ts`
- `docs/exec-plans/index.md`
- `harness/feature_index.json`
- `harness/features/feat-063.json`
- `harness/progress.md`

### Layer impact

`Types -> Config -> Repo -> Service -> Runtime -> UI`

This cleanup is mainly **UI/runtime-organization** and **shared-type/shared-hook placement** work.

Hard dependency checks:

- Lower layers still must not depend on higher layers.
- UI must keep using hooks/API modules rather than bypassing runtime/service boundaries.
- Store paths may move imports, but stores must not start depending on UI modules.
- Shared roots may be reduced, but any retained shared root must still be domain-agnostic or genuinely cross-feature.

### Dependency justification

- No new external dependencies are allowed.
- Internal dependency changes are allowed only to rewire imports to canonical feature-first owners and remove duplicate old import surfaces.

## Standards and Reference Constraints

Required references for implementation:

- `docs/references/frontend/project-folder-structure.md`
  - Feature-local code belongs under `features/<domain>/**`; root folders keep only shared concerns.
- `docs/references/frontend/component-structure-pattern.md`
  - Feature pages/components remain under feature folders; public barrels are optional and should expose only true public surface.
- `docs/references/frontend/naming-and-conventions-pattern.md`
  - Keep `kebab-case`, named exports, and `@/...` absolute imports; remove duplicate import paths where possible.
- `docs/references/frontend/api-react-query-pattern.md`
  - UI consumes hooks, hooks own query keys/cache logic, API modules remain typed and separated from components.
- `docs/references/frontend/zustand-store-pattern.md`
  - Store import rewires must preserve store action/state architecture and test coverage.
- `docs/testing/test-placement-and-sharding-convention.md`
  - No new component/page render tests for `apps/web`.

Companion skills during implementation:

- `test-driven-development` before cleanup edits that affect helper/store/test behavior.
- `subagent-driven-development` as default execution mode.
- `requesting-code-review` after major cleanup batches.
- `verification-before-completion` before any completion claim.
- `typescript-reviewer` for final TS/JS review.

## Plan of Work (Narrative)

1. **Activate plan tracking.** Add this ExecPlan to `docs/exec-plans/index.md` under Active, keep feat-063 planned/in-progress in harness, and record the planning step in `harness/progress.md`.

2. **Run pre-edit GitNexus impact checks.** Check upstream blast radius for the main seam symbols before deleting old paths: the legacy household invite dialog shim, budget/household/analytics shim hooks, and any budget-field seam symbols needed for ownership inversion. Stop and report if any result is HIGH/CRITICAL.

3. **Batch 1 — expense shim removal.** Confirm any remaining `@/components/expense/*` consumers are moved to `@/features/expenses/*`, then delete the full `apps/web/src/components/expense/**` shim tree. Verify zero stale imports remain.

4. **Batch 2 — budgets normalization and cleanup.** Make `apps/web/src/features/budgets/components/fields/*` the real implementation home, remove any reverse imports from feature files back into old root budget field paths, then delete the old `apps/web/src/components/budget/**` shim tree and `apps/web/src/types/budget.ts` after consumer rewrites.

5. **Batch 3 — household + hook/type shim cleanup.** Rewire onboarding, overview, households, expenses, store, and test consumers to canonical feature-first household and hook imports. Delete the legacy household component/api/type/form/util shims and the root `hooks/api/use-budgets.ts`, `use-households.ts`, and `use-analytics.ts` files once no imports remain.

6. **Clean leftovers and verify import graph.** Remove empty tracked shim host folders where practical, run searches to confirm zero in-tree imports of deleted legacy paths, and ensure canonical feature paths are now the only in-tree paths.

7. **Finish harness and verification.** Update feat-063 evidence, progress log, run focused checks during each batch, then full `./init.sh`, followed by `gitnexus_detect_changes(scope: all)` before the completion summary.

## Concrete Steps (Commands)

Run from repo root unless stated otherwise.

```bash
# refresh GitNexus before impact checks if needed
./init.sh sync

# focused lint after a cleanup batch
./init.sh lint

# focused typecheck after a cleanup batch
./init.sh typecheck

# final full verification
./init.sh
```

Expected short outputs:

- `./init.sh sync` -> `OK`
- `./init.sh lint` -> `OK`
- `./init.sh typecheck` -> `OK`
- `./init.sh` -> `Done!`

Supplemental evidence commands:

```bash
python3 -m json.tool harness/feature_index.json >/dev/null
python3 -m json.tool harness/features/feat-063.json >/dev/null
```

Expected output: silent success / exit code `0`.

## Validation and Acceptance

### Happy path

- No in-tree imports reference deleted shim paths.
- `apps/web/src/components/expense/**` is gone.
- `apps/web/src/components/budget/**` is gone.
- Household feature-local modules are imported directly from feature-first paths.
- Budget field implementation files live canonically under `features/budgets/components/fields/*`.

### Regression checks

- Stores and store tests still pass after household import rewires.
- Onboarding still builds after moving off household dialog/schema shims.
- Overview and household summary still build after moving off shim hooks.
- Expenses detail/edit/add-dialog still build after moving off household shim hooks.
- No new component/page render tests are introduced.

### Documentation / harness checks

- Plan index tracks this cleanup as active/completed appropriately.
- `feat-063` reflects the cleanup status and evidence.
- `harness/progress.md` records the cleanup session and verification.

### Acceptance artifacts

- `docs/design-docs/2026-05-20-web-shim-cleanup-and-ownership-normalization-design.md`
- `docs/exec-plans/plans/2026-05-20-web-shim-cleanup-and-ownership-normalization.md`
- updated `harness/features/feat-063.json`
- final `./init.sh` transcript ending with `Done!`
- final `gitnexus_detect_changes(scope: all)` output recorded in the summary

## Idempotence & Recovery

- Import rewrites and shim deletions are safe to re-run if paths are re-checked before patching.
- Work should be committed in logical cleanup batches so rollback can restore one domain at a time if needed.
- If a deletion breaks consumers, restore the specific shim file from git, finish the consumer rewrites, then delete it again.
- No destructive data migration exists here.

## Artifacts and Notes

- This cleanup is a direct follow-up to feat-062 and should preserve the same feature-first architecture rather than reopen shared-root ambiguity.
- The user explicitly chose the strongest cleanup option: aggressive shim removal plus ownership normalization where needed.
- Budget fields are the known tricky seam and must be canonicalized before deletion.

## Interfaces & Dependencies

- Next.js routes should remain untouched except where import paths change transitively via feature modules.
- Shared store APIs (`householdActions`, selectors, tests) must preserve current contract.
- Feature-first hooks remain the canonical query/mutation surface for affected domains after cleanup.

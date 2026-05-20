# Web Shim Cleanup and Ownership Normalization Design

## Status

- Owner: Orchestrator
- Date: 2026-05-20
- Status: Proposed
- Update trigger: Any change to feature-first ownership boundaries, compatibility-shim policy, or canonical placement of frontend domain modules after feat-062.

## Goal

Remove the temporary frontend compatibility shims left behind by the feature-first refactor so each frontend module has one canonical source path and no legacy re-export trees remain just to preserve old imports.

## Why

- Feat-062 moved `apps/web/src` to feature-first ownership, but several legacy root paths still exist only as re-export shims.
- Those shims create two valid import paths for the same code, which increases maintenance cost and makes ownership ambiguous again.
- Some budget field files still have inverted ownership where feature paths point back to old root component files.
- The project should treat feature-first as real ownership, not just a facade layered on top of the old tree.

## Scope

In scope:

- Delete legacy shim trees under `apps/web/src/components/expense/**` after consumers are moved.
- Delete legacy shim trees under `apps/web/src/components/budget/**` after ownership is normalized.
- Rewire and remove household/root shim paths:
  - `apps/web/src/components/household/**`
  - `apps/web/src/api/household.ts`
  - `apps/web/src/types/household.ts`
  - `apps/web/src/lib/forms/household.schema.ts`
  - `apps/web/src/utils/household/labels.ts`
- Rewire and remove hook/type shims:
  - `apps/web/src/hooks/api/use-budgets.ts`
  - `apps/web/src/hooks/api/use-households.ts`
  - `apps/web/src/hooks/api/use-analytics.ts`
  - `apps/web/src/types/budget.ts`
- Fix the remaining budgets ownership inversion so feature paths contain the real implementation.
- Update docs and harness artifacts if canonical placement rules or evidence paths change.

Out of scope:

- Removing genuinely shared root modules such as `api/client.ts`, `api/endpoints.ts`, `api/reference-data.ts`, `hooks/api/use-reference-data.ts`, `hooks/api/use-profile.ts`, `types/reference-data.ts`, `types/api.ts`, `types/profile.ts`.
- Backend contract changes.
- URL, navigation, or product behavior changes.
- Broad visual redesign.

## Current Problem Summary

The repo now has feature-first route/page ownership, but still keeps redundant compatibility layers:

- `components/expense/**` contains only legacy re-export files.
- `components/budget/**` contains top-level legacy re-export files.
- Several root household and hook/type files exist only to redirect imports to feature-first paths.
- Some budget feature files still re-export or depend on old root component field paths instead of owning the implementation directly.

This means the codebase still tolerates old imports and therefore still carries old structure assumptions.

## Decision

Treat compatibility shims as temporary migration scaffolding only. Remove them after all in-tree consumers are rewritten to canonical feature-first paths.

## Principles

1. One module has one canonical home.
2. Feature-local code belongs in `features/<domain>/**`.
3. Shared root folders keep only truly shared code.
4. No shim remains “just in case”.
5. Delete a shim immediately after all known consumers are moved.

## Canonical Ownership Decisions

### Expenses

- Canonical source remains under `apps/web/src/features/expenses/**`.
- All imports that still use `@/components/expense/*` must move to `@/features/expenses/*`.
- After rewiring, delete `apps/web/src/components/expense/**` completely.

### Budgets

- Canonical source remains under `apps/web/src/features/budgets/**`.
- Any feature budget field file that still points back to `@/components/budget/fields/*` must be inverted so the implementation lives directly under `features/budgets/components/fields/*`.
- After canonicalization, delete `apps/web/src/components/budget/**` completely.

### Households

- Canonical source remains under `apps/web/src/features/households/**`.
- Onboarding, store, and tests must import directly from feature-first household paths.
- After rewiring, delete household shim entrypoints at root/shared legacy paths.

### Shared hooks and shared roots

- `hooks/api/use-budgets.ts`, `hooks/api/use-households.ts`, and `hooks/api/use-analytics.ts` should not remain as shims once consumers are moved.
- If a hook is truly cross-feature, the canonical location must be explicitly justified in docs. Otherwise the canonical home should be the owning feature.
- For this cleanup, the current approved direction is to move consumers to the feature-owned hooks and remove the shims.

## Cleanup Batches

### Batch 1: Expense shim deletion

- Rewrite any remaining consumers to `@/features/expenses/**`.
- Delete `apps/web/src/components/expense/**`.
- Remove any empty legacy subfolders left behind.

### Batch 2: Budget ownership normalization

- Move real field implementations fully into `apps/web/src/features/budgets/components/fields/*`.
- Rewire internal and external consumers to feature-first budget paths.
- Delete `apps/web/src/components/budget/**` once no consumers remain.

### Batch 3: Household + hook/type shim cleanup

- Rewrite onboarding/store/tests/overview/expenses/households consumers to canonical feature-first household and hook imports.
- Delete:
  - `apps/web/src/components/household/**`
  - `apps/web/src/api/household.ts`
  - `apps/web/src/types/household.ts`
  - `apps/web/src/lib/forms/household.schema.ts`
  - `apps/web/src/utils/household/labels.ts`
  - `apps/web/src/hooks/api/use-budgets.ts`
  - `apps/web/src/hooks/api/use-households.ts`
  - `apps/web/src/hooks/api/use-analytics.ts`
  - `apps/web/src/types/budget.ts`

## Import Rules After Cleanup

- Feature code imports same-feature modules first.
- Cross-feature imports should point to the canonical feature path, not a legacy root compatibility path.
- Shared roots remain valid only for genuinely shared infrastructure.
- No new `export * from '@/features/...` compatibility files should be added at old root locations.

## Risks

### High: import graph breakage

Deleting shims too early can break route pages, stores, tests, and feature components.

Mitigation:

- batch work carefully
- search consumers first
- delete only after imports are rewritten
- run typecheck/lint after each batch

### Medium: budget reverse-ownership confusion

Some budget field modules still invert ownership between root and feature paths.

Mitigation:

- make feature path canonical first
- only then remove root path files

### Medium: hidden test/store consumers

Household/root shims are still used by stores and tests, not just pages/components.

Mitigation:

- include tests/stores in consumer rewrite scope
- verify all old imports are gone before deletion

## Acceptance Criteria

- No legacy shim files remain under `apps/web/src/components/expense/**`.
- No legacy shim files remain under `apps/web/src/components/budget/**`.
- Budget field implementations live canonically under `apps/web/src/features/budgets/components/fields/*`.
- No household/root compatibility shims remain for files that are feature-local.
- No in-tree imports reference the deleted legacy shim paths.
- Typecheck/lint/final verification pass after cleanup.

## Implementation Notes

- Prefer direct canonical imports over barrels when the barrel exists only for migration convenience.
- Keep shared infrastructure at root only when it is still genuinely shared after this cleanup.
- Remove empty legacy folders once tracked files are gone when practical, but deletion of tracked shim files matters more than cosmetic empty-directory cleanup.

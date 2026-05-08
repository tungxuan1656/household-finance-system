# Test Structure Backlog

## P0 — apply now

- Standardize naming rules for all new test files per app.
- For new web tests, prefer `.test.ts` or `.test.tsx` consistently.
- For new worker tests, keep `.spec.ts` consistently.
- Adopt proactive split thresholds for all new and edited tests:
  - warning at `350+` lines
  - strong split candidate at `400+` lines
  - hard stop at `500+` lines
- Ban non-semantic shard names such as `part-2`, `more`, and `extra`.
- Require helper extraction when repeated setup appears in two or more shards.

## P1 — cleanup when touching affected areas

- Normalize ambiguous web suffix usage toward `.test.ts(x)` when touching existing files.
- Split worker tests already above strong split threshold by behavior or use-case.
- Review `apps/web/src/views/app/` for a clearer local testing pattern if more page-level setup files are added.
- Keep quick-add dialog shards semantic and consolidate helper logic if setup duplication increases.
- Improve worker integration test naming when route or use-case traceability is weaker than source naming.

## P2 — defer unless there is active work

- Revisit the noisiest frontend folders after several opportunistic cleanups.
- Reassess whether any web sub-area needs a dedicated local `testing/` folder.
- Reassess worker integration setup grouping if scenario-specific setup files continue to grow.
- Consider wider normalization of historic web suffixes only after the new convention has been applied consistently for a while.

## Immediate review targets

Review these files first when test maintenance work starts:

- `apps/worker/test/unit/user-repository.spec.ts`
- `apps/worker/test/integration/invitations.spec.ts`
- `apps/worker/test/integration/budgets-status.spec.ts`

## Completed cleanup in this batch

- Split `apps/worker/test/integration/analytics-groups.spec.ts` into semantic shards plus `analytics-groups.test-setup.ts`.
- Split `apps/worker/test/integration/profile-patch.spec.ts` into semantic shards plus `profile-patch.test-setup.ts`.
- Split `apps/worker/test/integration/expenses-update.spec.ts` into semantic shards plus `expenses-update.test-setup.ts`.
- Split `apps/worker/test/integration/expenses-list-personal.spec.ts` into semantic shards plus `expenses-list-personal.test-setup.ts`.
- Split `apps/worker/test/integration/households-members.spec.ts` into semantic shards plus `households-members.test-setup.ts`.
- Normalize touched `apps/web` page and quick-add test shard suffixes from `.spec.tsx` to `.test.tsx`.

## Non-goals

- No repository-wide mass rename.
- No bulk file moves without active feature work.
- No forced unification of web and worker test architecture.
- No cleanup done only for stylistic symmetry.

## Adoption strategy

1. Apply the policy to all new tests immediately.
2. Enforce semantic naming and split thresholds in code review.
3. Split or rename existing tests only when working in those areas.
4. Re-run a structure audit after a meaningful batch of related cleanup.

## Expected effect

- lower risk of hitting `MAX_TEST=500`
- clearer source-to-test navigation in `apps/web`
- safer suite growth in `apps/worker`
- lower context cost for AI agents working on focused behaviors

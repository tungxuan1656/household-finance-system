# feat-007: Household-Finance D1 Schema and Local Migrations

## Objective

Replace the legacy worker migration baseline with a real Household Finance D1 schema that preserves the working auth/session tables from `feat-006` and adds the storage foundation for households, memberships, categories, groups, expenses, budgets, and audit logs. The observable outcome is that worker tests continue to pass on the new schema and local Wrangler commands can migrate and seed a usable household-finance dataset.

## Purpose / Big Picture

Before this feature, `apps/worker/migrations/0001_init.sql` modeled a different family rewards domain that did not match the product specs or the harness record for `feat-007`. This change makes the database baseline align with the current product (`households`, `expenses`, `budgets`, `audit`) while keeping the auth/session foundation stable for downstream auth and profile features. Developers can now bootstrap a local D1 instance with the canonical migration and a small seed dataset instead of relying only on test-time schema setup.

## Scope and Out-of-Scope

### In Scope

- `apps/worker/migrations/0001_init.sql`
- `apps/worker/test/index.spec.ts`
- `apps/worker/test/helpers/household-fixtures.ts`
- `apps/worker/seeds/local/dev.sql`
- `apps/worker/package.json`
- `apps/worker/README.md`
- `harness/features/feat-007.json`
- `harness/feature_index.json`
- `harness/progress.md`
- `docs/exec-plans/completed/2026-04-22-feat-007-database-schema-local-migrations.md`
- `docs/exec-plans/completed/index.md`

### Out of Scope

- New HTTP endpoints or frontend UI work.
- Invitation, recurring-expense, analytics materialization, or notification flows.
- Remote D1 provisioning or deployment-time migration automation.
- New dependencies or ORM adoption.

## Non-negotiable Requirements

- Preserve `users`, `auth_identities`, and `refresh_sessions` so current worker auth/profile behavior does not regress.
- Keep SQL in migrations and test fixtures, not in routes or handlers.
- Use `snake_case` DB columns, foreign keys, explicit CHECK constraints, and intentional indexes.
- Provide local migration and local seed commands that work from the current worker package.

## Context and Orientation

- Worker migration baseline: `apps/worker/migrations/0001_init.sql`
- Worker integration tests: `apps/worker/test/index.spec.ts`
- Worker test migration bootstrap: `apps/worker/test/helpers/apply-migrations.ts`
- Worker schema fixtures: `apps/worker/test/helpers/household-fixtures.ts`
- Local demo seed: `apps/worker/seeds/local/dev.sql`
- Worker package commands: `apps/worker/package.json`
- Worker runtime docs: `apps/worker/README.md`

## Plan of Work (Narrative)

1. Replace the legacy family/reward schema in `0001_init.sql` with a household-finance baseline that keeps auth/session tables intact and adds:
   - `households`
   - `household_memberships`
   - `expense_categories`
   - `expense_groups`
   - `expenses`
   - `expense_group_items`
   - `budgets`
   - `budget_limits`
   - `audit_logs`
2. Keep repository-facing auth/session code unchanged and let the schema replacement prove compatibility via the existing auth/profile/session worker tests.
3. Replace the legacy schema-integrity tests in `apps/worker/test/index.spec.ts` with household-finance assertions for membership uniqueness, CHECK constraints, group joins, budget uniqueness, and audit logging.
4. Add `apps/worker/test/helpers/household-fixtures.ts` so the new schema tests use small deterministic inserts instead of embedding bulky setup in each test.
5. Add `apps/worker/seeds/local/dev.sql` plus `db:seed:local` so developers can populate a local D1 instance outside Vitest.
6. Update worker docs to describe the new migration baseline and local seed workflow.

## Concrete Steps (Commands)

Run from repo root unless noted otherwise.

```bash
pnpm --filter worker test
pnpm --filter worker db:migrate:local
pnpm --filter worker db:seed:local
pnpm --filter worker exec wrangler d1 execute household-finance-main --local --command "SELECT COUNT(*) AS household_count FROM households; SELECT COUNT(*) AS expense_count FROM expenses; SELECT COUNT(*) AS audit_count FROM audit_logs;" --config ./wrangler.jsonc
./init.sh
```

Expected short outputs:

```text
Test Files 8 passed
0001_init.sql | ✅
11 commands executed successfully
household_count: 1
expense_count: 2
audit_count: 2
=== Init complete ===
```

## Validation and Acceptance

### Happy Path

- Worker integration and unit tests pass with the new schema in place.
- Local Wrangler migration apply succeeds against the local D1 state.
- Local demo seed applies cleanly and yields a non-empty household, expense, and audit dataset.

### Failure and Constraint Paths

- Duplicate household membership for the same user/household is rejected.
- Invalid membership role and invalid expense visibility are rejected.
- Cross-household expense-group assignment is rejected by foreign keys.
- Duplicate active category names within the same household are rejected.
- Duplicate household budget scope for the same month is rejected.

### Acceptance Artifacts

- `apps/worker/test/index.spec.ts`
- `apps/worker/seeds/local/dev.sql`
- `harness/features/feat-007.json`

## Idempotence and Recovery

- `pnpm --filter worker test` and `./init.sh` are safe to re-run.
- `db:seed:local` is written with `INSERT OR IGNORE` and stable ids so it is safe to re-run against the same local DB.
- `db:migrate:local` is safe to re-run after the initial migration because Wrangler tracks applied migrations in local state.
- Wrangler local DB commands should be run sequentially; running migrate/seed/query in parallel against the same `.wrangler` state produced a local-state failure during implementation and is not the supported workflow.

## Interfaces and Dependencies

- Cloudflare D1 local migrations through Wrangler CLI.
- Existing worker auth/profile handlers and repositories continue to depend on `users`, `auth_identities`, and `refresh_sessions`.
- No new third-party dependencies were added.

## Risks and Blockers

- The local worker runtime still warns that the installed Miniflare/Workers runtime supports compatibility date `2026-03-10` while `wrangler.jsonc` requests `2026-04-16`.
- Later expense features will still need follow-on schema expansion for payment-source reference data, invitation data, and recurring-expense storage.

## Surprises & Discoveries

- GitNexus impact analysis for `applyMigrations`, `createRefreshSession`, and `findUserById` reported `LOW` blast radius; the real change surface was the worker test/bootstrap layer.
- Local Wrangler D1 commands initially failed with `SQLITE_READONLY` because migrate/seed/query were launched in parallel against the same `.wrangler/state/v3/d1` path. Sequential execution fixed the issue.

## Decision Log

- Decision: Replace the legacy `0001_init.sql` instead of layering a follow-up migration.
  Rationale: `feat-007` was still pending, and the old schema modeled the wrong product.
  Date/Author: 2026-04-22 / Codex

- Decision: Preserve the existing auth/session tables unchanged.
  Rationale: They already support the worker auth/profile flows and unblock `feat-008`.
  Date/Author: 2026-04-22 / Codex

- Decision: Add a SQL-first local seed instead of introducing code-based seeding or an ORM.
  Rationale: Keeps the workflow dependency-free and aligned with repository constraints.
  Date/Author: 2026-04-22 / Codex

## Open Decisions

- None blocking `feat-007`.

## Progress Log

- [x] (2026-04-22) Run GitNexus impact analysis for migration bootstrap and auth/session repository symbols.
- [x] (2026-04-22) Replace legacy schema-integrity tests with household-finance integrity tests.
- [x] (2026-04-22) Rewrite `apps/worker/migrations/0001_init.sql` to the household-finance baseline.
- [x] (2026-04-22) Add local seed SQL, package script, and README guidance.
- [x] (2026-04-22) Verify worker tests, local Wrangler migration/seed/query flow, and full `./init.sh`.

## Outcomes & Retrospective

The worker now has a product-aligned D1 baseline instead of a stale legacy schema, and the new schema is proven through both automated tests and local Wrangler commands. The biggest implementation lesson was operational rather than structural: local D1 commands must run sequentially against `.wrangler` state to avoid false-negative runtime failures.

# Backend API Scenario Testing Design

## Objective

Add a backend-only integration test layer that exercises real worker HTTP APIs end-to-end for core business scenarios. The goal is to verify request/response behavior, business logic, and database state together without involving the frontend.

## Scope

In scope:
- create authenticated test users automatically
- run real API requests against `apps/worker`
- verify response envelopes and database writes/updates/deletes
- cover core business flows with scenario-style tests
- keep test isolation reliable across runs

Out of scope:
- frontend/browser tests
- exhaustive endpoint-by-endpoint coverage in one mega spec
- replacing existing unit tests

## Current Baseline

The worker already has:
- integration tests under `apps/worker/test/integration/*.spec.ts`
- `SELF.fetch(...)`-based request execution
- `registerWorkerIntegrationSetup()` for migrations + cleanup
- auth bootstrap helpers in `apps/worker/test/helpers/test-context.ts`

This design extends that pattern instead of replacing it.

## Proposed Structure

### 1. Scenario-focused integration specs

Add new specs grouped by business flow, not by low-level endpoint:
- `scenario-auth-profile.spec.ts`
- `scenario-household-expense.spec.ts`
- `scenario-group-expense.spec.ts`
- `scenario-media-profile.spec.ts`

Each file should represent one coherent backend journey.

### 2. Shared test helpers

Expand the test helper layer with small wrappers for common setup actions:
- create authenticated user/session
- create household
- create expense
- create group/assignment records
- fetch profile / list endpoints
- inspect DB state directly through `env.DB`

Keep assertions in the specs; keep helpers focused on bootstrapping and repeated API calls.

### 3. DB verification at each step

Each scenario should validate both:
- API response shape and status
- persisted DB state for the affected records

This ensures the tests catch mismatches between route behavior and storage logic.

### 4. Isolation strategy

Use the existing integration setup to reset the DB between tests.
Prefer that over hand-written cleanup in each scenario.

Use unique per-test values for user identifiers and domain entities so tests remain order-independent.

## Initial Scenario Set

Start with three core flows:

1. **Auth + Profile**
   - exchange a test token
   - verify session/user creation
   - verify profile fetch/update behavior

2. **Household + Expense**
   - create a household
   - create/list/update/delete an expense
   - verify foreign keys and ownership constraints

3. **Group Expense**
   - create a group-related flow
   - attach expense data to the group path
   - verify aggregate/linking state in the DB

## Verification Path

Success criteria:
- tests run only in the backend worker package
- requests go through the real worker API surface
- user/session bootstrap is automatic
- database state is asserted directly where needed
- scenarios are independent and reproducible

Recommended checks:
- `pnpm test:worker`
- targeted worker integration spec runs while developing
- `pnpm typecheck:worker`

## Risks and Mitigations

- **Flaky shared state**: mitigate with DB reset + unique test data.
- **Overly large scenarios**: keep each file focused on one flow.
- **Brittle assertions**: check only meaningful fields and database invariants.
- **Helper drift**: keep helper functions thin so they do not hide API behavior.

## Open Decisions

None. The chosen approach is scenario-style backend integration tests with API + DB verification.

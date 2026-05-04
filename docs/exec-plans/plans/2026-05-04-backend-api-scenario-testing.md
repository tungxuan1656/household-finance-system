# Backend API Scenario Testing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add backend-only scenario integration tests for auth/profile, household/expense, and group expense flows using real worker HTTP requests plus direct D1 verification.

**Architecture:** Extend the existing worker integration test harness instead of introducing a second test system. Add thin reusable helpers in `apps/worker/test/helpers/`, then add focused scenario specs in `apps/worker/test/integration/` that authenticate a test user, perform API actions through `SELF.fetch(...)`, and verify persisted state through `env.DB`.

**Tech Stack:** Cloudflare Workers test pool, Vitest, D1, TypeScript, existing worker integration helpers.

---

## Objective

Create a maintainable scenario-style backend test layer that verifies API behavior and storage logic together for the core worker business flows.

## Scope and Out of Scope

### In scope
- extend test helpers for authenticated API flows
- add scenario integration specs for auth/profile
- add scenario integration specs for household/expense
- add scenario integration specs for group expense
- verify API envelopes and D1 state changes

### Out of scope
- frontend/browser testing
- replacing current unit tests
- exhaustive negative-case coverage for every endpoint
- refactoring worker routes/handlers unless required for testability

## Verification Path

- `pnpm --filter worker test -- apps/worker/test/integration/scenario-auth-profile.spec.ts`
- `pnpm --filter worker test -- apps/worker/test/integration/scenario-household-expense.spec.ts`
- `pnpm --filter worker test -- apps/worker/test/integration/scenario-group-expense.spec.ts`
- `pnpm --filter worker test`
- `pnpm --filter worker typecheck`

## Risks and Blockers

- Existing route contracts may differ slightly from older specs; confirm response fields before final assertions.
- Scenario tests can become brittle if helpers hide too much behavior; helpers must stay thin.
- DB assertions must focus on stable invariants, not incidental columns.

## Progress Log

- [ ] Plan written
- [ ] Helper extensions added
- [ ] Auth/profile scenario implemented
- [ ] Household/expense scenario implemented
- [ ] Group expense scenario implemented
- [ ] Worker tests and typecheck verified

## Open Decisions

- No open product decisions. Implementation should follow existing integration patterns and keep assertions focused on meaningful business invariants.

## Context and Orientation

- Worker routes live in `apps/worker/src/routes/`.
- Existing integration test setup lives in `apps/worker/test/helpers/test-context.ts`.
- Existing household fixtures live in `apps/worker/test/helpers/household-fixtures.ts`.
- Existing endpoint-level worker integration tests live in `apps/worker/test/integration/*.spec.ts`.
- Package commands for the worker live in `apps/worker/package.json`.

## File Structure Map

### Modify
- `apps/worker/test/helpers/test-context.ts`
  - extend with authenticated request helpers and small DB assertion utilities
- `harness/progress.md`
  - record session work after implementation
- `harness/feature_index.json`
  - update feature state/evidence after implementation
- `harness/features/<relevant-feature>.json`
  - update evidence and status for the testing work once the exact feature record is identified

### Create
- `apps/worker/test/integration/scenario-auth-profile.spec.ts`
- `apps/worker/test/integration/scenario-household-expense.spec.ts`
- `apps/worker/test/integration/scenario-group-expense.spec.ts`

## Plan of Work

1. Extend `test-context.ts` with thin helpers for creating an authenticated session, authorized JSON requests, and common envelope parsing. Keep route-specific assertions in specs.
2. Add the auth/profile scenario spec that exchanges a test token, fetches the current profile, updates it, and verifies `users` plus auth/session state in D1.
3. Add the household/expense scenario spec that creates a household, creates an expense, lists it, updates it, deletes or restores it as appropriate, and verifies `households`, `expenses`, and any link-table records.
4. Add the group expense scenario spec that creates a group, creates or assigns expenses into that group, requests group summary data, and verifies `expense_groups`, `expense_group_items`, and summary invariants.
5. Run targeted tests first, then the full worker test suite and worker typecheck. Update harness artifacts only after successful verification.

## Concrete Tasks

### Task 1: Extend worker integration helpers

**Files:**
- Modify: `apps/worker/test/helpers/test-context.ts`
- Reference: `apps/worker/test/integration/households-crud.spec.ts`

- [ ] **Step 1: Write a failing helper-driven scenario test expectation**

Create `apps/worker/test/integration/scenario-auth-profile.spec.ts` with a first test that imports the planned helper names from `test-context.ts`, then call the test directly.

```ts
import { describe, expect, it } from 'vitest'

import {
  authorizedJsonRequest,
  createAuthenticatedSession,
  parseJson,
  registerWorkerIntegrationSetup,
} from '../helpers/test-context'

registerWorkerIntegrationSetup()

describe('Worker integration scenario: auth and profile', () => {
  it('bootstraps an authenticated user and reads the profile', async () => {
    const session = await createAuthenticatedSession('scenario-auth-profile')

    const response = await authorizedJsonRequest(session.accessToken, {
      method: 'GET',
      path: '/api/v1/users/me',
    })

    const payload = await parseJson(response)

    expect(response.status).toBe(200)
    expect(payload).toBeDefined()
  })
})
```

- [ ] **Step 2: Run the targeted test and verify it fails because helper exports do not exist yet**

Run from repo root:

```bash
pnpm --filter worker test -- apps/worker/test/integration/scenario-auth-profile.spec.ts
```

Expected: FAIL with missing export or missing function errors from `test-context.ts`.

- [ ] **Step 3: Add minimal helper exports in `test-context.ts`**

Implement thin helpers like:

```ts
export const createAuthenticatedSession = async (seed: string) => {
  const email = `${seed}@example.com`
  return exchangeAccessToken(`test:${seed}:${email}`)
}

export const authorizedJsonRequest = (
  accessToken: string,
  options: {
    method: string
    path: string
    body?: unknown
  },
) =>
  SELF.fetch(`https://example.com${options.path}`, {
    method: options.method,
    headers: {
      authorization: `Bearer ${accessToken}`,
      ...(options.body ? { 'content-type': 'application/json' } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
```

Also extend the exchange helper return type so tests can use `refreshToken` if needed.

- [ ] **Step 4: Re-run the targeted test and verify it now passes or advances to the next real assertion**

Run:

```bash
pnpm --filter worker test -- apps/worker/test/integration/scenario-auth-profile.spec.ts
```

Expected: the import/export failure is gone. If the scenario now fails on payload assertions, continue with Task 2.

### Task 2: Add auth/profile scenario

**Files:**
- Modify: `apps/worker/test/helpers/test-context.ts`
- Create: `apps/worker/test/integration/scenario-auth-profile.spec.ts`
- Reference: `apps/worker/test/integration/media-profile.spec.ts`

- [ ] **Step 1: Write the failing scenario test for profile update and DB verification**

Add a test that:
- exchanges a test token
- calls `GET /api/v1/users/me`
- calls `PATCH /api/v1/users/me` with `displayName` and `avatarUrl`
- queries `env.DB` to verify the updated `users` row

Use assertions like:

```ts
expect(getResponse.status).toBe(200)
expect(getPayload.data.email).toContain('scenario-auth-profile')

expect(updateResponse.status).toBe(200)
expect(updatePayload.data).toMatchObject({
  displayName: 'Scenario User',
  avatarUrl: 'https://example.com/avatar.png',
})

const userRow = await env.DB
  .prepare('SELECT email, display_name, avatar_url FROM users WHERE id = ?')
  .bind(session.user.id)
  .first<{ email: string; display_name: string | null; avatar_url: string | null }>()

expect(userRow).toMatchObject({
  display_name: 'Scenario User',
  avatar_url: 'https://example.com/avatar.png',
})
```

- [ ] **Step 2: Run the targeted auth/profile scenario test and verify it fails for the expected assertion**

Run:

```bash
pnpm --filter worker test -- apps/worker/test/integration/scenario-auth-profile.spec.ts
```

Expected: FAIL on a missing assertion condition, mismatched field, or missing helper behavior — not on syntax errors.

- [ ] **Step 3: Implement the minimal helper or assertion adjustments needed**

Only add small utilities if repeated twice or more, such as a typed `selectFirst` wrapper for DB reads. Do not move scenario assertions into helpers.

- [ ] **Step 4: Re-run the targeted auth/profile scenario test and verify it passes**

Run the same command. Expected: PASS for the scenario file.

### Task 3: Add household/expense scenario

**Files:**
- Create: `apps/worker/test/integration/scenario-household-expense.spec.ts`
- Modify: `apps/worker/test/helpers/test-context.ts` only if a repeated helper is clearly justified
- Reference: `apps/worker/test/integration/expenses.spec.ts`
- Reference: `apps/worker/test/integration/expenses-lifecycle.spec.ts`

- [ ] **Step 1: Write the failing scenario test covering household plus expense lifecycle**

Add a test that:
- creates an authenticated session
- `POST /api/v1/households`
- `POST /api/v1/expenses` with `visibility: 'household'` and the created `householdId`
- `GET /api/v1/expenses?household_id=...`
- `PATCH /api/v1/expenses/:id`
- `DELETE /api/v1/expenses/:id`
- verifies the `households` and `expenses` tables reflect the expected state

Core assertions should include:

```ts
expect(createHouseholdResponse.status).toBe(201)
expect(createExpenseResponse.status).toBe(201)
expect(listExpensesPayload.data.items).toHaveLength(1)
expect(updateExpensePayload.data.title).toBe('Dinner Updated')
expect(deleteExpensePayload.data.deleted).toBe(true)
```

DB checks should verify:
- created household row exists with expected name/slug
- created expense row belongs to the household and user
- deleted expense no longer appears in active list or is marked according to current contract

- [ ] **Step 2: Run the targeted household/expense scenario test and verify it fails for the expected reason**

Run:

```bash
pnpm --filter worker test -- apps/worker/test/integration/scenario-household-expense.spec.ts
```

Expected: FAIL on business assertions before implementation is complete.

- [ ] **Step 3: Implement the minimal repeated test support needed**

If the file repeats the same authorized request or DB lookup patterns more than twice, add a small helper. Otherwise keep logic inline in the spec.

- [ ] **Step 4: Re-run the targeted household/expense scenario test and verify it passes**

Use the same command. Expected: PASS.

### Task 4: Add group expense scenario

**Files:**
- Create: `apps/worker/test/integration/scenario-group-expense.spec.ts`
- Reference: `apps/worker/test/integration/groups-create.spec.ts`
- Reference: `apps/worker/test/integration/groups-assignment.spec.ts`
- Reference: `apps/worker/test/integration/groups-read.spec.ts`

- [ ] **Step 1: Write the failing scenario test for group creation, assignment, and summary verification**

Add a test that:
- creates an authenticated session
- creates a household
- creates an expense group via `POST /api/v1/groups`
- creates a household expense
- assigns the expense into the group via `PATCH /api/v1/expenses/:id/groups`
- loads `GET /api/v1/groups/:id/summary`
- verifies group summary totals and D1 linking rows

Core assertions:

```ts
expect(createGroupResponse.status).toBe(201)
expect(assignGroupResponse.status).toBe(200)
expect(summaryResponse.status).toBe(200)
expect(summaryPayload.data.expenseCount).toBe(1)
expect(summaryPayload.data.totalSpendMinor).toBeGreaterThan(0)
```

DB checks:
- `expense_groups` row exists for created group
- `expense_group_items` row links the expense and group
- summary totals align with linked expense amount

- [ ] **Step 2: Run the targeted group scenario test and verify it fails correctly**

Run:

```bash
pnpm --filter worker test -- apps/worker/test/integration/scenario-group-expense.spec.ts
```

Expected: FAIL on the intended missing/misaligned behavior, not on syntax errors.

- [ ] **Step 3: Implement only the minimal helper reuse needed**

Keep any new helpers generic to scenario testing, such as a tiny `createHouseholdForSession()` wrapper only if it is used across more than one scenario file.

- [ ] **Step 4: Re-run the targeted group scenario test and verify it passes**

Run the same command. Expected: PASS.

### Task 5: Full verification and artifact updates

**Files:**
- Modify: `harness/progress.md`
- Modify: `harness/feature_index.json`
- Modify: `harness/features/<relevant-feature>.json`

- [ ] **Step 1: Run the full worker test suite**

Run:

```bash
pnpm --filter worker test
```

Expected: all worker tests pass, including the three new scenario specs.

- [ ] **Step 2: Run worker typecheck**

Run:

```bash
pnpm --filter worker typecheck
```

Expected: no TypeScript errors.

- [ ] **Step 3: Update harness artifacts with evidence**

Record:
- which scenario files were added
- exact verification commands run
- pass results summary

- [ ] **Step 4: Re-run any command needed if artifact updates touched typed code or scripts**

If only markdown/json harness files changed, no extra worker verification is needed.

## Acceptance Criteria

- `apps/worker/test/integration/scenario-auth-profile.spec.ts` passes and verifies both API responses and the `users` table state.
- `apps/worker/test/integration/scenario-household-expense.spec.ts` passes and verifies household creation plus expense lifecycle state.
- `apps/worker/test/integration/scenario-group-expense.spec.ts` passes and verifies group assignment and summary invariants.
- `pnpm --filter worker test` passes.
- `pnpm --filter worker typecheck` passes.

## Idempotence and Recovery

- The integration setup already applies migrations and clears tables before each test, so scenario test runs are intended to be repeatable.
- If a test becomes flaky due to state assumptions, reduce the assertion to stable invariants and use unique per-test identifiers.

## Interfaces and Dependencies

- `SELF.fetch(...)`: Cloudflare worker integration request entrypoint.
- `env.DB`: D1 binding used for direct storage verification.
- `exchangeAccessToken(idToken)`: existing auth bootstrap helper.
- Worker test commands from `apps/worker/package.json`: `test`, `typecheck`.

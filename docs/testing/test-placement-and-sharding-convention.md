# Test Placement and Sharding Convention

## Purpose

This document defines where tests should live in this repository, when a single test file should be split into smaller shards, and how those shards should be named so both developers and AI agents can navigate the codebase predictably.

## Principles

- Optimize for local discoverability in `apps/web`.
- Optimize for suite clarity in `apps/worker`.
- Keep test files behavior-focused and below `MAX_TEST=500`.
- Prefer semantic file names over generic suffix-only sharding.
- Extract shared setup when repetition increases or when files approach line limits.
- Avoid oversharding: split only when clarity improves.

## Repository constraints

The repository enforces TypeScript file length checks through `scripts/check_ts_length.sh`.

- Hard limit for tests: `MAX_TEST=500`
- Warning threshold: `350+` lines
- Strong split candidate: `400+` lines

Do not wait for a hard failure before splitting a test file.

## Rules for `apps/web`

Default: colocate tests with components, hooks, utilities, and feature-local view logic.

Use colocated test files for:

- components
- hooks
- formatters and parsers
- feature-local view helpers
- page-local behavior that is only meaningful next to the page or view module

Use a shared test location such as `src/test/` or a focused local `testing/` folder when:

- the helper is used by more than one page or feature
- the helper is used by more than one behavior shard
- local setup files are creating folder noise around runtime files
- colocating shared infrastructure would hide test intent

### Web examples

Good colocated examples:

- `apps/web/src/components/household/household-members-card.test.tsx`
- `apps/web/src/views/app/overview/overview-formatters.test.ts`
- `apps/web/src/lib/auth/firebase-auth.test.ts`

Good shared infra example:

- `apps/web/src/test/setup.ts`

## Rules for `apps/worker`

Default: keep tests under `test/unit` and `test/integration`.

Use `test/unit` for:

- repository helpers
- validators
- pure service functions
- isolated auth or domain logic

Use `test/integration` for:

- route behavior
- authorization behavior
- request and response contracts
- environment-dependent flows
- D1-backed end-to-end request handling inside worker boundaries

Use `test/helpers` for:

- reusable request builders
- migration bootstrapping
- reusable fixtures
- shared integration setup

### Worker examples

- `apps/worker/test/unit/user-repository.spec.ts`
- `apps/worker/test/integration/expenses-update.spec.ts`
- `apps/worker/test/helpers/test-context.ts`

## Placement decision matrix

| Case | Place | Shape |
| --- | --- | --- |
| Small UI component | colocated | one test file |
| UI component with multiple behavior groups | colocated | multiple semantic test shards |
| Page or view orchestration | colocated if page-local | one or more shards depending on line pressure |
| Shared render/setup helper | `src/test/` or focused local test infra folder | helper file |
| Worker unit behavior | `test/unit` | one or more use-case files |
| Worker route or integration behavior | `test/integration` | one or more behavior files |

## When to split tests

Split a test file when any of these are true:

- file length reaches the warning threshold (`350+` lines)
- file is a strong split candidate (`400+` lines)
- file covers multiple distinct behavior groups
- setup duplication is growing across sections or files
- a reviewer must scroll significantly to locate one scenario
- one file mixes rendering, interaction, validation, submit, and error-state coverage

Do not wait for the hard limit (`500` lines) before splitting.

## How to split tests

Split by behavior group first.

Preferred split axes:

1. behavior
2. user flow or use-case
3. authorization, validation, or error handling
4. rendering versus interactions

Do not split by:

- author
- chronology
- arbitrary numbering
- `part-2`, `more`, `extra`, or similar non-semantic suffixes

## Naming rules

Prefer semantic behavior suffixes.

### `apps/web`

Prefer `.test.ts` or `.test.tsx` consistently for new web tests.

Good:

- `expense-form.test.tsx`
- `expense-form.validation.test.tsx`
- `expense-form.submit.test.tsx`
- `overview-page.filters.test.tsx`
- `overview-page.summary-cards.test.tsx`

Bad:

- `expense-form-part-2.test.tsx`
- `overview-page-more.test.tsx`
- `overview-page-extra.spec.tsx`

### `apps/worker`

Keep `.spec.ts` consistently inside worker test suites.

Good:

- `households-create.spec.ts`
- `households-list.spec.ts`
- `households-authz.spec.ts`
- `households-validation.spec.ts`

Bad:

- `households-part-2.spec.ts`
- `households-more.spec.ts`
- `households-extra.spec.ts`

## Helper and setup extraction

Extract setup or helpers when:

- the same setup appears in two or more test files
- setup size materially contributes to line-count pressure
- setup complexity hides test intent
- one feature now has multiple semantic shards sharing common setup

Keep setup local when:

- it is truly single-file and page-specific
- extraction would make the test harder to read
- the setup is small enough that inlining is clearer than indirection

## Oversharding guardrails

Multiple files are not automatically better.

Avoid oversharding when:

- a single cohesive file is still comfortably below warning threshold
- each shard would contain only one or two tiny scenarios
- file names would stop communicating behavior clearly
- navigating many tiny files would cost more than reading one focused file

If in doubt, prefer one cohesive file until the warning threshold or mixed-responsibility signal appears.

## Checklist for new tests

Before adding a new test:

1. Is this local to one module? If yes, colocate in `apps/web`.
2. Is this backend unit or integration behavior? If yes, keep it under worker `test/`.
3. Will this file likely exceed `350` lines soon? If yes, shard by behavior now.
4. Is the file name semantic enough for a human or AI agent to guess its purpose?
5. Can repeated setup move into a helper without hiding test intent?
6. Are you splitting because clarity improved, or only because the file feels busy?

## Expected outcomes

Following this convention should produce:

- faster source-to-test discovery in `apps/web`
- clearer suite-level structure in `apps/worker`
- fewer oversized test files
- fewer ambiguous shard names
- lower navigation cost for developers and AI agents

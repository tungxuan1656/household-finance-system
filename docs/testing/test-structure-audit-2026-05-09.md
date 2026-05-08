# Test Structure Audit — 2026-05-09

## Scope

This audit covers test placement, test sharding, naming quality, helper placement, and line-length pressure for:

- `apps/web`
- `apps/worker`

## Inventory summary

### `apps/web`

- total test files: `60`
- `.test.*` files: `40`
- `.spec.*` files: `20`
- dominant pattern: colocated test files inside `src/`
- shared test infra: `apps/web/src/test/setup.ts`
- local test setup files discovered: `6`

Representative files:

- `apps/web/src/views/app/expenses-page.test.tsx`
- `apps/web/src/views/app/overview-page-links.spec.tsx`
- `apps/web/src/components/expense/quick-add/quick-add-expense-dialog-errors.spec.tsx`
- `apps/web/src/components/household/household-members-card.integration.test.tsx`
- `apps/web/src/lib/utils.test.ts`

### `apps/worker`

- total test files: `66`
- `.test.*` files: `0`
- `.spec.*` files: `66`
- dominant pattern: centralized test files under `test/`
- helper files under `test/helpers`: `3`
- local test setup files discovered under `test/integration`: `3`

Representative files:

- `apps/worker/test/integration/core.spec.ts`
- `apps/worker/test/integration/expenses-update.spec.ts`
- `apps/worker/test/integration/analytics-export.spec.ts`
- `apps/worker/test/unit/env.spec.ts`
- `apps/worker/test/unit/jwt.spec.ts`

## Placement patterns

### `apps/web`

Current state: mostly colocated with a mixed naming convention.

Observed patterns:

- page and view tests live beside view modules under `src/views/app/`
- component tests live beside component modules under `src/components/`
- utility and API tests live beside source modules under `src/lib/`, `src/api/`, and `src/stores/`
- global test infra is centralized in `src/test/setup.ts`
- page and feature-specific setup files are also colocated near runtime files

Representative paths:

- `apps/web/src/views/app/expenses-page.test.tsx`
- `apps/web/src/views/app/profile-settings-page.test-setup.tsx`
- `apps/web/src/components/household/household-members-card.test.tsx`
- `apps/web/src/components/expense/quick-add/quick-add-expense-dialog.test-setup.tsx`
- `apps/web/src/lib/auth/firebase-auth.test.ts`

Assessment:

- local discovery is strong
- page folders carry most of the nearby file noise
- colocated sharding is already used in several areas, especially around page behaviors and dialog behaviors

### `apps/worker`

Current state: strongly centralized and internally consistent.

Observed patterns:

- all worker tests live under `apps/worker/test/`
- unit and integration concerns are clearly separated
- shared helpers are concentrated under `test/helpers`
- a few scenario-specific setup files live beside integration tests

Representative paths:

- `apps/worker/test/unit/user-repository.spec.ts`
- `apps/worker/test/integration/households-members.spec.ts`
- `apps/worker/test/integration/auth-session.test-setup.ts`
- `apps/worker/test/helpers/test-context.ts`

Assessment:

- suite-level readability is strong
- source-to-test traceability depends heavily on naming quality
- integration setup stays mostly disciplined, though some per-scenario setup files may grow over time

## Naming inconsistency

### Findings

#### `apps/web`

- mixed `.test` and `.spec` usage in same app
- some files include additional qualifiers such as `.integration.test.tsx`
- behavior-specific shard naming is generally semantic and readable

Examples of mixed suffix usage:

- `apps/web/src/views/app/expenses-page.test.tsx`
- `apps/web/src/views/app/overview-page-links.spec.tsx`
- `apps/web/src/components/expense/quick-add/quick-add-defaults.test.ts`
- `apps/web/src/components/expense/quick-add/quick-add-expense-dialog-errors.spec.tsx`

Assessment:

- naming quality is mostly good
- inconsistency is not semantic ambiguity; it is suffix inconsistency

#### `apps/worker`

- consistent `.spec.ts` usage across discovered worker tests
- route and behavior naming is mostly semantic

Examples:

- `apps/worker/test/integration/expenses-update.spec.ts`
- `apps/worker/test/integration/analytics-groups.spec.ts`
- `apps/worker/test/unit/dto-expense-list.spec.ts`

Assessment:

- worker naming is materially more consistent than web naming

### Ambiguous shard naming

No obvious test files used generic shard names such as `part-2`, `more`, or `extra`.

This is a strength worth preserving.

## Helper and setup placement

### `apps/web`

Shared infra is clear:

- `apps/web/src/test/setup.ts`

Local setup files discovered:

- `apps/web/src/views/app/profile-settings-page.test-setup.tsx`
- `apps/web/src/views/app/overview-page.test-setup.tsx`
- `apps/web/src/views/app/onboarding-page.test-setup.tsx`
- `apps/web/src/views/app/insights-page.test-setup.tsx`
- `apps/web/src/views/app/households-page.test-setup.tsx`
- `apps/web/src/components/expense/quick-add/quick-add-expense-dialog.test-setup.tsx`

Assessment:

- local setup seems justified where behavior shards share the same mocks or render helpers
- `src/views/app/` carries the largest concentration of setup files and behavior shards, making it the noisiest frontend area
- if more pages adopt this pattern, a focused local testing folder may become clearer than repeated `*.test-setup.tsx` files in page roots

### `apps/worker`

Shared helpers are disciplined:

- `apps/worker/test/helpers/test-context.ts`
- `apps/worker/test/helpers/household-fixtures.ts`
- `apps/worker/test/helpers/apply-migrations.ts`

Scenario setup files discovered:

- `apps/worker/test/integration/expenses-detail.test-setup.ts`
- `apps/worker/test/integration/expenses-delete-restore.test-setup.ts`
- `apps/worker/test/integration/auth-session.test-setup.ts`

Assessment:

- helper placement is clearer than web overall
- per-scenario setup files are acceptable today because they remain inside test-only space
- growth risk exists if too many integration setup files accumulate without grouping

## Test length pressure

Repository rule source: `scripts/check_ts_length.sh`

- hard limit: `500`
- warning threshold for this audit: `350+`
- strong split candidate for this audit: `400+`

### Hard limit violations (`>500`)

None found in sampled longest files for `apps/web` and `apps/worker`.

### Strong split candidates (`400+`)

#### `apps/worker`

| Path | Lines | Why it is long | Suggested action |
| --- | ---: | --- | --- |
| `apps/worker/test/integration/analytics-groups.spec.ts` | 448 | multiple behavior groups likely combined | review for behavior split |
| `apps/worker/test/integration/profile-patch.spec.ts` | 440 | broad route behavior surface | review for validation/authz/patch split |
| `apps/worker/test/integration/expenses-update.spec.ts` | 436 | update flow likely mixes several scenarios | review for semantic sharding |
| `apps/worker/test/unit/user-repository.spec.ts` | 420 | repository responsibilities likely broad | review for read/write or use-case split |
| `apps/worker/test/integration/expenses-list-personal.spec.ts` | 420 | multiple list scenarios likely combined | review for filter/state split |
| `apps/worker/test/integration/households-members.spec.ts` | 411 | membership flows likely wide | review for use-case split |

### Warning candidates (`350+`)

#### `apps/worker`

| Path | Lines | Why it is notable | Suggested action |
| --- | ---: | --- | --- |
| `apps/worker/test/integration/invitations.spec.ts` | 399 | near strong split candidate | monitor, split if new scenarios added |
| `apps/worker/test/integration/budgets-status.spec.ts` | 355 | already over warning threshold | keep scope tight, split if behavior grows |

#### `apps/web`

No sampled web test files crossed audit warning threshold.

Largest sampled web files:

| Path | Lines | Note |
| --- | ---: | --- |
| `apps/web/src/components/household/household-members-card.test.tsx` | 243 | large but well below warning threshold |
| `apps/web/src/components/expense/quick-add/quick-add-expense-dialog-persistence.spec.tsx` | 219 | likely focused shard |
| `apps/web/src/views/app/household-detail-page.test.tsx` | 209 | acceptable current size |
| `apps/web/src/views/app/expenses-page.test.tsx` | 206 | acceptable current size |

Assessment:

- current sharding pressure is much higher in worker than web
- existing web sharding seems to be preventing oversized test files

## Noisy folder clusters

### High-severity cluster

#### `apps/web/src/views/app/`

Reasons:

- highest density of page-level behavior shards
- repeated `*.test-setup.tsx` files beside runtime page modules
- mixed `.test` and `.spec` suffixes in same area

Representative paths:

- `apps/web/src/views/app/overview-page-links.spec.tsx`
- `apps/web/src/views/app/overview-page-errors.spec.tsx`
- `apps/web/src/views/app/insights-page-panels.spec.tsx`
- `apps/web/src/views/app/households-page-create-list.spec.tsx`
- `apps/web/src/views/app/profile-settings-page.test-setup.tsx`

Impact:

- still navigable, but page roots will get harder to scan as more shards land

### Medium-severity cluster

#### `apps/web/src/components/expense/quick-add/`

Reasons:

- many behavior shards for one dialog feature
- one colocated setup file
- strong local cohesion, but file density is high

Representative paths:

- `apps/web/src/components/expense/quick-add/quick-add-expense-dialog-success.spec.tsx`
- `apps/web/src/components/expense/quick-add/quick-add-expense-dialog-reward.spec.tsx`
- `apps/web/src/components/expense/quick-add/quick-add-expense-dialog-persistence.spec.tsx`
- `apps/web/src/components/expense/quick-add/quick-add-expense-dialog-errors.spec.tsx`
- `apps/web/src/components/expense/quick-add/quick-add-expense-dialog.test-setup.tsx`

Impact:

- acceptable today because shard names are semantic
- should be monitored to avoid oversharding or helper sprawl

### Medium-severity cluster

#### `apps/web/src/components/household/`

Reasons:

- several related component tests clustered together
- includes both standard component test and integration-style component test

Representative paths:

- `apps/web/src/components/household/household-members-card.integration.test.tsx`
- `apps/web/src/components/household/household-members-card.test.tsx`
- `apps/web/src/components/household/household-summary-card.test.tsx`
- `apps/web/src/components/household/household-create-dialog.test.tsx`
- `apps/web/src/components/household/household-settings-card.test.tsx`

Impact:

- still readable
- naming remains clear enough for both humans and agents

## Oversharding risk

### Current state

No strong evidence of harmful oversharding today.

Reasons:

- shard names are mostly semantic
- line pressure in web appears controlled
- worker remains mostly suite-oriented rather than over-split

### Areas to watch

- `apps/web/src/views/app/`
- `apps/web/src/components/expense/quick-add/`

Risk signal to watch for:

- too many tiny files with overlapping setup
- setup file count growing with each new behavior shard
- a page root containing both runtime files and many test-only files without grouping

## Developer impact

### Positive

- colocated web tests make source-to-test discovery fast
- semantic behavior shards improve targeted maintenance
- worker unit/integration separation is easy to scan for backend work
- helper placement in worker is disciplined enough for test infra discovery

### Negative

- mixed `.test` and `.spec` usage in web increases low-level inconsistency
- `apps/web/src/views/app/` is becoming noisy because page roots hold runtime files, shard files, and setup files together
- worker source-to-test tracing depends on test names staying semantic because tests are not colocated with source

## AI agent impact

### Positive

- colocated web tests support short local edit loops
- semantic web shards such as `overview-page-errors.spec.tsx` help agents open relevant files directly
- centralized worker tests help agents reason about suite shape and integration coverage
- smaller web shard files reduce context cost compared with a single large page test

### Negative

- mixed suffix conventions in web create extra pattern-matching cost
- page-local setup files beside runtime modules add nearby noise during file discovery
- large worker integration tests near `400+` lines increase context cost and will become harder to modify safely if they keep growing

## Evidence table

| Path | Issue type | Severity | Recommended action | Rationale |
| --- | --- | --- | --- | --- |
| `apps/web/src/views/app/` | noisy folder cluster | High | define stricter setup grouping rule | page roots carry runtime, setup, and behavior shards together |
| `apps/web/src/views/app/profile-settings-page.test-setup.tsx` | local setup sprawl risk | Medium | keep local for now, monitor reuse | one of several page setup files in same folder pattern |
| `apps/web/src/components/expense/quick-add/` | dense shard cluster | Medium | keep semantic sharding, monitor growth | local cohesion is high, but density is increasing |
| `apps/web/src/views/app/overview-page-links.spec.tsx` | web suffix inconsistency | Medium | prefer future normalization to `.test.tsx` for new web files | web app mixes `.test` and `.spec` |
| `apps/worker/test/integration/analytics-groups.spec.ts` | strong split candidate | High | review for behavior split | `448` lines, close to hard limit |
| `apps/worker/test/integration/profile-patch.spec.ts` | strong split candidate | High | review for semantic sharding | `440` lines, broad route surface likely combined |
| `apps/worker/test/integration/expenses-update.spec.ts` | strong split candidate | High | review for semantic sharding | `436` lines, line pressure high |
| `apps/worker/test/unit/user-repository.spec.ts` | strong split candidate | High | review by use-case split | `420` lines, unit file likely too broad |
| `apps/worker/test/integration/households-members.spec.ts` | strong split candidate | High | review membership behavior grouping | `411` lines, near hard limit trajectory |
| `apps/worker/test/integration/invitations.spec.ts` | warning candidate | Medium | monitor and split before next growth | `399` lines |

## Summary

- `apps/web` has good local discoverability and mostly healthy semantic sharding, but page-level roots are getting noisy and naming suffixes are inconsistent.
- `apps/worker` has strong centralized suite structure and cleaner naming consistency, but several tests are already at or above warning thresholds and should be reviewed before they cross `MAX_TEST=500`.
- The repository should preserve web colocated placement and worker centralized placement while tightening sharding and naming policy.

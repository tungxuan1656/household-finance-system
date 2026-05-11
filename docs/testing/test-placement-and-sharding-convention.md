# Test Placement and Sharding Convention

## Purpose

Define where tests live, when to split them, and how to name them so developers and AI agents can navigate the codebase predictably.

## Where to place tests

### `apps/web` — colocated

Place tests beside the module they cover: components, hooks, formatters, feature-local helpers, and page-local behavior.

Use `src/test/` or a focused local `testing/` folder only when a helper is reused across multiple pages or features, or when local setup files create noise around runtime files.

### `apps/worker` — centralized under `test/`

- `test/unit` — repository helpers, validators, pure service functions, isolated auth or domain logic
- `test/integration` — route behavior, authorization, request/response contracts, D1-backed flows
- `test/helpers` — reusable request builders, fixtures, migration bootstrapping, shared setup

## Placement matrix

| Case | Place | Shape |
|---|---|---|
| Small UI component | colocated | one test file |
| UI component with multiple behavior groups | colocated | multiple semantic shards |
| Page/view orchestration | colocated if page-local | one or more shards by line pressure |
| Shared render/setup helper | `src/test/` or local `testing/` folder | helper file |
| Worker unit behavior | `test/unit` | one or more use-case files |
| Worker route/integration | `test/integration` | one or more behavior files |

## When to split

Split when any of these is true:

- file length reaches the warning threshold (`350+` lines)
- file is a strong split candidate (`400+` lines)
- file covers multiple distinct behavior groups
- setup duplication is growing across sections or files
- a reviewer must scroll significantly to locate one scenario
- one file mixes rendering, interaction, validation, submit, and error-state coverage

Do not wait for the hard limit (`500` lines) before splitting.

## How to split

Split by behavior group first. Preferred axes:

1. behavior
2. user flow or use-case
3. authorization, validation, or error handling
4. rendering versus interactions

**Never split by**: author, chronology, arbitrary numbering, or non-semantic suffixes like `part-2`, `more`, `extra`.

## Naming

Prefer semantic behavior suffixes over generic ones.

**`apps/web`**: use `.test.ts` or `.test.tsx` consistently.

Good: `expense-form.test.tsx`, `expense-form.validation.test.tsx`, `overview-page.filters.test.tsx`
Bad: `expense-form-part-2.test.tsx`, `overview-page-extra.spec.tsx`

**`apps/worker`**: keep `.spec.ts` consistently.

Good: `households-create.spec.ts`, `households-authz.spec.ts`, `households-validation.spec.ts`
Bad: `households-part-2.spec.ts`, `households-more.spec.ts`

## Setup helpers

Extract setup or helpers when:

- the same setup appears in two or more test files
- setup size materially contributes to line-count pressure
- setup complexity hides test intent

Keep setup local when it is truly single-file and page-specific, or when inlining is clearer than indirection.

## Checklist

Before adding a new test:

1. Is this local to one module? If yes, colocate in `apps/web`.
2. Is this backend unit or integration behavior? If yes, keep it under worker `test/`.
3. Will this file likely exceed `350` lines soon? If yes, shard by behavior now.
4. Is the file name semantic enough for a human or AI agent to guess its purpose?
5. Can repeated setup move into a helper without hiding test intent?
6. Are you splitting because clarity improved, or only because the file feels busy?
# feat-129 - TMA directory tree deep-modules refactor

## Goal

Unify the confused `routes/` vs `features/*/pages/` seam and standardize per-feature subfolders so every domain is a deep Module with one small Interface, good Leverage and Locality.

## Confirmed scope

- Move all 18 `src/routes/*.tsx` page containers into `src/features/<domain>/pages/` so `app/router/app-router.tsx` imports from a single source. Keep `src/routes/` only as deleted or as thin re-export barrel if history requires.
- Dissolve `src/components/finance/` (6 files) into `features/home/components/` and `features/expenses/components/` where the data lives.
- Standardize per-feature skeleton to `api.ts | components/ | pages/ | model/ | types.ts | presentation.ts` — choose one canonical shape for `api` (flat `api.ts`) and `types` (flat `types.ts`), remove `api/` folder vs `api.ts` duality and `types/` folder duality.
- Consolidate `expenses` stores (`store.ts` + `filter-store.ts` + `import-store.ts` + `draft.ts`) into `features/expenses/model/` and consolidate `lib/period` + `features/period/store` seam.
- Standardize `auth` flat 7-file outlier into `features/auth/model/` + `features/auth/bootstrap.ts` with internal seams.
- Fix import direction so `app/router -> features/pages` only; no `routes -> features` cross-import.

## Non-goals

- No behavior, API, or UI redesign beyond moving files and fixing imports.
- No lazy/Suspense or bundle splitting (covered by feat-127 decision — stays eager).
- No dark mode, i18n, or new features.
- No change to `components/ui` pristine shadcn output or `components/shared` wrappers.

## Acceptance

- [x] No `src/routes/*.tsx` page logic remains; all 18 routes resolve to `features/*/pages/*.tsx` and `app-router.tsx` imports only from `features`.
- [x] `src/components/finance/` is empty/deleted; its consumers import from `features/home/components` or `features/expenses/components`.
- [x] Every feature follows the single skeleton; `api/` folder and `types/` folder dualities are eliminated (one `api.ts` + one `types.ts` per feature, except proven >400-line exception documented).
- [x] `expenses` model is one `model/` folder; `period` truth lives in one place; `auth` bootstrap has internal seams testable without Provider.
- [x] `pnpm --filter tma lint`, `typecheck`, `test`, `build`, and `./init.sh` pass; `git diff --check` clean; no circular imports introduced.
- [x] Manual TMA smoke in Telegram still passes (home, expenses list/detail/filter, add-expense flow, statistics, period picker, back button).

## Handoff

- State: done
- Plan: inline — see below (no separate `docs/plans/feat-129.md` per user request)
- Evidence: Steps 2+3 moved 18 routes to features/*/pages and dissolved components/finance (verified tsc 0 errors, grep from '@/routes 0, from '@/components/finance 0, ls routes/finance gone). Step 4 standardized skeleton: households api kept as documented >400-line exception, invitations api/types flattened, budgets feedback merged, expenses model/ created with 4 files + barrel, auth model/ shim + period seam doc. Verification: lint 0 errors/15 warnings, typecheck 0, test 31 files/162 tests pass, build 708.51 kB gzip 216.02 kB pass (5 expected eager dynamic-import warnings retained), ./init.sh pass, git diff --check clean.
- Blockers: none
- Next: none — feature closed.

## Inline plan

### Step 1 — Inventory & map (read-only, no code)
- List every `src/routes/*.tsx` (18) and map to target `features/<domain>/pages/<name>-page.tsx` (e.g., `routes/expenses.tsx` -> `features/expenses/pages/expense-list-page.tsx`, `routes/statistics.tsx` -> `features/home/pages/statistics-page.tsx`, `routes/home.tsx` -> `features/home/pages/home-page.tsx`).
- List `components/finance/*` (6) and map to `features/home/components/` vs `features/expenses/components/`.
- Snapshot current import graph for `app-router.tsx` and `routes/* -> features/*` cross-imports.

### Step 2 — Move routes -> features/pages (mechanical)
- Move 18 files to their target `features/*/pages/` with `git mv` semantics; update default/named exports to match existing `features/pages` convention.
- Update `app/router/app-router.tsx` to import exclusively from `features/*/pages/*` and from `TMA_PATHS`.
- Delete or leave `src/routes/` as barrel re-exports only if needed for git history; otherwise delete.

### Step 3 — Dissolve finance leakage
- Move `expense-summary-card.tsx`, `expenses.tsx`, `summary.tsx` etc. into correct feature `components/`; update `features/home` and `routes/home` (now `features/home/pages`) imports.
- Delete `src/components/finance/` and its barrel.

### Step 4 — Standardize per-feature skeleton
- For each feature, normalize `api` to flat `api.ts` (merge `households/api/*` 6 files and `invitations/api/*` 1 file into single `api.ts` unless >400 lines — then document exception).
- Normalize `types` to flat `types.ts` (merge `budgets/types/feedback.ts`, `invitations/types/*`).
- Create `features/expenses/model/` consolidating `store.ts`, `filter-store.ts`, `import-store.ts`, `draft.ts`; create `features/auth/model/` and `features/auth/bootstrap.ts` (merge `bootstrap` + `bootstrap-deps` + `refresh-interceptor` internal seams).
- Collapse `features/period` into `lib/period` as single truth; keep only `period` pages/components that are truly UI.

### Step 5 — Fix seams & imports
- Enforce `app/router -> features/pages` direction; forbid `features -> routes` and `components/finance -> features`.
- Run `eslint --fix`, `tsc --noEmit`, and `grep` gates for remaining dualities (`api/` folder, `types/` folder, `store.ts` scattered).

### Step 6 — Verify
- `pnpm --filter tma lint` (0 errors), `typecheck`, `test` (all suites), `build`, `./init.sh` (worker skip) pass.
- `grep -r "from '@/routes"` returns empty; `grep -r "components/finance"` returns empty.
- Manual TMA smoke: home, expenses filter/list/detail/edit, add-expense (category/details/context/chat/import), add-income, statistics, period picker, back button, pull-to-refresh.
- Record evidence in Handoff and append to `progress.md` before close.

### Risks
- Large file moves cause merge conflicts with in-flight branches — mitigate by doing steps 2–3 in one atomic commit and communicating freeze.
- Missed import updates break TMA cold launch — mitigate by full `typecheck` + `build` + Telegram smoke before close.

### Rollback
- Each step is file moves + import rewrites only; revert via `git revert` of the move commit. No DB or API change.

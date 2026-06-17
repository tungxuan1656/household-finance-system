# TMA Tailwind Component Rewrite

## Purpose / Big Picture

Rewrite the existing Telegram Mini App screens so page styling lives in Tailwind utilities and shared React components instead of BEM-style classes in `apps/tma/src/index.css`. Users should see the same TMA route set with a calmer, consistent finance UI, reusable cards/buttons/inputs/chips, shared smart components for summaries/recent expenses/households, and a real add-expense save through the worker API.

## Scope

- Change `apps/tma/src/components/**`, `apps/tma/src/features/**`, `apps/tma/src/routes/**`, `apps/tma/src/app/router/**` as needed for UI primitives, smart components, shell composition, and route replacement.
- Change `apps/tma/src/index.css` so it only keeps Tailwind import, TMA CSS variables, `@theme inline`, base reset, and keyframes.
- Change TMA docs/harness artifacts to record the new CSS convention and verification evidence.
- Out of scope: adding a new Settings route, changing worker schemas/routes, changing `apps/web`, adding a JS Tailwind config, or importing web UI into TMA.

## Non-negotiable Requirements

- Use `apps/tma` only; no imports from `apps/web`.
- Preserve SPA navigation and Telegram BackButton/BottomButton ownership.
- Use Tailwind v4 CSS-first tokens from `@theme inline`; do not add `tailwind.config.ts`.
- Add-expense save must call existing `POST /expenses` with `{ amount, categoryKey, sourceKey, title, occurredAt, note?, householdId?, groupIds? }`.
- Before code edits, run GitNexus upstream impact checks for touched shared route/shell/API symbols.

## Progress

- [x] 2026-06-05: Plan and feature tracking created.
- [x] Run pre-edit GitNexus impact checks.
- [x] Build shared UI primitives.
- [x] Build shared smart components with query/mutation ownership.
- [x] Replace existing TMA route markup.
- [x] Remove component classes from `index.css`.
- [x] Run verification and update evidence.

## Surprises & Discoveries

- Current TMA docs still allow component classes in `index.css`; this work intentionally changes that convention for the current route set.
- Add-expense category/source mock keys had drifted from the typed worker catalog (`bills`/`bank`/`ewallet`). They now use canonical `living-costs`, `bank-transfer`, and `momo` keys so create/update requests stay typed.

## Decision Log

- Decision: Scope is existing routes only, no Settings route.
  Rationale: User selected existing routes during planning.
  Date/Author: 2026-06-05 / Codex.
- Decision: Keep `index.css` tokens/base only.
  Rationale: User selected token/base-only cleanup; Tailwind utilities and components own all page styling.
  Date/Author: 2026-06-05 / Codex.
- Decision: Wire add-expense to real create API.
  Rationale: User selected real create over local preview.
  Date/Author: 2026-06-05 / Codex.

## Outcomes & Retrospective

- Added shared TMA UI primitives under `apps/tma/src/components/ui` for buttons, cards, form fields, chips, avatar, money labels, icon badges, section headers, data states, and segmented controls.
- Added smart finance components for summary cards, shortcuts, recent expenses, expense timelines/items, household previews, and household list items with internal query ownership where appropriate.
- Replaced existing TMA route/page markup with Tailwind utility composition and the new primitives/smart components across Home, Statistics, Expenses, add-expense, expense detail/edit, household list/detail/create, fatal launch, and not-found screens.
- Added worker-backed `useCreateExpenseMutation` and wired add-expense step 3 to `POST /expenses`, including broad invalidation for expenses, analytics, budgets, and household/home read surfaces.
- Reduced `apps/tma/src/index.css` to Tailwind import, TMA tokens, `@theme inline`, base reset, and `tma-spin` keyframes. No component class layer remains.
- Verification passed: `./init.sh typecheck`, `./init.sh lint`, `./init.sh test`, `./init.sh build`, final `./init.sh`, `git diff --check`, and custom-class scans.
- Final GitNexus change detection reported critical risk with 145 changed symbols, 78 affected symbols, and 37 changed files. This was expected for the requested page/shell rewrite; affected flows are concentrated around `TmaPageShell`, route scroll/list flows, household pages, and add-expense creation.

## Context and Orientation

- TMA shell: `apps/tma/src/components/shared/tma-page-shell.tsx`, `apps/tma/src/components/shared/app-shell.tsx`, `apps/tma/src/app/router/root-layout.tsx`.
- Current BEM-style CSS: `apps/tma/src/index.css`.
- Existing routes: `apps/tma/src/routes/*.tsx`.
- Home smart components: `apps/tma/src/features/home/components/*`.
- Household pages/components: `apps/tma/src/features/households/**`.
- Expense APIs/stores: `apps/tma/src/features/expenses/**`.

## Plan of Work

1. Run GitNexus impact checks for `TmaPageShell`, `TmaPageHeader`, `TmaMonogramBadge`, `TmaDataState`, `useExpenseDetailQuery`, `useUpdateExpenseMutation`, `HomeOverviewSection`, `HomeRecentExpensesSection`, `HomeHouseholdsSection`, `HouseholdListPage`, `HouseholdDetailPage`, and the add-expense route components.
2. Add UI primitives under `apps/tma/src/components/ui` for cards, buttons, inputs, date input, avatar, chips, money labels, section headers, dialogs, segmented controls, and row/list shells.
3. Rewrite shared shell/loading/data-state components to use only Tailwind utilities and raw safe-area CSS variables.
4. Extend `apps/tma/src/features/expenses/api.ts` with create-expense request/response typing and `useCreateExpenseMutation`, invalidating expenses, analytics, budgets, and household/home data.
5. Add feature smart components for summary cards, recent expenses, expense items/timeline, shortcuts, household previews/list items, household summary, and expense review/save.
6. Replace route markup for home, statistics, expenses, add-expense steps, expense detail/edit subroutes, household list/detail/create, fatal/not-found.
7. Reduce `index.css` to Tailwind import, design tokens, base reset, and `tma-spin` keyframes; remove all component class definitions.
8. Update TMA docs/harness with the final convention and evidence.

## Concrete Steps (Commands)

Run from repo root:

```bash
./init.sh typecheck
./init.sh test
./init.sh lint
./init.sh build
./init.sh
```

Expected short outputs are `OK` for targeted init commands and `Done!` for the final full init.

Also run before the final summary:

```bash
git diff --check
```

Expected: no output.

## Validation and Acceptance

- No custom component classes remain in `apps/tma/src/index.css`.
- `rg "className=.*tma-|className=\\{.*tma-" apps/tma/src` finds no old BEM-style component class usage; Tailwind token utilities like `bg-tma-primary` are allowed.
- Existing routes render through the new shared primitives and smart components.
- Add-expense step 3 creates a real worker-backed expense and invalidates read surfaces.
- Typecheck, tests, lint, build, full init, and final GitNexus change detection have fresh evidence.

## Idempotence & Recovery

- Edits are source-only and safe to re-run.
- No migrations or destructive commands are planned.
- If verification fails after CSS cleanup, restore the missing behavior by moving styling into React components rather than reintroducing component classes into `index.css`.

## Artifacts and Notes

- Harness feature: `harness/features/feat-095.json`.
- Progress log: `harness/progress.md`.

## Interfaces & Dependencies

- Existing worker create expense contract: `POST /expenses` with major-unit `amount`; worker converts to minor units based on VND/household currency.
- Existing TMA API client unwraps worker envelopes through `post`, `patch`, `get`, and `deleteRequest`.
- Existing TanStack Query owns server state; Zustand stores remain only for add/edit expense flow drafts.

# Home Overview Refinement

## Title

Refine `/home` category presentation, lens geometry, and first-entry household loading.

## Purpose / Big Picture

This change improves the live quality of the authenticated `/home` screen after the earlier primitive-first hardening pass. End users will observe a cleaner lens selector, correct category names/icons/colors sourced from the shared category catalog, more polished household and budget cards, and immediate household-lens availability after entering `/home`, without changing backend contracts or adding component render tests.

## Scope

- Files, modules, and areas expected to change:
  - `docs/design-docs/2026-05-12-home-overview-refinement-design.md`
  - `docs/exec-plans/index.md`
  - `apps/web/src/views/app/overview-page.tsx`
  - `apps/web/src/components/home/lens-selector.tsx`
  - `apps/web/src/components/home/recent-expenses.tsx`
  - `apps/web/src/components/home/category-breakdown.tsx`
  - `apps/web/src/components/home/household-cards-section.tsx`
  - budget presentation code used by `/home`, likely in `apps/web/src/views/app/overview-page.tsx` and/or extracted home budget presentation files if created
  - shared reusable category presentation code in an appropriate path under `apps/web/src/lib` and/or `apps/web/src/components`
  - touched reference-data consumers under `apps/web/src/hooks/api/use-reference-data.ts` or their call sites
  - touched locale files under `apps/web/src/lib/i18n/locales/*`
  - focused non-render tests for reusable helpers/primitives if needed
- Explicitly out of scope:
  - any `apps/worker/*` code
  - category presentation migration across the entire app
  - new backend fields or API shape changes
  - component render tests for home sections
  - broad dashboard framework extraction beyond bounded reusable helpers/patterns

## Non-negotiable Requirements

- The plan must stay frontend-only and preserve current `/home` truthfulness.
- The implementation must use existing category metadata (`label`, `icon`, `color`) through a reusable path rather than a `/home`-local mapping.
- Before editing any function, class, or method, run GitNexus upstream impact analysis for the targeted symbols and warn on `HIGH` or `CRITICAL` risk.
- The home page must proactively load household lenses from the existing household store flow without introducing hidden active-household behavior.
- The user explicitly disallowed component render tests; do not add them.
- Run `pnpm lint:fix` and the repo verification flow before claiming completion.

## Progress

- [x] 2026-05-12 Validate the reported UI/runtime issues against the screenshot and live Playwright inspection.
- [x] 2026-05-12 Confirm the household-lens bug root cause in `apps/web/src/views/app/overview-page.tsx` and `apps/web/src/stores/household.store.ts`.
- [x] 2026-05-12 Get user approval for reusable category handling and bounded reusable household/budget refinement.
- [x] 2026-05-12 Write this refinement design spec and ExecPlan.
- [x] 2026-05-12 Run GitNexus impact checks for the new symbols touched by this refinement.
- [x] 2026-05-12 Add reusable category presentation logic using existing reference-data contracts.
- [x] 2026-05-12 Refine the home lens selector geometry in `apps/web/src/components/home/lens-selector.tsx`.
- [x] 2026-05-12 Update recent-expense and category-breakdown rendering to use reusable category metadata presentation.
- [x] 2026-05-12 Improve household and budget card composition in `/home` with bounded reusable patterns.
- [x] 2026-05-12 Fix first-entry household lens loading in `apps/web/src/views/app/overview-page.tsx`.
- [x] 2026-05-12 Keep verification free of component render tests, run `pnpm lint:fix`, `pnpm --filter web test`, Playwright runtime validation, and `./init.sh`.
- [x] 2026-05-12 Update plan status, harness evidence, and progress tracking after implementation.

## Surprises & Discoveries

- Discovery: the browser request log shows `GET /api/v1/households` succeeding during the home session, but the page still renders only the personal lens because `/home` does not currently coordinate store population for lens construction.
- Discovery: category metadata is already available through `ReferenceCategoryDTO`, `useReferenceCategoriesQuery()`, and `getCategoryLabel(...)`, so the current Home issue is presentation reuse, not missing data.
- Discovery: the user wants reusable category handling and bounded reusable presentation for household/budget sections, not just a quick visual patch.

## Decision Log

- Decision: use a bounded reusable refinement rather than a `/home`-local patch.
  Rationale: the user explicitly selected reusable category handling and medium-strength reusable presentation for household/budget sections.
  Date/Author: 2026-05-12 / OpenCode orchestrator
- Decision: keep this pass frontend-only and store-driven for the household lens fix.
  Rationale: the root cause is page/store coordination, not backend contract absence.
  Date/Author: 2026-05-12 / OpenCode orchestrator

## Outcomes & Retrospective

- Completed the bounded `/home` refinement follow-up without widening into backend or a dashboard framework rewrite. The final pass added a reusable category-presentation helper backed by the existing reference-data catalog, corrected live Home category labels and icons, improved lens geometry and household/budget hierarchy, and fixed first-entry household-lens loading by wiring `/home` to the existing store fetch path.
- Runtime validation surfaced two real-world issues during implementation: an incorrect store action access (`useHouseholdStore.use.actions()`) and a `next/image` remote-host crash for reference-data icons. Both were fixed locally and re-verified.
- The budget area remains intentionally summary-oriented rather than a full budget-status dashboard, which is acceptable for this bounded refinement scope.
- Component render tests were not added, per user instruction.

## Context and Orientation

- Home entry and composition:
  - `apps/web/src/app/(protected)/home/page.tsx`
  - `apps/web/src/views/app/overview-page.tsx`
- Home UI sections in scope:
  - `apps/web/src/components/home/lens-selector.tsx`
  - `apps/web/src/components/home/recent-expenses.tsx`
  - `apps/web/src/components/home/category-breakdown.tsx`
  - `apps/web/src/components/home/household-cards-section.tsx`
- Existing runtime/category contracts:
  - `apps/web/src/hooks/api/use-reference-data.ts`
  - `apps/web/src/types/reference-data.ts`
  - `apps/web/src/lib/reference-data/labels`
- Existing household store flow:
  - `apps/web/src/stores/household.store.ts`
- Related budget presentation references:
  - `apps/web/src/components/budget/budget-card.tsx`
  - any current inline home budget placeholder/presentation code in `overview-page.tsx`
- UI guidance:
  - `docs/design-docs/shadcn-card-composition-architecture-guide.md`

Layer impact check using `ARCHITECTURE.md` layering (`Types -> Config -> Repo -> Service -> Runtime -> UI`):

- Primary impact is UI and UI-adjacent shared helper code.
- Existing service/runtime contracts must remain unchanged.
- UI may consume existing reference-data and store APIs, but may not bypass them.
- Any shared helper introduced must stay compatible with current typed contracts.

## Plan of Work (Narrative)

1. **Safety analysis before edits**
   - Run `gitnexus_impact` upstream for each new/refined symbol likely to change in this pass.
   - Candidate symbols include `OverviewPage`, `LensSelector`, `RecentExpenses`, `CategoryBreakdown`, `HouseholdCardsSection`, the shared category-label helper if touched, and any new reusable category helper/component added.
   - If a risk returns `HIGH` or `CRITICAL`, stop and warn before editing.

2. **Create bounded reusable category presentation**
   - Inspect the existing reference-data flow and add one shared helper and/or tiny presentational component that resolves category metadata from `ReferenceCategoryDTO[]` plus a category key.
   - Prefer a shape that exposes label, `iconUrl`, and `color`, with safe fallback behavior when metadata is missing.
   - Reuse existing `getCategoryLabel(...)` instead of creating a parallel naming source.

3. **Refine lens selector geometry**
   - Update `apps/web/src/components/home/lens-selector.tsx` so the segmented control looks cleaner in mobile screenshots and runtime.
   - Keep the solution inside current shared primitive boundaries unless a tiny additive primitive styling refinement is clearly needed.

4. **Apply category presentation to Home**
   - `apps/web/src/components/home/recent-expenses.tsx`: replace raw category key display and generic icon treatment with reusable category presentation.
   - `apps/web/src/components/home/category-breakdown.tsx`: replace raw category keys and generic-only tones with metadata-backed category rows.
   - If budget mini-cards in `/home` benefit from category-aware accenting or labels, apply the same shared logic there without widening scope.

5. **Refine household and budget card quality**
   - Improve visual hierarchy, spacing, and summary composition for `apps/web/src/components/home/household-cards-section.tsx`.
   - Improve the budget card presentation used by `/home` so the cards read as intentional dashboard surfaces rather than placeholders.
   - Keep changes inside `Card`-based composition and layout hierarchy instead of reintroducing bespoke page-level surfaces.

6. **Fix first-entry household lens loading**
   - In `apps/web/src/views/app/overview-page.tsx`, trigger `householdActions.fetchHouseholds()` when the household store is empty and not already loading.
   - Ensure the effect is stable and does not loop.
   - Verify that a fresh login or first home entry can show household lenses once data resolves, without needing to visit `/households`.

7. **Verify without component render tests**
   - Add focused helper/logic tests only if new reusable category resolution logic warrants them.
   - Do not add component render tests.
   - Use Playwright/browser validation to confirm the screenshot-level fixes.
   - Run `pnpm lint:fix`, `pnpm --filter web test`, and `./init.sh` before completion.

8. **Update harness and plan records**
   - Update the relevant feature evidence record, likely `harness/features/feat-045.json`, to include this refinement follow-up.
   - Prepend a new `harness/progress.md` entry documenting the UI/runtime corrections and verification evidence.
   - Move the plan entry in `docs/exec-plans/index.md` from Active to Completed when done.

## Concrete Steps (Commands)

Run all commands from repo root `/Users/tungdoan/Projects/Web/household-finance-system` unless noted otherwise.

1. Pre-edit analysis:

```bash
# run GitNexus upstream impact checks for each touched symbol
```

Expected short outputs:

- each report returns `LOW|MEDIUM|HIGH|CRITICAL` risk plus affected callers/processes
- if any report is `HIGH` or `CRITICAL`, pause before editing

2. Live browser validation during implementation (workdir: `apps/web`):

```bash
npx --no-install playwright-cli open http://127.0.0.1:3000/home
npx --no-install playwright-cli snapshot
npx --no-install playwright-cli requests
```

Expected short outputs:

- authenticated `/home` snapshot shows corrected lens selector and category presentation after login
- request log confirms household/category/home queries are behaving as expected

3. Post-edit verification:

```bash
pnpm lint:fix
pnpm --filter web test
./init.sh
```

Expected short outputs:

- `pnpm lint:fix`: no errors; any unrelated pre-existing warnings must be explicitly called out
- `pnpm --filter web test`: all frontend tests pass
- `./init.sh`: install, harness checks, lint, type-check, tests, and GitNexus steps all pass

## Validation and Acceptance

Happy-path acceptance:

- After fresh login, navigating to `/home` eventually shows both personal and household lenses when the account has households.
- The lens selector looks visually improved relative to the current screenshot.
- Recent expenses show category label/icon/color from the shared category metadata path.
- Category breakdown no longer displays raw keys when catalog metadata is available.
- Household and budget sections look cleaner and more intentional on mobile.

Validation/error/regression checks:

- If category metadata is temporarily unavailable, the UI still renders safe fallbacks instead of crashing.
- If the user has no households, the personal lens still renders correctly without broken loading logic.
- The home route remains stable when budgets are absent.
- No component render tests are introduced.

Acceptance artifacts:

- Playwright snapshot or screenshot evidence of the refined `/home`
- passing frontend test output
- successful `pnpm lint:fix`
- successful `./init.sh`

## Idempotence & Recovery

- The refinement is safe to re-run because it is frontend-only and uses existing data contracts.
- Household fetch coordination must be guarded so rerenders do not spam repeated requests.
- If the reusable category helper causes unintended spread, revert that helper addition first and reapply with narrower scope.
- Rollback is standard git revert of the touched frontend files.

## Artifacts and Notes

- Design spec for this refinement: `docs/design-docs/2026-05-12-home-overview-refinement-design.md`
- Prior home hardening plan: `docs/exec-plans/plans/2026-05-12-home-primitive-first-refactor.md`
- User-validated feedback for this round includes lens geometry, category metadata usage, household card quality, budget card quality, and first-entry household-lens loading.

## Interfaces & Dependencies

- Existing category data path:
  - `useReferenceCategoriesQuery()` from `apps/web/src/hooks/api/use-reference-data.ts`
  - `ReferenceCategoryDTO` from `apps/web/src/types/reference-data.ts`
  - `getCategoryLabel(...)` from `apps/web/src/lib/reference-data/labels`
- Existing home/store dependencies:
  - `useHouseholdStore(...)`
  - `householdActions.fetchHouseholds()`
  - `useAnalyticsOverviewQuery(...)`
  - `useAnalyticsComparisonQuery(...)`
  - `useBudgetListQuery(...)`
  - `useInfiniteExpenseListQuery(...)`
- Companion skills required during execution and review:
  - `test-driven-development`
  - `verification-before-completion`
  - `requesting-code-review`
  - `typescript-reviewer`
  - `subagent-driven-development` if the implementation remains in this session

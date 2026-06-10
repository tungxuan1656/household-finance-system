# TMA budget CRUD surfaces

## Title

Ship worker-backed TMA budget list, create, detail, edit, and delete surfaces

## Purpose / Big Picture

Add Telegram Mini App budget management backed by the existing worker budget API. Users will open the Budget shortcut from Home, choose a household context, view monthly budget cards with planned/category limits, create a new monthly household budget, open a detail page with live planned-vs-actual threshold status, edit limits, and delete obsolete budgets.

## Scope

- Add TMA budget feature files under `apps/tma/src/features/budgets`.
- Add TMA route wrappers under `apps/tma/src/routes` for `/budgets`, `/budgets/new`, and `/budgets/:id`.
- Wire route constants, lazy router entries, and Home shortcut access.
- Reuse existing worker API contracts: `GET /budgets?household_id=...`, `POST /budgets`, `GET /budgets/:id`, `GET /budgets/:id/status`, `PATCH /budgets/:id`, and `DELETE /budgets/:id`.
- Use existing household and reference-category APIs for context selection and expense category limit labels/icons.
- Add focused TMA tests for budget presentation/form payload behavior and detail loading safety.
- Update harness artifacts and progress.

Out of scope:

- Worker schema/API changes for personal budgets or first-class group budgets.
- Push/email budget notifications.
- Web UI changes.
- Real Telegram device smoke, unless authenticated launch context is available in the session.

## Non-negotiable Requirements

- TMA must not import UI or feature code from `apps/web`.
- Budget UI must be truthful to the current worker contract: real CRUD is household-scoped with `household_id`; group event budgets stay in the group feature.
- Monthly budget semantics must remain explicit. Week/year period selection must not imply non-monthly budget rows.
- Create/edit category limits must use expense categories only.
- CRUD mutations must invalidate budget, analytics, and relevant household/home reads where needed.

## Progress

- [x] 2026-06-07 Read TMA docs, shared budget specs, web budget flow, and worker budget contracts.
- [x] 2026-06-07 Confirm current worker budget API is household-scoped despite broader shared spec vocabulary.
- [x] 2026-06-07 Run GitNexus impact for shared route/path/shortcut symbols before code edits; all LOW risk.
- [x] Add failing budget presentation tests.
- [x] Implement TMA budget API/types/presentation helpers.
- [x] Add budget list, create, and detail pages with edit/delete controls.
- [x] Wire routes and Home shortcut.
- [x] Run focused verification through build; final full verification and GitNexus detect-change evidence recorded in harness/progress.

## Surprises & Discoveries

- Worker budget CRUD currently requires `householdId` on create and `household_id` on list. There is no `/budgets` contract for personal budgets or group budgets.
- Group budget semantics already exist through group `eventBudget` and group summary, not the budget API.

## Decision Log

- Decision: implement TMA budgets against current household-scoped worker budget API only.
  Rationale: User requested real API integration. Shipping personal/group budget UI without matching worker contracts would create fake or broken flows.
  Date/Author: 2026-06-07 / Codex

## Outcomes & Retrospective

- TMA now has `/budgets`, `/budgets/new`, and `/budgets/:id` surfaces backed by real worker budget CRUD/status APIs.
- Home Budget shortcut now opens the budget hub.
- The implementation preserves current household-scoped worker semantics and does not fake personal/group budget API support.
- Visual smoke in a real Telegram authenticated launch remains pending.

## Context and Orientation

- TMA shell/router: `apps/tma/src/app/router/app-router.tsx`, `apps/tma/src/lib/constants/routes.ts`, `apps/tma/src/components/shared/tma-page-shell.tsx`
- TMA existing related features: `apps/tma/src/features/groups`, `apps/tma/src/features/households`, `apps/tma/src/features/home`
- Web budget reference: `apps/web/src/features/budgets`, `apps/web/src/api/budget.ts`
- Worker budget API truth: `apps/worker/src/routes/budgets.ts`, `apps/worker/src/contracts/budget-*.ts`, `apps/worker/src/handlers/budgets/*`

## Standards and Reference Docs

- `docs/TMA.md`
- `docs/references/frontend/tma/app-structure-and-client-rules.md`
- `docs/references/frontend/tma/native-ui-and-navigation-pattern.md`
- `docs/references/frontend/tma/state-and-storage-pattern.md`
- `docs/references/frontend/tma/auth-and-bot-pattern.md`
- `apps/tma/DESIGN.md`
- `docs/product-specs/shared/budget-management.md`
- `docs/product-specs/shared/budget-notification.md`
- `docs/references/shared/type-naming-pattern.md`

Concrete coding constraints:

- TanStack Query owns budget, household, and category server data.
- Local component state owns form input formatting and feedback.
- Route changes use React Router links/navigate only.
- Detail/flow screens use existing `TmaPageShell`; no direct Telegram SDK calls from leaf budget components.
- API data types use `DTO`, request types use `Request`, and response types use `Response`.

## Plan of Work (Narrative)

First, add focused tests for pure presentation helpers: VND input parsing, period validation, budget status labels, progress clamping, and create/update payload normalization. Run the focused test to confirm it fails before adding production budget helpers.

Next, add `apps/tma/src/features/budgets/types.ts`, `api.ts`, and `presentation.ts`. The API module will expose query options/hooks and mutations for list/detail/status/create/update/delete using `get`, `post`, `patch`, and `deleteRequest`. Mutations will invalidate budget keys plus analytics/household/home reads.

Then add page components. The list page will load households, default to the first household, allow switching household, show a monthly hub card, and render budget cards sorted by newest period. The create page will require admin household context, `YYYY-MM` period, total limit, and optional category limits. The detail page will fetch budget detail and status in parallel, show planned/actual/remaining/threshold warning, render per-category status rows, and provide inline edit/delete controls. Edit will keep period immutable and patch total/category limits only.

Finally, wire `TMA_PATHS.budgets`, `TMA_PATHS.budgetsNew`, and `getBudgetDetailPath`, add lazy routes, enable the Home Budget shortcut, update harness records, run verification, and record GitNexus change detection.

## Concrete Steps (Commands)

Run from repo root:

```bash
pnpm --filter tma exec vitest run src/test/budget-presentation.test.ts
./init.sh typecheck
./init.sh lint
./init.sh test
./init.sh build
./init.sh
```

Expected short outputs:

- Focused budget test fails before helper implementation, then passes after implementation.
- `./init.sh typecheck`, `./init.sh lint`, `./init.sh test`, and `./init.sh build` print `OK`.
- Final `./init.sh` prints `Done!`.

## Validation and Acceptance

- Home Budget shortcut opens `/budgets`.
- Budget list loads only real household budgets from `/budgets?household_id=...`.
- Create budget posts `{ householdId, period, totalLimit, categoryLimits? }` and navigates to `/budgets/:id` on success.
- Detail loads `GET /budgets/:id` and `GET /budgets/:id/status`, showing planned, actual, remaining, percent used, and category statuses.
- Edit patches total/category limits and refreshes detail/status/list data.
- Delete calls `DELETE /budgets/:id`, removes the budget from active views, and returns to list.
- Empty/error/loading states are explicit and mobile-readable.

## Idempotence & Recovery

- Code, tests, and docs are safe to re-run.
- No database migration is planned.
- If the current dirty worktree conflicts in shared route files, preserve existing unrelated hunks and apply budget hunks only.

## Artifacts and Notes

- Harness updates required: `harness/feature_index.json`, `harness/features/feat-098.json`, `harness/progress.md`.
- Plan index update required: `docs/exec-plans/index.md`.
- GitNexus evidence required before final summary: `detect_changes(scope: "all")`.

## Interfaces & Dependencies

- Worker budget endpoints from `apps/worker/src/routes/budgets.ts`.
- Existing TMA API client: `apps/tma/src/lib/api/client.ts`.
- Existing TMA household query: `apps/tma/src/features/home/api.ts`.
- Existing TMA reference category query: `apps/tma/src/features/home/api.ts`.

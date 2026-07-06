# Ship TMA personal income capture MVP

## Purpose / Big Picture

Add a first-class personal income slice for the Telegram Mini App and worker so users can record money-in without faking it as an expense. Users will be able to open an `Incomes` page in TMA, review their recorded incomes, tap a button to open a one-page add-income form, and save a new income that appears back in the income list.

## Scope

- Change worker income persistence, contracts, routes, and tests under:
  - `apps/worker/migrations/0005_incomes.sql`
  - `apps/worker/src/contracts/*`
  - `apps/worker/src/db/repositories/*`
  - `apps/worker/src/handlers/incomes/*`
  - `apps/worker/src/routes/incomes.ts`
  - `apps/worker/src/index.ts`
  - `apps/worker/test/integration/*`
- Change TMA routes, API hooks, navigation, labels, and focused tests under:
  - `apps/tma/src/app/router/app-router.tsx`
  - `apps/tma/src/lib/constants/routes.ts`
  - `apps/tma/src/features/home/components/home-shortcuts-section.tsx`
  - `apps/tma/src/routes/incomes.tsx`
  - `apps/tma/src/routes/add-income.tsx`
  - `apps/tma/src/features/incomes/*`
  - `apps/tma/src/lib/i18n/locales/vi.json`
  - focused `apps/tma/src/test/*` files as needed
- Update durable product truth and planning/harness artifacts:
  - `docs/product-specs/tma/index.md`
  - `docs/product-specs/tma/income-capture.md`
  - `docs/exec-plans/index.md`
  - `harness/feature_index.json`
  - `harness/features/feat-125.json`
  - `harness/progress.md`

Out of scope:

- Web income UI or web worker clients.
- Any household-scoped or group-scoped income behavior.
- Income edit, delete, restore, detail page, summary endpoint, analytics, budget impact, health-score, or unified transaction history.
- Multiple income categories. MVP always uses `money-in`.
- Reworking existing expense flows or merging expenses/incomes into one table.

## Non-negotiable Requirements

- The plan stays self-contained and uses exact file paths, commands, and contracts.
- The worker must treat incomes as a separate persistence path, not as expenses with a special category flag.
- The worker must set `categoryKey = 'money-in'` itself and must not trust the client to choose another income category.
- The TMA add-income flow must stay a single-page form with Telegram `BottomButton` save, no 3-step wizard.
- The implementation must produce observable behavior plus verification evidence: worker integration tests, focused TMA verification, and final repo verification.

## Progress

- [x] 2026-07-06 10:35 UTC+7 — Direction locked: separate `incomes` table, fixed `money-in`, personal-only scope, single-page TMA form, no household/group.
- [x] 2026-07-06 10:50 UTC+7 — ExecPlan, plan index, and harness feature records created for `feat-125`.
- [x] 2026-07-06 — Worker income schema/contracts/routes/repositories/tests landed for `GET /api/v1/incomes` and `POST /api/v1/incomes`, including `sourceKey`, `spentByUserId`, cursor pagination, and a soft-delete regression guard.
- [x] 2026-07-06 — TMA income list, add-income form, home entrypoint, and separate income query hooks landed; post-review follow-up corrected amount rendering/save text and added load-more pagination.
- [x] 2026-07-06 — Verified focused worker/TMA checks, `./init.sh build`, and final `./init.sh`; Telegram manual QA in a real Telegram WebView was not run and remains the only noted residual risk.

## Surprises & Discoveries

- `apps/worker/migrations/` currently stops at `0004_telegram_bot_notification_deliveries.sql`, so the income table can use `0005_incomes.sql` without renumbering an existing file.
- `apps/worker/migrations/0001_init.sql` already contains the canonical `expenses` schema. The new `incomes` table should mirror the shared column names/types from that file as closely as possible to reduce future union/migration cost.
- `docs/references/frontend/tma/state-and-storage-pattern.md` says Zustand is for short-lived multi-step workflows only. Because this MVP is one route, the add-income form should use route-local state unless execution uncovers a real cross-route draft need.
- `apps/tma/src/lib/formatters.ts` already centralizes the VND `.000` helper pattern used by add/edit expense surfaces, so income should reuse those helpers instead of reintroducing raw `*1000` / `/1000` math.

## Decision Log

- Decision: Keep incomes in a dedicated `incomes` table for this MVP.
  Rationale: The user explicitly wants income and expense separated for now, and that avoids contaminating budget/expense queries with mixed semantics.
  Date/Author: 2026-07-06 / OpenAI orchestrator

- Decision: Mirror expense-like column names/types in `incomes`, but omit `household_id`, `category_id`, and group junction usage.
  Rationale: Future unification or `UNION`-style reporting becomes much cheaper when both tables line up structurally.
  Date/Author: 2026-07-06 / OpenAI orchestrator

- Decision: Server sets `categoryKey = 'money-in'`; client never sends a category picker in MVP.
  Rationale: There is only one current income category, and the repo already treats `money-in` as the canonical income catalog key.
  Date/Author: 2026-07-06 / OpenAI orchestrator

- Decision: Add-income stays one page with route-local state, not a multi-step Zustand flow.
  Rationale: This respects the TMA state-placement rules while still honoring the earlier guardrail not to reuse `useAddExpenseFlowStore`.
  Date/Author: 2026-07-06 / OpenAI orchestrator

- Decision: Add a Home shortcut entry to reach `/incomes`, but do not add a new bottom tab.
  Rationale: The feature needs a real in-app entrypoint, and `docs/product-specs/tma/app-shell-and-navigation.md` already treats non-tab finance surfaces like Expenses as secondary pages reached from shortcuts.
  Date/Author: 2026-07-06 / OpenAI orchestrator

## Outcomes & Retrospective

- Shipped a narrow but first-class personal-income slice across worker and TMA without contaminating expense persistence.
- Worker outcome: separate `incomes` table, additive authenticated `GET /api/v1/incomes` + `POST /api/v1/incomes`, strict server-owned `money-in` semantics, source-aware filters, cursor pagination, and explicit exclusion of soft-deleted rows.
- TMA outcome: Home shortcut to `/incomes`, one-page `/incomes/new` form with route-local state and Telegram `BottomButton`, dedicated income query keys, corrected stored-minor currency rendering, and list pagination beyond the worker default page size.
- Review outcome: `@oracle` caught two user-facing amount-scale bugs plus pagination risk before closeout; follow-up fixes landed before final verification.
- Residual risk: no real Telegram WebView manual QA was run for keyboard/safe-area/BottomButton feel, so runtime confidence comes from repo checks and focused tests rather than on-device interaction evidence.

## Context and Orientation

- Worker route mounting lives in `apps/worker/src/index.ts`.
- Existing expense route patterns live in `apps/worker/src/routes/expenses.ts`, `apps/worker/src/handlers/expenses/create-expense.ts`, and `apps/worker/src/handlers/expenses/list-expenses.ts`.
- Existing expense row mapping lives in `apps/worker/src/db/repositories/expense-row-mapper.ts`.
- TMA route registration lives in `apps/tma/src/app/router/app-router.tsx`.
- TMA route constants live in `apps/tma/src/lib/constants/routes.ts`.
- Existing list-entry pattern lives in `apps/tma/src/routes/expenses.tsx`.
- Existing expense step-2 UI pattern lives in `apps/tma/src/routes/add-expense-details.tsx` and shared amount helpers in `apps/tma/src/lib/formatters.ts`.
- Existing expense API invalidation pattern lives in `apps/tma/src/features/expenses/api.ts`.
- Existing TMA secondary-surface entrypoints live in `apps/tma/src/features/home/components/home-shortcuts-section.tsx`.
- Current TMA expense product truth lives in `docs/product-specs/tma/expense-capture.md`; this MVP should add a sibling `income-capture.md` instead of overloading the expense doc.

## Plan of Work (Narrative)

1. **Add worker persistence for incomes.**
   Create `apps/worker/migrations/0005_incomes.sql` with an `incomes` table that mirrors expense-style naming and types: `id`, `spent_by_user_id`, `category_key`, `source_key`, `amount_minor`, `currency_code`, `occurred_at`, `title`, `note`, `deleted_at`, `created_at`, `updated_at`, plus `kind TEXT NOT NULL DEFAULT 'income' CHECK (kind IN ('income'))`. Keep `amount_minor > 0`, default personal currency behavior, and add indexes that support user-scoped reverse-chronological list queries. Do not add `household_id`, `category_id`, or group junction data.

2. **Add worker contracts and repositories.**
   Introduce `apps/worker/src/contracts/income-schemas.ts`, `income-types.ts`, and `income.ts`, then re-export them through `apps/worker/src/contracts/index.ts`. Define:
   - `CreateIncomeRequest` with `amount`, `sourceKey`, `title`, `occurredAt`, and optional `note`.
   - `IncomeDTO` with expense-like read fields plus fixed `categoryKey`.
   - `IncomeListQuery` and `IncomeListResponse` with cursor pagination and additive filters limited to `cursor`, `limit`, `date_from`, `date_to`, `source_key`, and free-text `query`.
   Keep API fields camelCase, validation strict, and DTO/Request names aligned with `docs/references/shared/type-naming-pattern.md`.

3. **Add worker create/list flow under an `incomes` namespace.**
   Create `apps/worker/src/db/repositories/income-row-mapper.ts` and income-specific repository/query helpers. Then add `apps/worker/src/handlers/incomes/create-income.ts` and `list-incomes.ts`. `create-income.ts` must:
   - require auth
   - set `spentByUserId = currentUser.id`
   - set `currencyCode = 'VND'` for this MVP personal-only path
   - normalize/store positive `amount_minor`
   - set `categoryKey = 'money-in'` server-side
   - reject invalid source keys, invalid timestamps, or non-positive amounts with 400s
   `list-incomes.ts` must return only the current user's non-deleted incomes, ordered newest-first with stable cursor pagination.

4. **Mount additive worker routes.**
   Add `apps/worker/src/routes/incomes.ts` and mount it from `apps/worker/src/index.ts`. Route shape for MVP:
   - `POST /api/v1/incomes`
   - `GET /api/v1/incomes`
   Both use `authMiddleware`. Detail, delete, edit, and summary stay out of scope.

5. **Add worker integration coverage first-class, not as an afterthought.**
   Add `apps/worker/test/integration/incomes.spec.ts` (or split `incomes-create.spec.ts` / `incomes-list.spec.ts` if it stays cleaner) covering: happy-path create, list ordering, cursor pagination, validation failures, and unauthenticated access. Add at least one regression case asserting that `categoryKey` cannot be client-overridden away from `money-in`.

6. **Add TMA route constants and router entries.**
   Extend `apps/tma/src/lib/constants/routes.ts` with `incomes` and `incomesNew`, then register `apps/tma/src/routes/incomes.tsx` and `apps/tma/src/routes/add-income.tsx` in `apps/tma/src/app/router/app-router.tsx`. Keep navigation SPA-only. Non-root routes must own Telegram `BackButton` cleanup correctly.

7. **Add TMA income API hooks and types with separate cache keys.**
   Create `apps/tma/src/features/incomes/types.ts` and `api.ts`. Use separate query keys such as `INCOME_KEYS.all`, `INCOME_KEYS.list`, and invalidate them without piggybacking on `['expenses']`. The create mutation should invalidate only income surfaces plus any explicit home shortcut surface that displays income counts if execution adds one.

8. **Build the TMA income list page as a sibling, not an expense fork.**
   Implement `apps/tma/src/routes/incomes.tsx` using the structural pattern from `apps/tma/src/routes/expenses.tsx`: header, list state handling, add button/FAB, and worker-backed data. Keep the scope personal-only: no household/group filters, no expense filter route reuse, no expense query keys. Render each row with the fixed `money-in` category presentation and amount/date/title/source summary.

9. **Build the TMA add-income page as one page that visually reuses expense step 2.**
   Implement `apps/tma/src/routes/add-income.tsx` using route-local form state plus Telegram `BottomButton` save behavior. Reuse the same visual ideas from `apps/tma/src/routes/add-expense-details.tsx`: date input, amount input with existing VND helper behavior, title, source picker, validation messaging, and save loading state. Do not add category, household, or group fields. On success, reset the local draft, navigate back to `/incomes`, and surface success haptic/feedback consistent with current TMA patterns.

10. **Add a real TMA entrypoint.**
    Update `apps/tma/src/features/home/components/home-shortcuts-section.tsx` to add an `Incomes` shortcut that navigates to `/incomes`. Do not add a fourth bottom tab. If the Home shortcut component structure makes this awkward, keep the change minimal and local rather than refactoring shared navigation.

11. **Add copy/spec/harness updates so repo truth matches runtime truth.**
    Add `docs/product-specs/tma/income-capture.md` and link it from `docs/product-specs/tma/index.md`. The doc should describe the one-page personal-income flow, fixed `money-in`, and no household/group semantics. Update `harness/feature_index.json`, `harness/features/feat-125.json`, and `harness/progress.md` during implementation closeout with real evidence.

## Concrete Steps (Commands)

Run from repo root unless noted.

```bash
# worker-focused income integration tests while building the backend slice
pnpm --filter worker exec vitest run test/integration/incomes.spec.ts
```

Expected short output:

```text
✓ test/integration/incomes.spec.ts (...)
```

```bash
# focused TMA tests for the new routes/helpers if added
pnpm --filter tma exec vitest run src/test/incomes*.test.ts src/test/add-income*.test.ts
```

Expected short output:

```text
✓ ... income route/helper tests passed
```

```bash
# repo-standard targeted checks during implementation
./init.sh typecheck
./init.sh lint
./init.sh build
```

Expected short output:

```text
OK
OK
OK
```

```bash
# final repo verification before claiming done
./init.sh
```

Expected short output:

```text
Done!
```

## Validation and Acceptance

- **Worker create happy path:** authenticated `POST /api/v1/incomes` with `{ amount, sourceKey, title, occurredAt }` returns HTTP 200 success envelope whose `data.categoryKey === 'money-in'`, `data.spentByUserId` matches the authenticated user, and `data.amountMinor > 0`.
- **Worker list happy path:** authenticated `GET /api/v1/incomes` returns only the caller's incomes in newest-first order with stable `nextCursor` behavior.
- **Worker validation:** non-positive amount, invalid source key, invalid occurredAt, or unauthorized request returns correct 4xx errors and never creates rows.
- **Client override regression:** sending a category field from the client, or attempting to coerce a non-income category, does not change the saved `categoryKey`; the server keeps `money-in`.
- **TMA add flow:** user can open `/incomes`, tap add, fill date/amount/title/source, save via `BottomButton`, and land back on `/incomes` with the new row visible.
- **TMA navigation:** `BackButton` appears on `/incomes/new`, disappears on `/incomes`, and route changes happen without WebView reload.
- **TMA manual QA:** confirm keyboard overlap, safe-area padding, and `BottomButton` position on a Telegram-like mobile WebView path, because this flow adds another money-entry form.

## Idempotence & Recovery

- Route/code/test edits are safe to re-run.
- The migration file itself is additive and should be applied once per database. Re-running the same migration name in the same D1 environment should be treated as a no-op by the migration runner, not as a reason to edit the file after release.
- If local migration work needs reset during development, rebuild the local DB from the committed migration set rather than hand-editing applied migration history.
- If the income schema proves wrong before release, prefer a new additive fix migration instead of rewriting an already-applied migration in shared environments.

## Artifacts and Notes

- Acceptance artifact target: one worker integration test file covering create/list semantics, plus focused TMA test output or documented manual QA evidence for `BottomButton`/navigation behavior.
- Harness closeout must record the actual verification commands and outcomes, not only intentions.
- If implementation uncovers a real need for persisted draft state, record that direction change in this plan before adding any Zustand income store.

## Interfaces & Dependencies

- **Worker auth boundary:** `authMiddleware` on `/api/v1/incomes` must gate all reads/writes.
- **Reference data dependency:** `money-in` and source keys come from the existing reference-data catalog introduced by `feat-016`.
- **Shared naming contract:** use `IncomeDTO`, `CreateIncomeRequest`, `IncomeListResponse`, and `ApiResponse<...>` style naming.
- **TMA navigation contract:** all route changes stay inside `React Router`; `BackButton` and `BottomButton` are owned by the route shell, not by leaf form controls.
- **Formatting dependency:** reuse `apps/tma/src/lib/formatters.ts` for VND helper behavior instead of duplicating numeric conversion logic.
- **Docs dependency:** new income UX truth belongs in `docs/product-specs/tma/income-capture.md`; it should not be shoved into the expense-capture doc.

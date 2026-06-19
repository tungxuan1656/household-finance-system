# Session: 2026-06-19 — TMA expenses list: React Query infinite pagination + /expenses/summary

## Scope

Replace the TMA expenses auto-fetch-all experiment with React Query infinite pagination (`useInfiniteQuery`) and a true period-filtered summary from `/expenses/summary`.

## Changes

### Removed auto-fetch-all machinery

* `apps/tma/src/features/home/api.ts`
  * Removed `EXPENSE_LIST_MAX_PAGE_SIZE`, `FullExpenseListParams`, `listAllExpenses`, `EXPENSE_KEYS.fullList`, `fullExpenseListQueryOptions`, and `useFullExpenseListQuery`.
  * Added `getExpenseSummary(params?)` calling `GET /expenses/summary`.
  * Added `EXPENSE_KEYS.summary` and `EXPENSE_KEYS.infiniteList` query keys.
  * Added `expenseSummaryQueryOptions(params?)` using `queryOptions`.
  * Added `expenseListInfiniteQueryOptions(params?)` — uses `infiniteQueryOptions` pattern with `initialPageParam: undefined`, `queryFn` that passes `cursor`, and `getNextPageParam` returning `lastPage.nextCursor ?? undefined`.
  * Added `useExpenseSummaryQuery(params?)` and `useExpenseListInfiniteQuery(params?)` custom hooks.

### Updated types

* `apps/tma/src/features/home/types.ts` — added `ExpenseSummaryDTO` (`totalSpendMinor`, `expenseCount`, `currencyCode`).

### Refactored ExpenseSummaryCard

* `apps/tma/src/components/finance/expense-summary-card.tsx`
  * Accepts `summary?: ExpenseSummaryDTO` instead of `expenses: ExpenseDTO[]`.
  * Reads `totalSpendMinor`, `currencyCode`, and `expenseCount` from the API summary response.
  * Returns `null` when no summary or zero expenses.

### Rewired ExpensesPage route

* `apps/tma/src/routes/expenses.tsx`
  * Uses `useExpenseListInfiniteQuery(queryParams)` with `limit: 50` + active filters.
  * Uses `useExpenseSummaryQuery(summaryParams)` with filters but no `limit`/`sort`.
  * Flattens loaded pages via `useMemo`: `data?.pages.flatMap(page => page.items) ?? []`.
  * Passes `<ExpenseSummaryCard summary={summaryQuery.data} />`.
  * Adds load-more button below timeline when `expensesQuery.hasNextPage`; disabled while `isFetchingNextPage`. Labels are i18n-driven.

### i18n

* `apps/tma/src/lib/i18n/locales/vi.json` — added `expenses.loadMore` and `expenses.loadingMore`.

### Test coverage

* `apps/tma/src/test/expense-list-api.test.ts`
  * Rewrote to cover `expenseSummaryQueryOptions.queryFn()` → `GET /expenses/summary`.
  * Covers `expenseListInfiniteQueryOptions.queryFn()` with `pageParam → cursor`.
  * Covers `getNextPageParam` returning `nextCursor` or `undefined`.

## Verification

- `./init.sh typecheck` — passed.
- `./init.sh lint` — passed.
- `./init.sh test` — passed.

## Decision log

- Infinite pagination replaces the experiment that fetched all pages eagerly. The list now loads the first page (50 items) and offers a "load more" button.
- Summary endpoint `/expenses/summary` provides true aggregated totals for the active filter period, matching what the backend projects.
- `group_id` is already singular; no additional fix needed.

## Commit

None. User did not request.

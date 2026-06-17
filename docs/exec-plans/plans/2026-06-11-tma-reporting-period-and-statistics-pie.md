# TMA reporting period and statistics pie

## Title

Refine TMA reporting filters and statistics breakdown

## Purpose / Big Picture

Make TMA reporting ranges easier to understand and reuse across Home, household summaries, statistics, and the expense list. Users will see compact wrapable chips for common periods, keep monthly budgets separate, and read statistics as a category pie chart with percentage legends for the selected reporting period.

## Scope

- Change TMA period helpers, labels, store defaults, picker UI, and related tests under `apps/tma/src/lib/period.ts`, `apps/tma/src/features/period/*`, and `apps/tma/src/test/*`.
- Change the TMA expense-list filter page under `apps/tma/src/features/expenses/pages/expense-filter-page.tsx` to use the same reporting presets plus custom date range.
- Change the TMA statistics route under `apps/tma/src/routes/statistics.tsx` to use the shared selected reporting period and render a pie/donut chart plus category legend percentages.
- Keep budget period semantics monthly only in finance summary and budget surfaces.
- Update harness records and progress evidence for this follow-up slice.

Out of scope:

- Worker API contract changes. Existing analytics `date_from` / `date_to` support remains the contract.
- Web app reporting UI.
- Persisting reporting period across app restarts.
- New chart library dependency; use lightweight CSS/SVG in TMA.
- Budget periods other than monthly.

## Non-negotiable Requirements

- Reporting period presets are exactly: `Tháng này`, `Tháng trước`, `Tuần này`, `Tuần trước`, `Năm nay`, `Năm ngoái`, plus custom `Từ ngày -> đến ngày`.
- The default reporting period is `Tháng này`.
- Expense list filters use the same date-range semantics as reporting period helpers.
- Statistics totals, pie slices, legend amounts, and percentages must all describe the same selected reporting period.
- Budget UI must not imply weekly or yearly budgets.

## Progress

- [x] 2026-06-11 Create plan and feature record.
- [x] 2026-06-11 Run GitNexus impact checks for period, picker, expense filter, summary, and statistics symbols.
- [x] 2026-06-11 Add failing period helper tests for preset/default/custom labels.
- [x] 2026-06-11 Add failing statistics test for shared period query and pie/legend output.
- [x] 2026-06-11 Implement shared reporting presets and update period picker UI.
- [x] 2026-06-11 Update expense-list date filter to use shared presets plus custom date range.
- [x] 2026-06-11 Rebuild Statistics around shared period, pie chart, and legend percentages.
- [x] 2026-06-11 Run focused verification, repo verification as needed, GitNexus detect changes, and harness progress updates.

## Surprises & Discoveries

- The previous `feat-096` period feature is complete and uses week/month/year tabs; this follow-up replaces that interaction with user-facing preset chips and custom date range.
- GitNexus impact checks for the edited TMA period/picker/filter/statistics/summary symbols returned LOW or no indexed upstream impact. Ambiguous route lazy-wrapper names required source-file inspection for `ExpenseFilterPage` and `StatisticsPage`.

## Decision Log

- Decision: create `feat-099` instead of reopening completed `feat-096`.
  Rationale: `feat-096` is historical completed work; this is a behavior/UI follow-up with different acceptance criteria.
  Date/Author: 2026-06-11 / Codex
- Decision: keep the implementation TMA-only.
  Rationale: worker analytics already accepts concrete timestamp ranges, which is sufficient for all requested presets and custom ranges.
  Date/Author: 2026-06-11 / Codex

## Outcomes & Retrospective

- TMA reporting period now defaults to `Tháng này` and supports the requested current/previous month, week, year presets plus custom date-from/date-to ranges.
- The period picker now uses wrapable chips and custom date inputs instead of tabbed week/month/year selection.
- Expense-list date filtering now reuses the same reporting preset semantics.
- Statistics now reads the shared selected reporting period and renders a selected-period category pie/donut chart plus amount/percentage legend.
- Budget period semantics remain monthly; no worker API or budget schema change was needed.

## Context and Orientation

- Shared TMA period helpers: `apps/tma/src/lib/period.ts`
- Shared period state: `apps/tma/src/features/period/store.ts`
- Period picker route UI: `apps/tma/src/features/period/pages/period-picker-page.tsx`
- Period chip entrypoint: `apps/tma/src/features/period/components/period-chip-link.tsx`
- Expense list filter: `apps/tma/src/features/expenses/pages/expense-filter-page.tsx`
- Finance summary: `apps/tma/src/features/finance/components/summary.tsx`
- Statistics route: `apps/tma/src/routes/statistics.tsx`
- Existing focused tests: `apps/tma/src/test/period.test.ts`, `apps/tma/src/test/period-store-and-picker.test.tsx`

## Standards and Reference Docs

- `docs/TMA.md`
- `docs/references/frontend/tma/app-structure-and-client-rules.md`
- `docs/references/frontend/tma/native-ui-and-navigation-pattern.md`
- `docs/references/frontend/tma/state-and-storage-pattern.md`
- `apps/tma/DESIGN.md`
- `docs/product-specs/shared/analytics-overview.md`
- `docs/product-specs/shared/expense-querying.md`
- `docs/product-specs/shared/budget-management.md`

Concrete coding constraints:

- Use SPA navigation only through React Router.
- Keep TanStack Query as worker-backed data owner and Zustand as selected reporting-period UI state.
- Keep period helper logic pure and unit-tested.
- Use Tailwind utility composition and existing TMA UI primitives; do not add CSS component classes.
- Keep chart rendering light enough for a Telegram mobile WebView.

## Plan of Work (Narrative)

First, add tests that define the new reporting period contract: current/previous month, current/previous week, current/previous year, and custom ranges. The helper API should return concrete `[dateFrom, dateTo)` timestamp ranges and human labels that work both as compact chips and full range text. The store should default to current month.

Next, replace the current tabbed week/month/year picker with a chip grid of requested presets using `flex flex-wrap`, plus two date inputs for custom `Từ ngày` and `Đến ngày`. The picker will still use Telegram BottomButton confirmation before mutating the global store. Expense-list filtering will reuse the same preset options and custom range path, but will leave non-date filters local to the expense filter store.

Finally, rework Statistics so it consumes `usePeriodStore`, requests analytics with `date_from` / `date_to`, displays one selected-period total, renders a donut/pie category breakdown, and lists legend rows with category label, amount, and percent. Remove the old day/week/month/year segmented control because it does not match the new selected reporting-period model.

## Concrete Steps (Commands)

Run from repo root:

```bash
pnpm --filter tma exec vitest run src/test/period.test.ts src/test/period-store-and-picker.test.tsx
pnpm --filter tma exec vitest run src/test/statistics-page.test.tsx
./init.sh typecheck
./init.sh lint
./init.sh test
./init.sh build
./init.sh
```

Expected short outputs:

- The focused tests fail during the RED phase for missing helper/statistics behavior, then pass after implementation.
- `./init.sh typecheck`, `./init.sh lint`, `./init.sh test`, and `./init.sh build` print `OK`.
- Final `./init.sh` prints `Done!`.

## Validation and Acceptance

Happy path:

- Home opens with `Tháng này` selected by default.
- Period picker shows requested presets as wrapable chips and a custom date-from/date-to area.
- Choosing `Tuần trước`, confirming, and returning updates Home/household/statistics queries with matching `date_from` / `date_to`.
- Expense list filter offers the same requested date presets and custom date range.
- Statistics shows a selected-period total, a pie/donut category chart, and legend rows with percentages that sum from the same selected period.

Regression checks:

- Monthly budget progress still renders only when the selected period is a month.
- Non-month selections do not show misleading budget progress.
- Existing expense sort/household/category filters still work.
- TMA navigation remains SPA-only and BottomButton cleanup still happens on picker unmount.

## Idempotence & Recovery

- Code and test steps are safe to rerun.
- No migration or destructive operation is planned.
- If the statistics chart introduces layout or performance issues, fallback is to keep the same data model and render legend-only rows while the chart UI is revised.

## Artifacts and Notes

- Harness updates required: `harness/feature_index.json`, `harness/features/feat-099.json`, `harness/progress.md`.
- Plan index update required: `docs/exec-plans/index.md`.
- Final summary must include focused test output, repo verification status, and GitNexus change-detection risk.
- Focused TMA verification passed: `pnpm --filter tma exec vitest run src/test/period.test.ts src/test/period-store-and-picker.test.tsx src/test/statistics-page.test.tsx src/test/period-chip-entrypoints.test.tsx`.
- Repo verification passed: `./init.sh typecheck`, `./init.sh lint`, `./init.sh test`, `./init.sh build`, and final `./init.sh` returned `OK` / `Done!`.
- Harness/doc checks passed: `jq empty harness/feature_index.json harness/features/feat-099.json`, `git diff --check`, and `./scripts/check_harness_size.sh`.
- Final GitNexus detect changes reported `critical` risk with 97 changed symbols, 36 affected symbols/processes, and 10 indexed changed files. The affected processes are concentrated in the expected TMA period picker, finance summary period helper flow, household list/preview period helper flow, expense filter, and Statistics analytics flow.

## Interfaces & Dependencies

- Existing analytics endpoints: `GET /api/v1/analytics/overview` and `GET /api/v1/analytics/comparison` with `date_from`, `date_to`, optional `household_id`.
- Existing TMA query hooks: `apps/tma/src/features/home/api.ts`.
- Existing Telegram BottomButton wrapper: `apps/tma/src/lib/telegram/bottom-button.ts`.
- Existing category presentation helper: `apps/tma/src/features/home/presentation.ts`.

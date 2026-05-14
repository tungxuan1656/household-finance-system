# Home Category Chart Refactor

## Purpose / Big Picture

Refactor the Home overview category statistics widget so users see top spending categories as a donut chart plus a scannable value list below it. The widget keeps existing analytics and reference-data contracts, but presents each category with color, percentage, amount, and expense count in a more visual Recharts-based layout.

## Scope

- Change `apps/web/src/components/home/category-breakdown.tsx` from progress-only rows to a Recharts `PieChart`/`Pie` donut card with a list/legend below.
- Keep `apps/web/src/views/app/overview/overview-category-statistics-section.tsx` as the smart query wrapper.
- Add or adjust source-contract coverage in `apps/web/src/components/home/home-card-composition.test.ts` without adding component/page render tests.
- Update harness artifacts for this frontend-only UI refactor.
- Out of scope: backend analytics contract changes, new shadcn chart component installation, new filters, new translations beyond current labels, and changing `/insights` charts.

## Non-negotiable Requirements

- Use existing `recharts` dependency already present in `apps/web/package.json`.
- Use current `DataState` for loading/empty/error handling.
- Use existing category presentation from `getCategoryPresentation` and existing `formatCurrency` helper.
- Preserve accessibility with a screen-reader summary and `role='img'`/`aria-label` around the chart.
- Follow `docs/FRONTEND.md`: no component/page render tests in `apps/web`; use source-contract or pure helper tests plus manual/browser evidence for UI.

## Required Standards / Reference Docs

- `docs/FRONTEND.md`: mobile-first layout, shadcn primitives, state coverage, no render tests.
- `docs/references/frontend/component-structure-pattern.md`: Home view remains thin; smart wrapper owns query; dumb card receives data props.
- `.agents/skills/shadcn/rules/styling.md`: use semantic tokens, `gap-*`, `size-*`, and avoid raw Tailwind status colors; Recharts fill values may use category metadata colors because they are data-driven chart values.

## Progress

- [x] User selected Approach B: Recharts/shadcn-style chart composition.
- [x] Run GitNexus upstream impact for `CategoryBreakdown` before editing; risk LOW, 0 impacted symbols/processes.
- [x] Add a failing source-contract test for the Home category chart composition.
- [x] Refactor `CategoryBreakdown` to Recharts donut + list.
- [x] Verify focused test, lint/typecheck/test/full init, review, and harness artifacts.

## Surprises & Discoveries

- `apps/web/package.json` already includes `recharts@^3.8.1`.
- No `apps/web/src/components/ui/chart.tsx` exists, so the implementation will use Recharts directly like `apps/web/src/components/analytics/insights-charts-section.tsx` instead of adding a new shadcn Chart primitive.
- Focused Home source-contract test failed RED on the missing `from 'recharts'` import, then passed after the chart refactor.

## Decision Log

- Decision: Use Recharts directly for the Home widget.
  Rationale: The dependency is already installed and `/insights` already uses direct Recharts imports; no new registry component or dependency is needed.
  Date/Author: 2026-05-14 / Orchestrator.

## Outcomes & Retrospective

- Completed Home category statistics as a Recharts donut chart with category colors, center total, accessible chart summary, and a bottom value list showing labels, amounts, percentages, and expense counts.
- Focused source-contract test passed after RED/GREEN; `./init.sh lint`, `./init.sh typecheck`, `./init.sh test`, and full `./init.sh` passed.
- Oracle review found one medium accessibility issue, fixed by connecting the hidden summary with `aria-describedby`; no blocking issues remain.

## Context and Orientation

- `apps/web/src/views/app/overview-page.tsx` composes the `/home` page widgets and delegates category statistics to `OverviewCategoryStatisticsSection`.
- `apps/web/src/views/app/overview/overview-category-statistics-section.tsx` fetches analytics overview and reference categories, then passes data into `CategoryBreakdown`.
- `apps/web/src/components/home/category-breakdown.tsx` currently renders a card of category rows and `Progress` bars.
- `apps/web/src/components/analytics/insights-charts-section.tsx` is the existing direct Recharts usage reference.

## Plan of Work (Narrative)

1. Run `gitnexus_impact` for `CategoryBreakdown` to understand upstream dependents before editing.
2. Update `apps/web/src/components/home/home-card-composition.test.ts` with a source-contract test that expects the Home category component to import Recharts primitives, use `PieChart`/`Pie`/`Cell`/`ResponsiveContainer`, include a chart `role='img'`, and still expose list rows with `%`/currency formatting.
3. Run the focused Vitest command and confirm the new test fails because `CategoryBreakdown` still uses `Progress` only.
4. Refactor `apps/web/src/components/home/category-breakdown.tsx`:
   - import `Cell`, `Pie`, `PieChart`, `ResponsiveContainer`, and `Tooltip` from `recharts`.
   - derive `chartCategories` with label, color, percent, amount, count, and category key.
   - compute `totalSpendMinor` for chart center text and screen-reader summary.
   - render `CardHeader`, chart area, center overlay total, and bottom list/legend.
   - remove progress bars from successful state.
5. Run focused test again and make the minimum changes needed for green.
6. Run `./init.sh lint`, `./init.sh typecheck`, and `./init.sh test` as scoped verification; run full `./init.sh` before final completion claim if time allows.
7. Update harness feature evidence and `harness/progress.md`; run `gitnexus_detect_changes(scope: "all")` before final summary.

## Concrete Steps (Commands)

Run from repo root `/Users/tungdoan/Projects/Web/household-finance-system`:

```bash
pnpm --filter web exec vitest run src/components/home/home-card-composition.test.ts
```

Expected RED first: one source-contract assertion fails because `CategoryBreakdown` has not yet imported or rendered Recharts.

```bash
./init.sh lint
./init.sh typecheck
./init.sh test
./init.sh
```

Expected after implementation: each explicit command prints `OK`; full `./init.sh` prints `Done!`.

## Validation and Acceptance

- Home category statistics card displays a donut chart for `topCategories` with category-derived colors.
- Under the chart, each row shows color marker, category label, formatted amount, percent, and expense count.
- Empty/loading/error behavior remains handled by `DataState`.
- `apps/web/src/components/home/home-card-composition.test.ts` passes and documents the chart composition contract.
- Focused lint/typecheck/test pass; final full repo verification passes or any blocker is recorded.

## Idempotence & Recovery

- The code/test edits are safe to re-run and revert with Git.
- No database migrations, generated files, or destructive operations are involved.
- If Recharts typings fail, fall back to the known working import and prop patterns in `apps/web/src/components/analytics/insights-charts-section.tsx`.

## Artifacts and Notes

- Acceptance artifact: focused Vitest transcript for `src/components/home/home-card-composition.test.ts` red then green.
- Final evidence: `./init.sh lint`, `./init.sh typecheck`, `./init.sh test`, `./init.sh`, and `gitnexus_detect_changes(scope: "all")` outputs summarized in harness progress.

## Interfaces & Dependencies

- Internal DTO: `AnalyticsTopCategoryDTO` with `categoryKey`, `totalSpendMinor`, `percentOfTotal`, and `expenseCount`.
- Internal reference data: `ReferenceCategoryDTO[]` consumed by `getCategoryPresentation` for label/color.
- External library: `recharts` direct imports, already used by `/insights`.

## Risks / Blockers

- Recharts SVG labels/tooltips can be cramped on mobile; mitigate with fixed height, responsive container, and detailed list below.
- Data-driven category colors may not map perfectly to semantic tokens; acceptable for chart visualization because colors come from reference category metadata.
- No component render tests by project rule, so final visual validation should be manual/browser evidence if exact screenshots are required.

# feat-131 - Migrate TMA DataState to QueryState (statistics-page)

## Goal

Migrate `apps/tma/src/features/home/pages/statistics-page.tsx` từ `DataState` (@deprecated) sang `QueryState`, đồng thời fix layout mobile-first (spacing, wrapper, card grouping) và tách nested queries thành components con tái sử dụng.

## Scope

- Thay `DataState` duy nhất còn lại ở `statistics-page.tsx:95` bằng `QueryState` với `query={overviewQuery}`, `isEmpty={(data)=>data.expenseCount===0}`, `pending/empty/error` props.
- Fix `TmaPageShell` layout: thêm `contentClassName="flex flex-col gap-4"`, xóa `mb-3/mt-6/section` wrapper, bỏ `overview ? <>...</> : null` (QueryState đã narrow data).
- Tách `statistics-page.tsx` (~300 dòng) thành components con trong `apps/tma/src/features/home/components/`:
  - `statistics-total-card.tsx` (hero totalSpend + period label)
  - `statistics-period-toggle.tsx` (ToggleGroup day/week/month/year + PeriodChipLink)
  - `category-breakdown-card.tsx` (pie + legend, tự quản `comparisonQuery`/`categoriesQuery` via nested QueryState plain nếu cần)
  - `statistics-meta-card.tsx` (expenseCount + dateRange gộp)
  - Hoặc gộp lại nếu file nhỏ, nhưng mỗi component <100 dòng, không dính margin ngoài.
- Nested API: `overviewQuery` (main) + `comparisonQuery` + `categoriesQuery` phải cô lập. `comparisonQuery`/`categoriesQuery` không block toàn page, render skeleton/empty riêng trong card con (tham khảo `budget-list-page.tsx:325` nested QueryState).
- Đồng bộ typography: bỏ `eyebrowClassName`/`moneyClassName` one-off, dùng `CardTitle`/`CardDescription` + `font-mono [font-variant-numeric:tabular-nums]` chuẩn.
- Không xóa `data-state.tsx` ngay (giữ deprecated cho 1 version), nhưng xóa import khỏi statistics-page. Update `data-state.test.ts` giữ nguyên hoặc mark deprecated.

## Non-goals

- Không xóa `apps/tma/src/components/shared/data-state.tsx` và `apps/web/src/components/shared/data-state.tsx` (web vẫn dùng riêng).
- Không đổi API contract `useAnalyticsOverviewQuery`/`useAnalyticsComparisonQuery`/`useReferenceCategoriesQuery`.
- Không thêm `TmaPageFooter` cho statistics (page không có CTA form).
- Không refactor các page khác (household-detail, group-list...) dù có layout issues tương tự - chỉ làm mẫu cho statistics.

## Acceptance

- [x] `statistics-page.tsx` không còn import `DataState`, chỉ import `QueryState` với `query={overviewQuery}` và `isEmpty` function.
- [x] `TmaPageShell` dùng `contentClassName="flex flex-col gap-4"` (hoặc `gap-4` gọn), không còn `mb-3`/`mt-6`/`section` wrapper trong children.
- [x] Page tách thành >=3 components con trong `features/home/components/`, mỗi component quản lý spacing nội bộ bằng `gap-*`/`px-*` không leak margin, typography đồng bộ.
- [x] `comparisonQuery` và `categoriesQuery` được cô lập: không block loading toàn page, có skeleton/empty riêng (hoặc `variant="plain"` nested QueryState).
- [x] `pnpm --filter tma lint` (0 errors), `pnpm --filter tma typecheck` (0), `pnpm --filter tma test` pass, `pnpm --filter tma build` pass.
- [x] `git diff --check` clean, không còn `DataState` usage trong `apps/tma/src/features`.

## Relevant docs

- `apps/tma/src/components/shared/query-state.tsx`
- `apps/tma/src/components/shared/tma-page-shell.tsx`
- `apps/tma/src/components/shared/data-state.tsx` (deprecated)
- `docs/WEB.md` / `docs/TMA.md` (nếu cần)

## Plan

<!-- Bounded (default): 1-3 files, 1 workspace, <200 lines. Substantial: >=4 files or >=2 workspaces, DB migration/breaking API, or needs phases/rollback -> use docs/plans/feat-131.md (needs >=2 substantial signals). -->

1. Inventory: đọc `statistics-page.tsx`, `query-state.tsx`, `tma-page-shell.tsx`, `useAnalyticsOverviewQuery` types, `period-store`, `presentation` helpers.
2. Tạo 3-4 components con (total, period-toggle, category-breakdown, meta) với Tailwind `gap-*` chuẩn, không margin ngoài.
3. Refactor `statistics-page.tsx`: thay `DataState` -> `QueryState`, truyền `overviewQuery` trực tiếp, dùng `contentClassName`, render children `(overview)=> <>...components...</>`.
4. Cô lập nested queries: `CategoryBreakdownCard` tự gọi `comparisonQuery`/`categoriesQuery` và bọc `QueryState variant="plain"` cho từng phần (pie/legend/comparison label).
5. Verify: `lint`, `typecheck`, `test`, `build`, `git diff --check`, grep `DataState` còn 0 trong features.

## Verify

- `pnpm --filter tma lint`
- `pnpm --filter tma typecheck`
- `pnpm --filter tma test`
- `pnpm --filter tma build`
- `./init.sh` (worker build skip)
- `grep -r "DataState" apps/tma/src/features` == 0

## Handoff

- Handoff owns recovery for this feature; do not create a separate recovery file.
- State: done
- Evidence: `statistics-page.tsx` 62 dòng (từ 300): `TmaPageShell contentClassName='flex flex-col gap-4'` + `QueryState query={overviewQuery} isEmpty={(d)=>d.expenseCount===0} pending/empty/error` với `PeriodChipLink` action; tách 4 components con `statistics-total-card.tsx` (hero + Skeleton cho comparisonQuery), `statistics-period-toggle.tsx` (flex justify-between gap-3, ToggleGroup), `category-breakdown-card.tsx` (pie + nested QueryState variant plain cho categoriesQuery), `statistics-meta-card.tsx` (grid-cols-2). Verify: `pnpm --filter tma typecheck` pass, `lint` 0 errors 15 warnings, `test` 31 files 162 tests pass, `build` 2226 modules 217.52kB gzip, `grep DataState apps/tma/src/features` 0, `git diff --check` clean.
- Blockers: none
- Next: none — feature closed. Giữ `data-state.tsx` deprecated cho 1 version, web vẫn dùng riêng.

<!-- harness-slim 1.4.0 · generated 2026-08-21 -->

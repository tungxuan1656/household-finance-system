# Progress Log

## 2026-06-17 — TMA household invitation via Telegram Mini App deep links

- Who: MiniMax-M3 (orchestrator) + 7 parallel fixers
- Summary: Built the household invitation flow in the TMA. Chosen mechanism: Mini App deep links `https://t.me/<bot>?startapp=<token>` because they open the TMA directly with zero bot interaction and deliver the token through `initData.start_param`. The dialog offers two share affordances — `shareURL` (Telegram native chat picker) and clipboard copy as fallback. Recipients are routed to `/invitations/:token` on cold open via a `useInvitationDeepLinkRedirect` hook wired into RootLayout. Backend invitations were already complete; this feature is TMA-only.
- Files changed: New `apps/tma/src/features/invitations/` folder (types, API, hooks, components/invite-household-dialog.tsx, pages/accept-invitation-page.tsx, index barrel); `apps/tma/src/lib/constants/routes.ts` (`invitations` path + `getInvitationAcceptPath`); `apps/tma/src/app/router/app-router.tsx` (lazy route); `apps/tma/src/app/router/root-layout.tsx` (deep-link redirect); `apps/tma/src/features/households/pages/household-detail-page.tsx` (admin invite section); `apps/tma/src/lib/i18n/locales/vi.json` (invitations section).
- Verification: `./init.sh lint` OK; `./init.sh typecheck` OK (fixed shareURL `.catch()` error by wrapping in `Promise.resolve()`); `./init.sh test` OK; `pnpm --filter tma build` OK; full `./init.sh` returned `Done!`. New feature recorded as `feat-104`.
- Blockers: None. Requires `VITE_TELEGRAM_BOT_USERNAME` env var; dialog falls back to plain invite path when missing.
- Next steps: Set `VITE_TELEGRAM_BOT_USERNAME` in `apps/tma/.env.local` to enable deep-link sharing; optional follow-up: bot-side `/start <token>` fallback for users without the Mini App installed.

## 2026-06-17 — TMA version display label on home, not-found, and fatal-launch screens

- Who: Codex
- Summary: Added a faint, centered app-version label (`v1.0.1`) to three TMA surfaces: Home (bottom of scrollable content), Not Found (below centered message), and Fatal Launch Screen (below action buttons). Bumped `apps/tma/package.json` version from `0.0.1` to `1.0.1`. Created a reusable `AppVersionLabel` component that reads the version via Vite JSON import from `package.json`. No new i18n keys added; visible text is universal `v{version}` with a Vietnamese `aria-label` for screen readers.
- Files changed: `apps/tma/package.json`; new `apps/tma/src/components/shared/app-version-label.tsx`; `apps/tma/src/routes/home.tsx`; `apps/tma/src/routes/not-found.tsx`; `apps/tma/src/features/auth/fatal-launch-screen.tsx`.
- Verification: Full `./init.sh` returned `Done!` (install/harness/lint/typecheck/test).
- Blockers: None.
- Next steps: Commit, push, open PR.

## Template for future entries
- Date: YYYY-MM-DD
- Who: <name>
- Summary: <short summary>
- Files changed: <The description lists the changed files, without listing the file names.>
- Blockers: <list or none>
- Next steps: <next actions>

## 2026-06-17 — Consolidate worker D1 migrations into single canonical schema

- Who: Codex
- Summary: Folded the two additive worker migrations (`0002_household_avatar.sql`, `0003_personal_budgets.sql`) into `0001_init.sql` as a single canonical schema. Rationale: project is pre-release and has no deployed instance, so there is no migration history to preserve. `households.avatar_url` is now part of the initial `households` definition (no ALTER step); `budgets` and `budget_limits` use their final shapes from the start (`budgets` has `owner_user_id` + `'personal'` scope + scope-driven CHECK; `budget_limits` has nullable `household_id`); the two new indexes (`idx_budgets_owner_scope_month`, `idx_budgets_owner_user_id`) are included. Test helper `applyMigrations.ts` already glob-reads `migrations/*.sql` and orders by numeric prefix, so the single file applies unchanged. Worker README updated to record that pre-release additive changes fold into `0001_init.sql` until the first deploy/release, then split into ordered follow-up migrations.
- Files changed: `apps/worker/migrations/0001_init.sql` (rewrite); deleted `apps/worker/migrations/0002_household_avatar.sql` and `apps/worker/migrations/0003_personal_budgets.sql`; `apps/worker/README.md` (D1 migrations section).
- Verification: `./init.sh lint` OK; `pnpm --filter worker typecheck` OK (no errors); `pnpm --filter worker test` OK (416 tests across 80 files, including `test/integration/budgets-personal.spec.ts` 8/8 and `test/integration/households-read-update.spec.ts` 8/8 which exercise the folded-in `avatar_url` and personal-budget shapes); full `./init.sh` returned `Done!`.
- Blockers: None. Historical references to the old migration filenames in `harness/progress.md`, `harness/features/feat-082.json`, `harness/features/feat-100.json`, `harness/features/feat-100a.json`, and the completed ExecPlans directory are left as-is — they are historical records of when the original migrations shipped, not live schema references.
- Next steps: Keep `0001_init.sql` as the single source of truth until the first deploy/release; from that point on, additive changes must become new numbered migrations so deployed D1 databases can replay them in order.

## 2026-06-17 — TMA file-length and icon-centralization refactor

- Who: Codex
- Summary: Brought the TMA back under the per-file length thresholds in `scripts/check_ts_length.sh` and centralized the inline SVG icons that were duplicated across feature pages and shared components. **Icon store:** Added 7 missing icons (ReceiptIcon, HouseholdIcon, GroupIcon, BudgetIcon, UserIcon, TrashIcon, ArrowRightIcon) to `apps/tma/src/components/shared/tma-icons.tsx` (168 → 226 lines) and migrated every call site. **File splits:** `tma-page-shell.tsx` 311 → 112 (split into 4 sibling files; kept as barrel re-export); `budget-detail-page.tsx` 401 → 272 (extracted `stat-tile.tsx`, `budget-hero-card.tsx`, `budget-progress-section.tsx`, `types/feedback.ts`; replaced local `BudgetGlyph` with central `BudgetIcon`); `expense-filter-page.tsx` 353 → 227 (extracted `use-expense-filter-options.ts` and shared `LoadingPicker`); `create-group-page.tsx` 305 → 163 (extracted `create-group-validation.ts` and `create-group-form.tsx`); `household-detail-page.tsx` 341 → 238 (replaced local `TrashIcon` with central icon, extracted `use-household-detail-actions.ts`); `add-expense-context.tsx` 308 → 283 (extracted `summary-row.tsx` and `use-add-expense-context-actions.ts`); `expense-edit.tsx` 450 → 189 (split into `expense-edit-category.tsx`, `expense-edit-select-row.tsx`, `expense-edit-form.tsx`; updated router's `ExpenseEditCategoryPage` lazy import); `features/households/api.ts` 355 → 5-file folder (households/analytics/budgets/expenses/categories + barrel); `lib/period.ts` 313 → 4-file folder (types/vietnam-time/selectors/format + barrel). **Call-site migrations:** `home-shortcuts-section.tsx` 111 → 66, `components/finance/households.tsx` 257 → 242. **Worker follow-up:** After the TMA passes, extracted `findBudgetLimits` + `deleteBudgetLimits` from `apps/worker/src/db/repositories/budget-repository.ts` (413 lines) into a new `apps/worker/src/db/repositories/budget-limit-repository.ts`; the main file re-exports `findBudgetLimits` from the new module so all 5 handler imports stay unchanged, and now sits at 382 lines under the 400 REPOSITORY threshold.
- Files changed: `apps/tma/src/components/shared/tma-icons.tsx`; `apps/tma/src/components/shared/tma-page-shell.tsx` and new siblings `tma-bottom-tabs.tsx`, `tma-page-header.tsx`, `tma-category-icon-badge.tsx`, `tma-inline-action.tsx`; `apps/tma/src/components/shared/loading-picker.tsx`, `apps/tma/src/components/shared/summary-row.tsx` (new); `apps/tma/src/features/budgets/pages/budget-detail-page.tsx` + new `features/budgets/{types/feedback.ts, components/stat-tile.tsx, components/budget-hero-card.tsx, components/budget-progress-section.tsx}`; `apps/tma/src/features/budgets/pages/create-budget-page.tsx` (now imports shared `BudgetFeedback`); `apps/tma/src/features/expenses/pages/expense-filter-page.tsx` + new `features/expenses/hooks/use-expense-filter-options.ts`; `apps/tma/src/features/expenses/hooks/use-add-expense-context-actions.ts` (new); `apps/tma/src/features/groups/pages/create-group-page.tsx` + new `features/groups/create-group-validation.ts` and `features/groups/components/create-group-form.tsx`; `apps/tma/src/features/households/pages/household-detail-page.tsx` + new `features/households/hooks/use-household-detail-actions.ts`; `features/households/api.ts` deleted, replaced by `features/households/api/{index.ts, households.ts, analytics.ts, budgets.ts, expenses.ts, categories.ts}`; `apps/tma/src/lib/period.ts` + new `apps/tma/src/lib/period/{types.ts, vietnam-time.ts, selectors.ts, format.ts}`; `apps/tma/src/routes/expense-edit.tsx` + new `routes/{expense-edit-category.tsx, expense-edit-select-row.tsx, expense-edit-form.tsx}`; `apps/tma/src/app/router/app-router.tsx` (re-pointed `ExpenseEditCategoryPage` lazy import); `apps/tma/src/features/home/components/home-shortcuts-section.tsx` and `apps/tma/src/components/finance/households.tsx` migrated to central icons; `apps/worker/src/db/repositories/budget-repository.ts` (removed `findBudgetLimits`/`deleteBudgetLimits` and the now-unused `BUDGET_LIMIT_COLUMNS`/`BudgetLimitRow`/`mapBudgetLimitRow`/`StoredBudgetLimit` local imports) + new `apps/worker/src/db/repositories/budget-limit-repository.ts`; harness `feature_index.json` and `features/feat-102.json`.
- Verification: `./scripts/check_ts_length.sh` now reports 0 errors across the whole repo with "All good". `./init.sh typecheck` returned `OK`. `./init.sh lint` returned `OK` — caught and fixed two new lint errors introduced by the TMA refactors (removed the now-unused `reset` selector destructuring in `expense-filter-page.tsx`, and switched `useHouseholdDetailActions` to an options-bag signature to satisfy the `max-params: 5` rule). `./init.sh test` returned `OK` (12/12 period tests still green after the `lib/period/` folder split).
- Blockers: None. All 12 parallel fixer lanes finished cleanly with no race or rollback, and the worker follow-up split was a direct, single-file edit. The two pre-existing lint warnings in `lib/i18n/index.ts` and `lib/storage/adapter.ts` (console statements) are out of scope.
- Next steps: Open the TMA in Telegram to confirm every refactored page (expense filter, expense edit, create group, household detail, budget detail) still renders identically and all nav/header/bottom-tab transitions still feel native. `./scripts/check_ts_length.sh` is now green repo-wide, so the next refactor pass can move on to other review findings (documenting `features/home/api` as the canonical shared data layer, or eventually extracting it to `lib/api/`).

## 2026-06-17 — TMA architecture cleanup: killed route wrappers, dead code, and misclassified feature

- Who: Codex
- Summary: Applied the high/medium-priority findings from the TMA architecture review. **Route wrappers:** Deleted the 11 zero-logic wrapper files in `apps/tma/src/routes/` (households, household-detail, create-household, groups, group-detail, create-group, budgets, budget-detail, create-budget, period, expense-filter) and rewrote `app-router.tsx` so the 11 lazy-import blocks point directly at the feature pages (`@/features/<domain>/pages/<page>`) using each page's real export. **Dead code:** Deleted `apps/tma/src/components/shared/tma-data-state.tsx` and `apps/tma/src/features/finance/components/link-button.tsx` (both had zero usages outside their own files) and dropped `link-button` from the finance barrel. **Home wrappers:** Inlined the 3-line `home-households-section.tsx` and 5-line `home-overview-section.tsx` into `routes/home.tsx`, which now imports `HouseholdPreviewCarousel` and `FinanceSummaryCard` directly; both wrapper files were deleted. **Feature reclassification:** Moved `features/finance/components/*` to `components/finance/` (flat, no inner `components/` subdir) to reflect that the directory is a shared component library, not a domain feature; updated all 6 consumer import paths (`routes/expenses.tsx`, `features/home/components/{home-recent-expenses-section,home-shortcuts-section}.tsx`, `features/households/components/household-overview-section.tsx`, `features/households/pages/household-list-page.tsx`, `features/groups/pages/group-detail-page.tsx`); the old `features/finance/` directory was removed.
- Files changed: `apps/tma/src/app/router/app-router.tsx`, `apps/tma/src/routes/home.tsx`, `apps/tma/src/routes/expenses.tsx`, `apps/tma/src/features/home/components/home-recent-expenses-section.tsx`, `apps/tma/src/features/home/components/home-shortcuts-section.tsx`, `apps/tma/src/features/households/components/household-overview-section.tsx`, `apps/tma/src/features/households/pages/household-list-page.tsx`, `apps/tma/src/features/groups/pages/group-detail-page.tsx`, `apps/tma/src/components/finance/index.tsx`; deleted `apps/tma/src/routes/{households,household-detail,create-household,groups,group-detail,create-group,budgets,budget-detail,create-budget,period,expense-filter}.tsx`, `apps/tma/src/components/shared/tma-data-state.tsx`, `apps/tma/src/features/home/components/home-households-section.tsx`, `apps/tma/src/features/home/components/home-overview-section.tsx`, `apps/tma/src/components/finance/link-button.tsx`; moved 6 files from `apps/tma/src/features/finance/components/` to `apps/tma/src/components/finance/`; harness `feature_index.json` and `features/feat-101.json`.
- Verification: `./init.sh typecheck` returned `OK`. `./init.sh lint` returned `OK`. `./init.sh test` returned `OK`. Repo-wide grep for `@/features/finance` and for the deleted symbols (`LinkButton`, `link-button`, `tma-data-state`, `TmaDataState`) returns no matches. `ls apps/tma/src/routes/` shows 10 real pages, the 11 wrappers are gone. `ls apps/tma/src/features/home/components/` shows only the two non-trivial home sections.
- Blockers: A race between the parallel fix-2 (dead-code deletion) and fix-3 (finance rename) was caught at the cancel-task checkpoint: fix-3 had already moved `features/finance/components/*` to `components/finance/` before fix-2 reached its finance work, so fix-2 was cancelled after its `tma-data-state.tsx` deletion had already landed, and the leftover `link-button.tsx` was removed directly from its new path. No production behavior changed.
- Next steps: Open the TMA in Telegram to confirm the router still lazy-loads every page and the Home sections render identically after the wrapper inlines. Consider the remaining low-priority review items later (documenting `features/home/api` as the canonical shared data layer, or eventually extracting it to `lib/api/`).

## 2026-06-16 — Minimalist redesign of TMA expense edit flow (source picker, group picker, .000 suffix, category page)

- Who: Codex
- Summary: Redesigned the TMA expense edit flow for minimalism and faster data entry. **Title:** Changed from `Sửa chi tiêu` to `chi tiêu`. **Money input:** Moved to the top of the page and added a `.000` suffix (like add-expense step 2), so users type `3` instead of `3000`. The input now divides by 1000 on load and multiplies by 1000 on save. **Source selection:** Replaced the `EditSelectRow` that navigated to a separate sub-page with an inline `NativePicker` inside a `Field` + `FieldLabel` card. **Group selection:** Added a new inline `NativePicker` for group selection, using the same `useHouseholdExpenseGroupQueries` + `usePersonalExpenseGroupListQuery` pattern as add-expense-context. Added `groupId` to `EditExpenseDraft` and `groupIds` to `UpdateExpenseRequest`. **Category page redesign:** `ExpenseEditCategoryPage` now uses the same 3-column `ChipButton` grid with `TmaCategoryIconBadge` + label as `add-expense-category.tsx`, wrapped in `Section` + `SectionHeader` + `DataState`. **Dead code removal:** Removed the `ExpenseEditSourcePage` component, its router route, and the `getExpenseEditSourcePath` route helper.
- Files changed: `apps/tma/src/routes/expense-edit.tsx`, `apps/tma/src/features/expenses/store.ts`, `apps/tma/src/features/expenses/draft.ts`, `apps/tma/src/features/expenses/api.ts`, `apps/tma/src/app/router/app-router.tsx`, `apps/tma/src/lib/constants/routes.ts`, `apps/tma/src/test/expense-draft.test.ts`.
- Verification: `npx eslint --ext .ts,.tsx` on all 6 modified files returned 0 problems. `npx tsc --noEmit` passed. `npx vitest run src/test/` reports 92/93 tests pass; the single failure is the pre-existing `src/test/statistics-page.test.tsx` (expects legacy `Biểu đồ danh mục` while page renders `Phân bổ danh mục`), unchanged by this work.
- Blockers: None. Real Telegram WebView visual smoke remains pending because authenticated TMA launch context is required.
- Next steps: Open the TMA expense edit flow in Telegram and confirm the inline source/group pickers, the `.000` money input, and the ChipButton category grid all feel fast and consistent.

## 2026-06-16 — Minimalist redesign of TMA expense pages (add step 3, detail, edit)

- Who: Codex
- Summary: Redesigned three TMA expense pages for minimalism and consistency. **Add-expense-context (step 3):** Replaced noisy `ChipButton` grids for household and group selection with inline `NativePicker` fields inside a clean `Card`. Kept the summary preview card and all BottomButton/save logic. **Expense-detail:** Replaced scattered 2-col `DetailCell` grid with clean `Section` + `SectionHeader` blocks: a "Thông tin" section with category row + source/space grid, and a "Thời gian" section with combined date+time. Removed the metadata "Thời điểm ghi" field. Kept hero card with category icon + big amount, and inline delete confirmation. **Expense-edit:** Replaced the household `EditSelectRow` (which navigated to a separate dead sub-page) with an inline `NativePicker` for household selection. Removed the dead `ExpenseEditHouseholdPage` component, its router route, and the `getExpenseEditHouseholdPath` route helper. Kept category and source sub-pages, amount/title/date inputs, BottomButton save logic, and all validation.
- Files changed: `apps/tma/src/routes/add-expense-context.tsx`, `apps/tma/src/routes/expense-detail.tsx`, `apps/tma/src/routes/expense-edit.tsx`, `apps/tma/src/app/router/app-router.tsx`, `apps/tma/src/lib/constants/routes.ts`.
- Verification: `pnpm --filter tma exec eslint --ext .ts,.tsx` on all 5 modified files returned 0 problems. `pnpm --filter tma typecheck` passed with 0 errors. `pnpm --filter tma exec vitest run src/test/` reports 92/93 tests pass; the single failure is the pre-existing `src/test/statistics-page.test.tsx` (expects legacy `Biểu đồ danh mục` while page renders `Phân bổ danh mục`), unchanged by this work.
- Blockers: None. Real Telegram WebView visual smoke remains pending because authenticated TMA launch context is required.
- Next steps: Open the TMA add-expense step 3, expense detail, and expense edit flows in Telegram and confirm the NativePicker household/group selectors, the clean detail sections, and the inline household edit all feel consistent with the rest of the app.

## 2026-06-16 — Minimalist redesign of TMA budget list page

- Who: Codex
- Summary: Redesigned `apps/tma/src/features/budgets/pages/budget-list-page.tsx` for minimalism and consistency with the recently redesigned budget-detail-page.tsx. Removed the hero count card (showing `filteredBudgets.length`) and the "Budget mới nhất" highlighted card because both duplicated information already visible in the sorted list. Simplified list rows from heavy nested cards (IconBadge + chips + title + description + stat box) to clean inline `Link` rows: period label on the left, scope `Chip` below it, and total-limit `MoneyLabel` on the right. The entire list now lives inside a single `Section` with `SectionHeader` titled "Ngân sách" and the "Tạo mới" action button. Scope filter chips and the household picker (when scope=household) sit cleanly inside the same section. Preserved all functionality: filters, household selector, admin warning, DataState loading/error/empty states, sort by period descending, haptics, and navigation. Reduced from 344 lines to 257 lines (~25% reduction).
- Files changed: `apps/tma/src/features/budgets/pages/budget-list-page.tsx`.
- Verification: `pnpm --filter tma exec eslint src/features/budgets/pages/budget-list-page.tsx` returned 0 problems. `pnpm --filter tma typecheck` passed with 0 errors. `pnpm --filter tma exec vitest run src/test/budget-presentation.test.ts src/test/budget-detail-page.test.tsx` passed (5 tests). Full `./init.sh lint` and `./init.sh typecheck` returned `OK`. Full `./init.sh test` reports 92/93 tests pass; the single failure is the pre-existing `src/test/statistics-page.test.tsx`, unchanged by this work.
- Blockers: None. Real Telegram WebView visual smoke remains pending because authenticated TMA launch context is required.
- Next steps: Open the TMA budget list in Telegram and confirm the clean row layout, filter chips, and household selector feel consistent with the rest of the app.

## 2026-06-16 — Minimalist redesign of TMA budget detail page

- Who: Codex
- Summary: Redesigned `apps/tma/src/features/budgets/pages/budget-detail-page.tsx` for minimalism and consistency with other TMA pages. Removed duplicate data: the hero card now owns the total-limit number with a `Tổng hạn mức` eyebrow, the progress section no longer repeats the total, and the redundant `Sử dụng` percentage stat tile was removed in favor of the progress-bar label. The hero card uses `Chip` badges for period and scope plus the budget `IconBadge`, matching the budget list card pattern. Progress is shown as a single `Tiến độ` section with only `Đã chi` and `Còn lại` stat tiles plus a clean progress bar. Management follows the household-detail inline form pattern with a single total-limit field and edit/delete actions. Fixed the amount input to apply `formatAmountInput` on change and cleaned up the mixed-language delete confirmation copy.
- Files changed: `apps/tma/src/features/budgets/pages/budget-detail-page.tsx`.
- Verification: `pnpm --filter tma exec eslint src/features/budgets/pages/budget-detail-page.tsx` returned 0 problems. `pnpm --filter tma typecheck` passed with 0 errors. `pnpm --filter tma exec vitest run src/test/budget-detail-page.test.tsx` passed (1 test). Full `./init.sh lint` and `./init.sh typecheck` returned `OK`. Full `./init.sh test` reports 92/93 tests pass; the single failure is the pre-existing `src/test/statistics-page.test.tsx` (expects legacy `Biểu đồ danh mục` while the page renders `Phân bổ danh mục`), unchanged by this work.
- Blockers: None. Real Telegram WebView visual smoke remains pending because authenticated TMA launch context is required.
- Next steps: Open the TMA budget detail in Telegram and confirm the minimalist hero card, the de-duplicated progress section, and the inline management form feel consistent with the rest of the app.

## 2026-06-16 — Aligned TMA budget detail to group/household detail style

- Who: Codex
- Summary: Rewrote `apps/tma/src/features/budgets/pages/budget-detail-page.tsx` to match the style pattern used by `group-detail-page.tsx` and `household-detail-page.tsx`. The page now uses a `TmaPageShell` + `DataState` wrapper for loading/empty/error, a hero card with `IconBadge` + budget glyph + scope `Eyebrow` + period h1 (text-2xl font-extrabold) + big budget amount, a "Tiến độ" `Section` with `SectionHeader` and a `Card` containing a 2-col stat-tile grid (`Tổng ngân sách`, `Đã chi`, `Còn lại`, `Sử dụng`) plus an inline `h-2 overflow-hidden rounded-full bg-black/[0.06]` progress bar, and a "Quản lý ngân sách" `Section` for edit/delete. Stat tiles use the shared `rounded-[18px] bg-black/[0.04] p-3` pattern; negative `Còn lại` switches to red. Removed the custom `ProgressBar` component, the in-page `Section` wrapper, and the manual loading/error `Card` blocks. Feedback flows in from `location.state` on mount and is set locally for mutation results, matching the household/group pattern.
- Files changed: `apps/tma/src/features/budgets/pages/budget-detail-page.tsx`.
- Verification: `pnpm --filter tma typecheck` passed with 0 errors. `npx eslint` on the page returns 0 problems. `npx vitest run` reports 92/93 pass; the single failure is the pre-existing `src/test/statistics-page.test.tsx` (unchanged from `main`). `src/test/budget-detail-page.test.tsx` (1) and `src/test/budget-presentation.test.ts` (4) all pass.
- Blockers: None. Real Telegram WebView visual smoke remains pending because authenticated TMA launch context is required.
- Next steps: Open the TMA budget detail in Telegram and confirm the hero card matches the group/household hero pattern, the "Tiến độ" section renders the 2-col stat grid with the inline progress bar, and the "Quản lý ngân sách" section's edit form / delete button row is consistent with the rest of the app.

## 2026-06-16 — Restyled TMA budget detail summary and progress card

- Who: Codex
- Summary: TMA-only visual cleanup on `apps/tma/src/features/budgets/pages/budget-detail-page.tsx`. Summary card now shows only the scope eyebrow, period title, and a single large budget total (3xl extrabold) — removed the "Đang an toàn"/"Sắp chạm ngưỡng" status chip, the "Đã chi X / Y" line, and the in-summary progress bar so the budget amount is the sole visual focus. The "So sánh dự kiến với thực tế" card was renamed to "Tiến độ", its description was dropped, and the body was restyled: percent label moved to the SectionHeader action slot, progress bar moved to the top of the body, big "đã chi" amount with "trên tổng" muted below, and a single "Còn lại" line at the bottom (red text when over budget). Removed unused `getBudgetStatusCopy` and `MoneyLabel` imports. No behavior change — same data, just a cleaner visual hierarchy.
- Files changed: `apps/tma/src/features/budgets/pages/budget-detail-page.tsx`.
- Verification: `pnpm --filter tma typecheck` passed with 0 errors. `npx eslint src/features/budgets/pages/budget-detail-page.tsx` returns 0 problems. `npx vitest run` reports 92/93 pass; the single failure is the pre-existing `src/test/statistics-page.test.tsx` (unchanged from `main`).
- Blockers: None. Real Telegram WebView visual smoke remains pending because authenticated TMA launch context is required.
- Next steps: Open the TMA budget detail in Telegram and confirm the summary now reads as a single hero number with scope/period above it, and that the "Tiến độ" card shows progress bar first, big actual amount, planned muted, and remaining at the bottom.

## 2026-06-16 — Removed per-category budget feature from TMA only

- Who: Codex
- Summary: TMA only — dropped the per-category budget limit feature. Deleted `apps/tma/src/features/budgets/components/budget-category-limit-fields.tsx`. Removed the "Theo danh mục" section, the per-category edit fields, the per-category-limit validation, the `useReferenceCategoriesQuery`/`getCategoryPresentation`/`isReferenceCategoryDTO` usage, the category-count tile, and the "X danh mục có hạn mức riêng" description from the TMA budget detail and list pages. Simplified `buildBudgetMutationRequest` and `BudgetMutationFormValues` to drop `categoryLimits` and the `buildCategoryLimitMap` helper. Removed `categoryLimits` from TMA's `CreateBudgetRequest` and `UpdateBudgetRequest` (the `BudgetDTO` shape is unchanged so the worker response is still typed). Updated `test/budget-presentation.test.ts` to match the simplified builder. Worker (`apps/worker/**`) and web (`apps/web/**`) untouched — they still send and render per-category limits via the existing `/api/v1/budgets` contract. Harness `feat-098` updated to record the new scope.
- Files changed: `apps/tma/src/features/budgets/components/budget-category-limit-fields.tsx` (deleted), `apps/tma/src/features/budgets/pages/budget-detail-page.tsx` (rewritten), `apps/tma/src/features/budgets/pages/budget-list-page.tsx` (cleaned), `apps/tma/src/features/budgets/pages/create-budget-page.tsx` (cleaned), `apps/tma/src/features/budgets/presentation.ts` (simplified), `apps/tma/src/features/budgets/types.ts` (cleaned), `apps/tma/src/test/budget-presentation.test.ts` (updated), `harness/features/feat-098.json` (scope note).
- Verification: `pnpm --filter tma typecheck` passed with 0 errors. `pnpm --filter tma lint` returns 0 errors (11 pre-existing warnings in unrelated test files, none in the modified files). `npx vitest run` reports 92/93 tests pass; the single failure is the pre-existing `src/test/statistics-page.test.tsx` (asserts legacy `Biểu đồ danh mục` text that was changed to `Phân bổ danh mục` on `main`), confirmed pre-existing by `git stash` + re-run. Budget tests `src/test/budget-presentation.test.ts` (4) and `src/test/budget-detail-page.test.tsx` (1) all pass.
- Blockers: None. Real Telegram WebView visual smoke remains pending because authenticated TMA launch context is required.
- Next steps: Open the TMA budget detail, list, and create flows in Telegram and confirm the detail page now shows only overview + planned-vs-actual + management (edit total / delete), the list card shows only the total-limit tile, and the create form sends `{ totalLimit }` only.

## 2026-06-16 — Replaced raw selects and date inputs with TMA picker primitives

- Who: Codex
- Summary: Replaced remaining raw `<select>` and inline `<input type="date">` elements across the TMA with the shared `NativePicker` and `DatePicker` UI primitives. Two `<select>` sites (household filter in budget list, context selector in create group) now use `NativePicker` with `NativePickerOption` arrays built via `useMemo`; five inline date inputs (start/end in create group, expense date in edit + add-expense category, and the timeline date button in the period picker) now use `DatePicker`. The custom `PeriodTimelineDateButton` ref-hack in the period picker is gone. No behavior change — only input control swap.
- Files changed: `apps/tma/src/features/budgets/pages/budget-list-page.tsx`, `apps/tma/src/features/groups/pages/create-group-page.tsx`, `apps/tma/src/features/period/pages/period-picker-page.tsx`, `apps/tma/src/routes/add-expense-category.tsx`, `apps/tma/src/routes/expense-edit.tsx`.
- Verification: `pnpm --filter tma typecheck` passed with 0 errors. `pnpm --filter tma lint` passed with 0 errors (19 pre-existing warnings in `src/test/*.test.tsx`, none in the 5 modified files). A repo-wide grep for `type="date"` / `type="month"` inside `apps/tma/src` returns no matches.
- Blockers: None. Real Telegram WebView visual smoke remains pending because authenticated TMA launch context is required.
- Next steps: Open the TMA budget list, create group, period picker, and add-expense/edit flows in Telegram and confirm the native pickers open with the same look-and-feel as the existing `create-budget-page` reference site.

## 2026-06-15 — Personal budgets end-to-end (slices 100a-100i)

- Who: Codex
- Summary: Shipped personal-scope budgets across worker, web, and TMA. Worker widens the budget CHECK to include `personal`, makes `household_id` nullable, adds `owner_user_id` with a partial unique index per user, and exposes discriminated create/update/get/list/get-status. Web and TMA add a `personal` flow with a scope filter (All / Household / Cá nhân), a `currencyCode` field for personal, scope badges on cards, and unioned lists sorted by period DESC. Created new test coverage for personal CRUD, list union, and cross-user not-found.
- Files changed: Worker migration `0003_personal_budgets.sql`; budget contracts, types, schemas, messages; budget repository and spend-summary repository; budget create/get/update/delete/list/status handlers; new `test/integration/budgets-personal.spec.ts`; updated `budgets-create-list.spec.ts`, `budgets-read-update.spec.ts`, `budgets-status.spec.ts`, `budgets-status-thresholds.spec.ts`; web `features/budgets/{types,api,hooks,components,pages}/...`; new `currency-code-field.tsx`; web vi.json keys; TMA `features/budgets/{types,api,presentation,pages}/...`; TMA `test/budget-presentation.test.ts`; harness `feature_index.json` and feature records.
- Verification: `./init.sh` (full) completed with `Done!` — install, harness, lint, typecheck, test all pass. Worker integration: 416 tests pass (8 new personal budget tests). Web and TMA lint + typecheck clean. TMA vitest passes.
- Blockers: None. Real Telegram WebView visual smoke for the scope chips and SegmentedControl remains pending because an authenticated TMA launch context is required.
- Next steps: Open the TMA budget list, create, and detail flows in Telegram to confirm personal vs household rendering. Consider a future cleanup slice to unify the home feature `BudgetDTO` shape (currently has its own non-nullable `householdId`).

## 2026-06-15 — Implemented TMA personal budgets slices 100g and 100h

- Who: Codex
- Summary: Implemented the TMA personal budgets feature slices 100g (types + queries) and 100h (UI). Updated `budgets/types.ts` to add `BudgetScope`, nullable `householdId`/`ownerUserId`, discriminated `CreateBudgetRequest`, and `ListBudgetsParams`. Updated `budgets/api.ts` to build query strings from params and use stable tuple keys. Updated `budgets/presentation.ts` with `getBudgetScopeLabel`, scope-aware `buildBudgetMutationRequest`, and extended `BudgetMutationFormValues`. Updated `budget-list-page.tsx` with scope filter chips (Tất cả / Household / Cá nhân), household select in household mode, scope-tagged budget cards, and scope-aware empty states. Updated `create-budget-page.tsx` with `SegmentedControl` scope selector, conditional household/currency fields, and scope-aware validation. Updated `budget-detail-page.tsx` with scope label via `getBudgetScopeLabel` and personal-budget ownership-based `canManage` using the auth store user ID. Updated `test/budget-presentation.test.ts` for the new `BudgetDTO` shape and personal-budget assertions.
- Files changed: TMA budget feature types, API, presentation helpers, list/create/detail pages, focused budget presentation test, and harness records for feat-100g/feat-100h.
- Verification: `./init.sh lint` returned `OK`. `./init.sh typecheck` returned `OK`. `./init.sh test` returned `OK`. Final `./init.sh` completed with `Done!`.
- Blockers: None in code. Real Telegram WebView visual smoke remains pending because authenticated TMA launch context is required.
- Next steps: Open the TMA budget list, create, and detail flows in Telegram and confirm personal vs household budgets render correctly, scope chips toggle cleanly, and the create form switches field sets as expected.

## 2026-06-12 — Wrote personal-budgets end-to-end ExecPlan and harness record

- Who: Codex
- Summary: Locked direction after `grill-with-docs` for adding personal-scope budgets alongside household budgets. Wrote `docs/exec-plans/plans/2026-06-12-personal-budgets-end-to-end.md` covering D1 migration, worker contracts/repository/handlers widening, TMA list+create refactor, web parity, and integration tests. Created `harness/features/feat-100.json` and added the active entry to `docs/exec-plans/index.md`. Implementation steps are tracked in the plan's Progress checklist; the next move is `to-issues` to break the 11 steps into vertical slices.
- Files changed: New ExecPlan file, `harness/features/feat-100.json`, `harness/feature_index.json`, `docs/exec-plans/index.md`.
- Blockers: None. The migration is additive (widens a CHECK, makes a column nullable, adds a column + two indexes) and personal expenses already aggregate via `expense-query-scope.ts:28-31`.
- Next steps: Run `to-issues` to slice the 11 plan steps into vertical harness features/JSON, then start with the D1 migration and worker contract widening.

## 2026-06-12 — Moved TMA custom period picking into selected range cards

- Who: Codex
- Summary: Removed the separate custom date section from the TMA period picker while keeping quick presets unchanged. The selected range timeline cards now act as date-picker buttons with hidden native date inputs kept inside each card boundary and light impact haptics on open. Timeline date edits create a custom period and show `Tùy chỉnh`; the native BottomButton now stays as `Chọn` without appending the from-to range.
- Files changed: TMA period picker page, focused period picker/store test, and feat-099 harness evidence.
- Verification: RED focused TMA test failed before implementation on old BottomButton range text and the still-visible custom section. After the fix, `pnpm --filter tma exec vitest run src/test/period-store-and-picker.test.tsx` passed with 5 tests, changed-file ESLint passed, `pnpm --filter tma typecheck` returned `OK`, `jq empty harness/feature_index.json harness/features/feat-099.json` passed, and `git diff --check` passed. Final `./init.sh` initially failed because period label helpers had a concurrent Unicode `→` change while period tests still expected ASCII `->`; user chose to keep Unicode arrows, the tests were aligned, focused period tests passed with 17 tests, changed-file ESLint returned no output, and final `./init.sh` completed with `Done!`.
- Blockers: None in code. Real Telegram WebView visual smoke remains pending because authenticated TMA launch context is required.
- Next steps: Open the TMA picker in Telegram and confirm tapping the two selected-range cards opens native date pickers cleanly on device.

## 2026-06-12 — Sped up repeated init verification

- Who: Codex
- Summary: Reviewed `init.sh` for remaining speed wins. The script already parallelizes checks heavily, so the safe improvement was to reduce repeat-run overhead: `pnpm install` now uses `--prefer-offline`, each app lint job passes ESLint cache args, and each app test job passes Vitest `--cache` while preserving full-suite coverage.
- Files changed: Verification shell script, gitignore for ESLint cache files, and feat-055 harness evidence.
- Verification: `bash -n init.sh` passed after each script edit. `./init.sh lint` returned `OK` with ESLint cache args. `./init.sh test` returned `OK` with Vitest cache enabled. `jq empty harness/features/feat-055.json` passed. Final `./init.sh` returned `Done!`.
- Blockers: None.
- Next steps: Run final `./init.sh` before closing the session.

## 2026-06-12 — Kept TMA budget periods monthly on Home

- Who: Codex
- Summary: Fixed TMA budget-period derivation so budget queries always receive a `YYYY-MM` month from the selected range instead of disabling/falling back to `unknown` for weekly or yearly global periods. Home now opts into monthly budget context copy, so a weekly Home selection shows text like `Ngân sách tháng 06/2026` instead of mixing the main summary with `Ngân sách chỉ có theo tháng`.
- Files changed: TMA shared period helper, shared finance summary card, Home overview wrapper, household budget query call sites, focused Home overview regression test, user-approved unused-local cleanup in the period picker, and feat-099 harness evidence.
- Verification: The new focused test failed before the fix on `unknown` budget period and missing `Ngân sách tháng 06/2026`, then passed after the fix. `./init.sh typecheck`, `./init.sh lint`, `./init.sh test`, and final `./init.sh` returned `OK` / `Done!`; final lint required the approved cleanup of unused period-picker reset locals left by unrelated edits.
- Blockers: None in code. Real Telegram WebView visual smoke remains pending because authenticated TMA launch context is required.
- Next steps: Open Home in the TMA with a weekly period selected and visually confirm the summary shows the monthly budget context without implying a weekly budget.

## 2026-06-11 — Fixed global TMA period selection not applying

- Who: Codex
- Summary: Traced the period picker through its real entry path and found that every `PeriodChipLink` supplied a `backTo` route, while the picker interpreted any `backTo` as a local sub-page. Applying from Home, Statistics, or household screens therefore returned the candidate through navigation state without updating the shared Zustand period. The picker now reserves local return-state behavior for callers that provide `initialPeriod`, which is the expense-filter custom-date flow; normal period chips update the shared store and then navigate back.
- Files changed: TMA period picker routing logic, its focused store/navigation regression test, and feat-099 harness evidence.
- Verification: The new regression test failed before the fix because the store remained on the current month, then passed after the fix. Focused period/statistics tests passed with 19 tests. `./init.sh typecheck` and `./init.sh lint` returned `OK`.
- Blockers: Real Telegram WebView smoke remains pending because this environment cannot provide authenticated Telegram launch context.
- Next steps: In Telegram, open the picker from Home and Statistics, choose a different preset, press the native BottomButton, and confirm the chip label and data range both change after returning.

## 2026-06-11 — Shifted TMA reporting periods to Vietnam local time

- Who: Codex
- Summary: Updated the shared TMA period helper so reporting ranges, labels, input parsing, and budget-month derivation now use Vietnam local day boundaries instead of UTC midnight. `Tuần này` and `Tuần trước` still resolve Monday through Sunday, but the stored `date_from` / `date_to` timestamps now represent `00:00` in `UTC+07:00`, which keeps Home, expense filters, and Statistics aligned with real Vietnam calendar days near UTC rollover.
- Files changed: Shared TMA period helper, focused TMA period/statistics tests, and feat-099 harness evidence.
- Verification: Focused TMA Vitest run passed for `src/test/period.test.ts`, `src/test/period-store-and-picker.test.tsx`, `src/test/statistics-page.test.tsx`, and `src/test/period-chip-entrypoints.test.tsx` with 18 tests. `./init.sh typecheck` returned `OK`.
- Blockers: None in code. Real Telegram WebView smoke is still pending because this environment cannot provide an authenticated Telegram launch context.
- Next steps: Open the TMA through the normal Telegram launch path and spot-check a UTC rollover case near midnight Vietnam time to confirm labels and analytics ranges match the expected local date.

## 2026-06-11 — Refined TMA reporting periods and statistics chart

- Who: Codex
- Summary: Replaced the TMA period picker tab model with wrapable reporting chips for `Tháng này`, `Tháng trước`, `Tuần này`, `Tuần trước`, `Năm nay`, `Năm ngoái`, plus custom `Từ ngày -> đến ngày` inputs. The reporting period still defaults to current month. Expense-list date filtering now reuses the same period helper semantics, while non-date filters remain local. Statistics now reads the shared selected period, calls analytics with `date_from` / `date_to`, and renders a category pie/donut chart plus legend rows with amount and percentage. Budget periods remain monthly.
- Files changed: TMA period helper/store-facing tests, period picker page, expense filter page, Statistics route, focused tests, feat-099 ExecPlan/harness records, and plan index/progress records.
- Verification: GitNexus impact checks on the main touched symbols reported LOW/no indexed upstream impact. Focused TMA tests for period helpers, picker, chip entrypoints, and Statistics passed with 17 tests. `./init.sh typecheck`, `./init.sh lint`, `./init.sh test`, `./init.sh build`, and final `./init.sh` returned `OK` / `Done!`. JSON, diff whitespace, and harness size checks passed. Final GitNexus detect changes reported `critical` risk with 97 changed symbols, 36 affected symbols/processes, and 10 indexed changed files, expected for shared TMA period/filter/statistics changes.
- Blockers: Real Telegram WebView visual smoke remains pending because this environment cannot provide an authenticated Telegram launch context.
- Next steps: Open TMA in Telegram/local authenticated launch and visually confirm the picker chip wrapping, custom date inputs, expense filter date chips, and Statistics pie legend on a narrow mobile viewport.

## 2026-06-11 — Restored native TMA BottomButton for add-expense

- Who: Codex
- Summary: Rolled back the custom web sticky action button in the TMA add-expense flow because it moved unpredictably around the mobile keyboard. Step 2 and step 3 now use Telegram native BottomButton again. Each route separates BottomButton lifecycle into one-time click registration, state-only visual updates, and a dedicated unmount-only `hideBottomButton` cleanup so form state changes do not remount the native button. For step 2 focus, step 1 now navigates with `flushSync`, and the amount input focuses immediately from its ref callback with `preventScroll` plus `autoFocus`, avoiding the previous delayed timer.
- Files changed: TMA shared shell rollback, add-expense category/details/context routes, focused focus regression test, theme test rollback, and feat-084 harness records.
- Verification: Focused add-expense details focus test passed. `./init.sh typecheck`, `./init.sh lint`, `./init.sh test`, and `./init.sh build` returned `OK`. Final `./init.sh` completed with `Done!`.
- Blockers: Real Telegram WebView keyboard smoke remains pending because this harness cannot open an authenticated Telegram launch context.
- Next steps: Open add-expense step 2 and step 3 in Telegram on iOS and Android, confirm the amount input auto-focuses, and verify the native BottomButton follows keyboard behavior correctly.

## 2026-06-07 — Added TMA budget CRUD surfaces

- Who: Codex
- Summary: Added Telegram Mini App budget management backed by the existing worker budget API. The Home Budget shortcut now opens `/budgets`; the list selects a household and reads real budget rows; create posts a monthly household budget with optional expense-category limits; detail reads budget detail/status, shows planned vs actual and threshold/category progress, supports admin edit, and deletes obsolete budgets.
- Files changed: TMA budget feature module, route wrappers, router/path wiring, Home shortcut entrypoint, focused budget tests, ExecPlan records, and feat-098 harness records.
- Verification: Focused budget tests passed after the intended RED steps. `./init.sh typecheck`, `./init.sh lint`, `./init.sh test`, and `./init.sh build` returned `OK`. `jq empty` on feat-098 harness JSON returned no output, `git diff --check` returned no output, `./scripts/check_harness_size.sh` passed, and final `./init.sh` completed with `Done!`. Final GitNexus detect changes reported `medium` risk with affected processes in pre-existing TMA period picker and expense filter work rather than new indexed budget flows.
- Blockers: None in code. Real Telegram WebView visual smoke remains pending because authenticated TMA launch context is required.
- Next steps: Open the TMA through the normal Telegram/local launch path and confirm `/budgets`, `/budgets/new`, and `/budgets/:id` on a narrow Telegram viewport with real seeded household budget data.

## 2026-06-07 — Adjusted TMA create group form spacing

- Who: Codex
- Summary: Updated the TMA create group form so the start date and end date inputs render as two separate full-width rows, and increased the household/context select height for easier mobile tapping. Also restored the existing household card footer usage of its `action` prop so repo lint remains clean in the current dirty worktree.
- Files changed: TMA create group page, one existing household card component lint fix, and feat-097 harness evidence.
- Verification: `./init.sh typecheck` and `./init.sh lint` returned `OK`.
- Blockers: None.
- Next steps: Open `/groups/new` in the TMA mobile viewport and confirm the taller context select and stacked date fields feel right.

## 2026-06-06 — Added TMA group list, create, and detail surfaces

- Who: Codex
- Summary: Added Telegram Mini App group management screens backed by the existing worker group APIs. The Home shortcut now opens the new group hub. TMA routes now include `/groups`, `/groups/new`, and `/groups/:id`. The list loads personal groups plus groups for each joined household, create posts to `/groups` without any avatar flow, and detail reads `/groups/:id`, `/groups/:id/summary`, plus recent expenses filtered by `group_id` with `household_id` when the group is household-backed.
- Files changed: TMA group feature module, route wrappers, router/path wiring, Home shortcut entrypoint, focused group tests, one existing household component lint fix, and feat-097 harness records.
- Verification: `./init.sh typecheck`, `./init.sh lint`, `./init.sh test`, and `./init.sh build` returned `OK`. `jq empty` on touched harness JSON and `git diff --check` returned no output. `./scripts/check_harness_size.sh` passed. Final `./init.sh` completed with `Done!`. Final `gitnexus_detect_changes(scope: 'all', repo: 'household-finance-system')` reported `high` risk with 47 changed symbols and 6 affected processes, mostly from pre-existing dirty TMA expense filter/period picker changes in the worktree rather than the new group files.
- Blockers: None in code. Real Telegram WebView visual smoke remains pending because authenticated TMA launch context is required.
- Next steps: Open the TMA through the normal Telegram/local launch path and confirm `/groups`, `/groups/new`, and `/groups/:id` on a narrow Telegram viewport with real seeded group data.

## 2026-06-05 — Cleaned up TMA expense detail/edit/category UI and dropped note field

- Who: Tùng (via Claude)
- Summary: Refactored TMA expense surfaces to match the canonical `ExpenseItem` category badge pattern (icon + accent bg) and removed the `note` free-text field from both create and edit flows. Extracted the private `CategoryIconBadge` from the finance component into a shared `TmaCategoryIconBadge` (with `sm` and `md` sizes) and removed the now-unused `TmaMonogramBadge`. The `add-expense` flow now requires a user-entered `title` in step 2 (was previously defaulting to `category.label` server-side), and the `add-expense` step 1 category grid lost its redundant `Eyebrow` per tile. The expense detail page dropped the `Mô tả` card and the duplicated `Danh mục` cell, and the edit page dropped the `Ghi chú` card; the edit `UpdateExpenseRequest` payload no longer sends `note`, so existing server-side notes are preserved untouched.
- Files changed: `apps/tma/src/components/shared/tma-page-shell.tsx` (new `TmaCategoryIconBadge`, removed `TmaMonogramBadge` + `IconBadge` import), `apps/tma/src/features/expenses/store.ts` (drop `note`, add `title` to `AddExpenseDraft`; `setDetails` signature), `apps/tma/src/features/expenses/draft.ts` (drop `note` from `createEditExpenseDraft`), `apps/tma/src/features/finance/components/expenses.tsx` (use shared badge), `apps/tma/src/routes/expense-detail.tsx`, `apps/tma/src/routes/expense-edit.tsx` (incl. `ExpenseEditCategoryPage`), `apps/tma/src/routes/add-expense-category.tsx`, `apps/tma/src/routes/add-expense-details.tsx`, `apps/tma/src/routes/add-expense-context.tsx`, and the two related tests.
- Verification: `./init.sh typecheck`, `./init.sh lint`, `./init.sh test`, and full `./init.sh` all returned `OK` / `Done!`. `ExpenseCategorySelection` was extended with optional `iconUrl` so step 2/3 can render the same icon pattern as the list rows.
- Blockers: None. Visual smoke on a real Telegram viewport still pending because the TMA requires launch context.
- Next steps: Open the TMA through Telegram/local launch and confirm the new step 1 category grid, the new step 2 title field, the detail page layout, and the edit page (incl. category picker) all feel right on-device.

## 2026-06-05 — Corrected TMA period picker week logic, scroll behavior, and BottomButton lifecycle

- Who: Codex
- Summary: Applied the requested follow-up fixes to the new TMA period picker. The year column and week/month value list now scroll independently and no longer imply matched heights. Week generation now uses real ISO-style Monday-Sunday weeks instead of naive `Jan 1 + 7-day blocks`, so `2026` week `1` resolves to `29/12/25 - 04/01/26`. Inside the picker, range previews and option descriptions now use `dd/MM/yy`, and the picker BottomButton is mounted/hidden only once in a dependency-free effect while later candidate changes only update its params to avoid flicker.
- Files changed: TMA period helpers, the TMA BottomButton helper, picker page UI/layout, focused period tests, and feat-096 harness evidence.
- Verification: Focused `pnpm --filter tma exec vitest run src/test/period.test.ts` passed with 7 tests. Focused `pnpm --filter tma exec vitest run src/test/period-store-and-picker.test.tsx` passed with 2 tests. `./init.sh build` returned `OK`. Final `./init.sh` completed with `Done!`.
- Blockers: None.
- Next steps: Open the TMA picker on a real narrow Telegram viewport and confirm the two scroll columns feel natural with long year/week lists, especially around ISO week 1 and week 53 boundaries.

## 2026-06-05 — Added shared TMA period picker and range-backed analytics sync

- Who: Codex
- Summary: Completed `feat-096` by adding one shared TMA period chip and `/period` picker route for week/month/year presets, storing the selected range in a small Zustand store, and rewiring Home, household list, and household detail to read the same selected analytics range. Worker analytics overview/comparison now accept additive `date_from` / `date_to` queries without breaking existing month callers, while household/home budget UI stays month-only and explicitly says so for week/year views.
- Files changed: Worker analytics schema/handler tests and range helpers, TMA period utilities/store/picker route, TMA home/household summary surfaces, router/path wiring, exec-plan index/state, and feat-096 harness records.
- Verification: Focused worker tests passed for `test/unit/dto-analytics.spec.ts`, `test/integration/analytics-overview-read.spec.ts`, and `test/integration/analytics-comparison.spec.ts`. Focused TMA tests passed for `src/test/period.test.ts`, `src/test/period-chip-entrypoints.test.tsx`, and `src/test/period-store-and-picker.test.tsx`. `./init.sh typecheck`, `./init.sh lint`, `./init.sh test`, and `./init.sh build` returned `OK`. Final `./init.sh` completed with `Done!`. `git diff --check` returned no output. Final `gitnexus_detect_changes(scope: 'all', repo: 'household-finance-system')` reported `critical` risk with 132 changed symbols, 24 affected symbols, and 23 changed files, expected because the slice touches shared TMA period helpers, shared finance summary cards, household list routing, and worker analytics query contracts.
- Blockers: None in code or verification. Plain browser smoke is limited because the TMA still expects Telegram launch context for full authenticated runtime behavior.
- Next steps: Open the TMA through the normal Telegram/local launch path and confirm the new picker flow on Home, household list, and household detail feels right on-device, especially the week/year budget fallback copy and BottomButton confirm behavior.

## 2026-06-05 — Restyled shared TMA expense rows

- Who: Codex
- Summary: Restyled the shared TMA expense row used by the expenses list and recent expense surfaces. Rows now render the category icon from the reference-category API, tint the icon container with the category color at 10% alpha, show category label first and expense title second, and no longer show expense note or occurred time.
- Files changed: TMA finance expense smart component, category presentation helper, focused presentation/component tests, and feat-095 harness evidence.
- Verification: `./init.sh typecheck`, `./init.sh lint`, `./init.sh test`, and `./init.sh build` returned `OK`. Final `./init.sh` completed with `Done!`. Final `gitnexus_detect_changes(scope: 'all', repo: 'household-finance-system')` reported `low` risk with 10 changed symbols, 0 affected symbols/processes, and 5 changed files.
- Blockers: None.
- Next steps: Open the TMA expenses list and Home recent-expense section on a narrow mobile viewport to visually confirm the new row hierarchy and icon image sizing.

## 2026-06-05 — Fixed TMA component/page review notes

- Who: Codex
- Summary: Addressed the review notes from the TMA Tailwind rewrite. `StatisticsPage` now renders live analytics/reference-category data for the selected month instead of `mock-data`, with the range control filtering/grouping returned monthly data without inventing unavailable year-level API data. Add-expense category selection now reads `/categories`, source selection uses canonical `SOURCE_KEYS`, expense navigation paths use route helpers, and the large finance smart-component barrel was split into summary, expenses, households, shortcuts, and link-button modules. The stale finance mock-data module was removed.
- Files changed: TMA finance smart components, statistics and add-expense/expense routes, expense presentation/store helpers, route constants, focused store test, and feat-095 harness evidence/progress records.
- Verification: `./init.sh typecheck`, `./init.sh lint`, `./init.sh test`, and `./init.sh build` returned `OK`. Final `./init.sh` completed with `Done!`. `jq empty` on touched harness JSON and `git diff --check` returned no output before final `./init.sh`. Final `gitnexus_detect_changes(scope: 'all', repo: 'household-finance-system')` reported `critical` risk with 94 changed symbols, 41 affected symbols, and 13 changed files across the expected Statistics/add-expense/expense detail-edit flows.
- Blockers: None.
- Next steps: Reopen the TMA Statistics and add-expense flow in Telegram/local preview to visually confirm the live empty/loading/data states on a narrow mobile viewport.

## 2026-06-05 — Reviewed TMA Tailwind components and pages

- Who: Codex
- Summary: Re-audited the TMA Tailwind rewrite across shared UI primitives, smart finance components, route pages, shared shell, route constants, and `index.css`. The structure is broadly reasonable for the requested rewrite: UI primitives stay feature-free, smart finance components own their read queries, household detail no longer falls through to not-found while loading, and `index.css` is limited to Tailwind import, tokens, base reset, and keyframes. Remaining review notes are non-blocking but important: statistics and add-expense category/source still depend on local mock/static data, several routes still hardcode path strings instead of route helpers, and `features/finance/components/index.tsx` is now large enough to split by ownership.
- Files changed: Harness evidence and progress metadata only.
- Verification: `./init.sh typecheck`, `./init.sh lint`, `./init.sh test`, and `./init.sh build` returned `OK`.
- Blockers: None.
- Next steps: Decide whether to tackle the review notes as a cleanup slice before expanding TMA group/budget/statistics features.

## 2026-06-05 — Fixed TMA household detail loading crash

- Who: Codex
- Summary: Investigated the reported issue where tapping a household from Home or the household list showed the TMA not-found screen. The route matcher confirmed `/households/:id` was valid, so the root cause was render-time: `HouseholdDetailPage` evaluated `household!.avatarUrl`, `household!.name`, and `household!.role` inside `DataState` children before the household detail query had loaded. React Router caught that render error and displayed the route `errorElement`, which looked like a missing page. The fix only creates the detail content once `household` exists and shows an explicit empty state if the query completes without data.
- Files changed: TMA household detail page, a focused household-detail regression test, and feat-095 evidence/progress records.
- Verification: Focused `pnpm --filter tma exec vitest run src/test/household-detail-page.test.tsx` passed. `./init.sh typecheck`, `./init.sh lint`, `./init.sh test`, and `./init.sh build` returned `OK`. Final `./init.sh` completed with `Done!`.
- Blockers: None.
- Next steps: Reopen the TMA and tap household cards from both Home and the household list to confirm the loading card appears briefly and then the detail page renders.

## 2026-06-05 — Rewrote TMA pages around Tailwind primitives and smart components

- Who: Codex
- Summary: Completed `feat-095` by replacing existing TMA route/page styling with Tailwind utility composition and shared components. Added TMA-local UI primitives for buttons, cards, form fields, chips, avatars, money labels, data states, and segmented controls, plus smart finance components for summaries, shortcuts, recent expense lists/timelines, expense items, and household preview/list items. The add-expense confirmation step now calls the real worker-backed create expense mutation and invalidates related read surfaces. `apps/tma/src/index.css` now contains only Tailwind import, tokens, theme mappings, base reset, and the spinner keyframe.
- Files changed: TMA shared shell/UI components, TMA finance smart components, Home/Statistics/Expenses/add-expense/expense detail-edit/household/fatal/not-found routes, TMA expense API/store/mock fixtures, TMA CSS and design docs, focused tests, ExecPlan and harness records.
- Verification: `./init.sh typecheck`, `./init.sh lint`, `./init.sh test`, and `./init.sh build` each returned `OK`. Final `./init.sh` completed with `Done!`. `git diff --check` returned no output. CSS/custom-class scan found no old BEM-style component class usage in `apps/tma/src` and no `@layer components` in `apps/tma/src/index.css`. Final `gitnexus_detect_changes(scope: 'all', repo: 'household-finance-system')` reported `critical` risk with 145 changed symbols, 78 affected symbols, and 37 changed files, expected for the requested TMA shell/page rewrite.
- Blockers: None.
- Next steps: Open the TMA in Telegram or a mobile WebView preview and do a visual pass across Home, Statistics, Expenses, add-expense, expense detail/edit, and household screens.

## 2026-06-05 — Extended the shared TMA data-state pattern to household pages

- Who: Codex
- Summary: Continued the `DataState` follow-up by applying the shared TMA-local `TmaDataState` component to the household surfaces as well. `HouseholdListPage` now uses it for the main list query states, including the empty-state CTA to create a new household. `HouseholdDetailPage` now uses the same pattern for its top-level detail load failure plus the recent-expenses and members sections, with section-local retry actions preserved. I intentionally did not force the pattern into the editable form or avatar blocks because those are not query-state placeholders and would only add abstraction noise.
- Files changed: Two TMA household pages plus feat-082 evidence and this progress log.
- Verification: `./init.sh typecheck` returned `OK`. Focused lint verification `pnpm --filter tma exec eslint src/features/households/pages/household-list-page.tsx src/features/households/pages/household-detail-page.tsx src/components/shared/tma-data-state.tsx` passed clean. Final `gitnexus_detect_changes(scope: 'all', repo: 'household-finance-system')` reported `medium` risk, surfacing touched `HouseholdListPage` and `HouseholdDetailPage` symbols with 5 affected list/detail/member/overview processes.
- Blockers: None.
- Next steps: Open the household list and detail screens in the TMA and confirm the new placeholder cards still feel proportionate on small mobile viewports, especially the top-level detail failure state and the empty members state.

## 2026-06-05 — Applied a TMA-local DataState pattern to Home query sections

- Who: Codex
- Summary: Reviewed `apps/web/src/components/shared/data-state.tsx` and confirmed the pattern is useful for TMA, but direct reuse is not allowed because `apps/tma` must not import UI code from `apps/web`. Implemented a TMA-local equivalent at `apps/tma/src/components/shared/tma-data-state.tsx` using existing `tma-empty-card` and `tma-action-button` styles, then applied it to the Home overview, households, and recent-expenses sections. This removes repeated `loading/error/empty` branching while preserving TMA visuals and per-section retry behavior. I intentionally did not force it onto `HomeShortcutsSection` because that section is static and has no async data state to normalize.
- Files changed: One new shared TMA state component, three TMA Home query sections, feat-083 evidence, and this progress log.
- Verification: `./init.sh typecheck` returned `OK`. Focused lint verification `pnpm --filter tma exec eslint src/components/shared/tma-data-state.tsx src/features/home/components/home-overview-section.tsx src/features/home/components/home-households-section.tsx src/features/home/components/home-recent-expenses-section.tsx` passed clean. Final `gitnexus_detect_changes(scope: 'all', repo: 'household-finance-system')` reported `low` risk with `3` changed files and no changed symbols or affected processes surfaced by the index.
- Blockers: None.
- Next steps: Open the TMA Home screen and confirm the empty/error/loading cards still feel balanced in mobile layout, especially the overview section now that its initial hard-failure state uses the shared placeholder card.

## 2026-06-05 — Replaced TMA Home shortcut symbols with lightweight inline icons

- Who: Codex
- Summary: Updated the TMA Home shortcuts section so the four shortcut badges no longer show two-letter symbols. The section now renders small inline SVG icons for expenses, households, groups, and budgets while preserving the existing accent colors, badge size, haptics, and card layout. I initially tested a `lucide-react` path, but removed it to keep the change maximally local and avoid dependency plus lockfile churn for just four icons.
- Files changed: One TMA Home component plus feat-092 evidence and this progress log.
- Verification: `./init.sh typecheck` returned `OK`. Focused lint verification `pnpm --filter tma exec eslint src/features/home/components/home-shortcuts-section.tsx` passed with no output. Final `gitnexus_detect_changes(scope: 'all', repo: 'household-finance-system')` reported `low` risk with `1` changed file and no changed symbols or affected processes.
- Blockers: None.
- Next steps: Open the TMA Home screen in the Mini App or local preview and confirm the icon strokes feel balanced against the existing badge size on a real mobile viewport.

## 2026-06-04 — Re-aligned TMA init/theme flow with the local SDK docs

- Who: Codex
- Summary: Re-read the local `docs/library/tma-js-sdk/*` docs for `init`, `miniApp`, `viewport`, `themeParams`, `initData`, and `swipeBehavior`, then simplified the bootstrap flow to match those docs instead of relying on custom fullscreen choreography. `initTelegram()` now follows the documented order much more closely: `init()`, mount `themeParams`, mount `miniApp`, bind CSS vars, set the app-owned background colors, call `ready()`, mount `viewport`, expand, then request fullscreen without the previous `requestAnimationFrame + setTimeout` chain. In parallel, `theme.ts` no longer derives `--tma-base-bg` from `themeParams.bgColor()`; it keeps the app-owned `DEFAULT_TMA_BG` stable while still binding Telegram CSS vars through the SDK helpers. This isolates Telegram theme tokens from the intentional light TMA surface design and removes the white-background regression path.
- Files changed: Telegram init/theme runtime code, focused startup/theme regression tests, feat-094 evidence, and this progress log.
- Verification: Focused startup/theme tests passed with 11 tests across 3 files. `pnpm --filter tma typecheck` passed. `pnpm --filter tma build` passed. `./init.sh test` returned `OK`. Final `./init.sh` completed with `Done!`. `git diff --check` stayed clean. Final `gitnexus_detect_changes(scope: 'all', repo: 'household-finance-system')` reported `high` risk with 9 changed files, 11 changed symbols, and 7 affected processes, concentrated in init/theme/App lifecycle wiring.
- Blockers: None in code or verification. Real confirmation now depends on retesting inside Telegram itself.
- Next steps: Open the Mini App inside Telegram and confirm two user-visible behaviors: the TMA background stays on the intended light base color again, and fullscreen is requested successfully without the previous regression.

## 2026-06-04 — Fixed the TMA fullscreen regression caused by React StrictMode teardown

- Who: Codex
- Summary: Investigated the reported fullscreen regression and found the root cause in lifecycle ownership, not Telegram config values. `initTelegram()` still scheduled fullscreen correctly, but `App` was calling `teardownTelegram()` from a React effect cleanup while the root was still wrapped in `StrictMode`. In dev, React replays the effect as `mount -> cleanup -> mount`, so the cleanup path was canceling fullscreen scheduling before `requestFullscreen()` could run. The fix removes Telegram teardown from the React effect cleanup path and moves it to module/HMR disposal in `main.tsx`, which preserves fullscreen scheduling while still giving us a real teardown hook when the module is replaced.
- Files changed: TMA app lifecycle wiring, TMA main entry teardown ownership, feat-094 evidence, and this progress log.
- Verification: Focused startup/auth tests passed with 11 tests across 3 files. `pnpm --filter tma typecheck` passed. `./init.sh lint` returned `OK`. `./init.sh test` returned `OK`. Final `./init.sh` completed with `Done!`. `git diff --check` stayed clean. Final `gitnexus_detect_changes(scope: 'all', repo: 'household-finance-system')` reported `high` risk with 2 changed files, 2 changed symbols, and 7 affected processes, centered on `App` lifecycle wiring.
- Blockers: None.
- Next steps: Re-test the Mini App inside Telegram dev/runtime and confirm fullscreen now requests correctly again. If you want more refactor after that, the next remaining work is no longer low-risk cleanup; it is broader architectural cleanup like cross-surface helper sharing or TMA/web label unification.

## 2026-06-04 — Removed unsafe casts from TMA expense edit flow and hardened init timer cleanup

- Who: Codex
- Summary: Continued `feat-094` with one last type-safety pass in the TMA expense edit flow. Introduced a typed `createEditExpenseDraft()` helper, aligned `EditExpenseDraft` and `UpdateExpenseRequest` to `CategoryKey`/`SourceKey`, and removed the remaining `as any` casts from `expense-edit.tsx`. While verifying that pass, full repo tests exposed a real unhandled-timer problem in `initTelegram()`: the deferred fullscreen `setTimeout` chain could outlive teardown and touch `window` after the test environment was gone. `initTelegram()` now tracks RAF/timeouts and cancels them in its cleanup wrapper, which is also the correct runtime behavior beyond tests.
- Files changed: TMA startup bootstrap timer scheduling, TMA expense edit API/store/route typing, new typed expense-draft helper and test, feat-094 evidence, and this progress log.
- Verification: Focused expense-edit helper tests passed with 7 tests across 3 files. Focused startup/auth tests passed with 11 tests across 3 files. `./init.sh lint` returned `OK`. `./init.sh test` returned `OK`. Final `./init.sh` completed with `Done!`. `git diff --check` stayed clean. Final `gitnexus_detect_changes(scope: 'all', repo: 'household-finance-system')` reported `medium` risk with 4 changed files, 15 changed symbols, and 5 affected processes, concentrated in `expense-edit.tsx` and `telegram-init.ts`.
- Blockers: None.
- Next steps: `feat-094` no longer has obvious low-risk cleanup left. If we continue, the next refactor tier is broader and more semantic: category-label/i18n unification or a real shared pure-helper package across `web` and `tma`.

## 2026-06-04 — Extracted period and media constants into dedicated TMA helper modules

- Who: Codex
- Summary: Continued the `feat-094` cleanup pass with the last clear low-risk extraction inside `apps/tma`. Moved `getCurrentPeriod()` out of `home/presentation.ts` into dedicated utility module `apps/tma/src/lib/period.ts`, moved `MAX_AVATAR_SIZE_BYTES` into `apps/tma/src/lib/media/constants.ts`, and updated the Home and Household surfaces plus avatar section to use those dedicated helpers. This does not create cross-app code sharing yet; it simply stops small shared values from hiding inside unrelated presentation files.
- Files changed: New TMA period and media-constants helper modules, touched TMA home/household call sites, a focused period regression test, feat-094 evidence, and this progress log.
- Verification: Focused helper tests passed with 10 tests across 4 files. `pnpm --filter tma typecheck` passed. `./init.sh lint` returned `OK`. `./init.sh test` returned `OK`. Final `./init.sh` completed with `Done!`. `git diff --check` stayed clean. Final `gitnexus_detect_changes(scope: 'all', repo: 'household-finance-system')` reported `low` risk with 6 changed files and no changed symbols/affected processes surfaced for this move-only helper slice.
- Blockers: None.
- Next steps: The remaining meaningful refactor work is no longer in the low-risk bucket. If we continue `feat-094`, the next candidates are broader cross-surface decisions such as category-label/i18n unification or a real shared code package for web+TMA pure helpers.

## 2026-06-04 — Extracted shared expense-route presentation helpers in TMA

- Who: Codex
- Summary: Continued the `feat-094` cleanup pass with a very narrow pure-helper extraction inside the expense surface. Moved duplicated payment-source labeling and household-name lookup logic into new shared helpers under `apps/tma/src/features/expenses/presentation.ts`, then switched `ExpensesPage`, `ExpenseDetailPage`, and `ExpenseEditPage` to use them. This cuts repeated route-local code without touching higher-risk category formatting, auth bootstrap, or shared shell behavior.
- Files changed: New TMA expense presentation helper module, the three TMA expense routes that previously duplicated those helpers, a focused helper regression test, feat-094 evidence, and this progress log.
- Verification: Focused helper tests passed (`9` tests across `3` files). `pnpm --filter tma typecheck` passed. `./init.sh lint` returned `OK`. `./init.sh test` returned `OK`. Final `./init.sh` completed with `Done!`. `git diff --check` stayed clean. Final `gitnexus_detect_changes(scope: 'all', repo: 'household-finance-system')` reported `high` risk with `3` changed files, `12` changed symbols, and `14` affected processes, all concentrated in the expected expense routes.
- Blockers: None.
- Next steps: `feat-094` can stop here as a stable runtime/navigation/helper baseline, or continue later with the remaining optional duplication work (`getCurrentPeriod`, avatar-size constant, category-label/i18n unification) if we want a broader shared-helper cleanup pass.

## 2026-06-04 — Continued feat-094 with isolated shell/navigation refactor and cleanup

- Who: Codex
- Summary: Continued `feat-094` with the shared shell pass that had been intentionally deferred because of its blast radius. `TmaPageShell` back-navigation now trusts only React Router's own `history.state.idx` for in-app back and no longer falls back to `window.history.length`, so cold-open detail screens cannot accidentally escape the Mini App stack. The router keeps `/home` only as a replace-redirect alias into `/`, preserving one canonical home screen while keeping old links compatible. This pass also cleaned up a few low-risk leftovers inside the same scope: reused the shared `closeMiniApp` helper in both fatal screens and removed the dead `loadingFallback` prop from `AuthBootstrap`.
- Files changed: Shared TMA shell navigation helper, TMA router alias handling, a focused shell-navigation regression test, fatal-launch helper reuse, auth bootstrap prop cleanup, feat-094 evidence, and this progress log.
- Verification: Focused TMA shell/navigation regression tests passed with 27 tests across 7 files. `./init.sh typecheck`, `./init.sh lint`, `./init.sh test`, `./init.sh build`, and final `./init.sh` all passed (`OK` / `Done!`). `git diff --check` remained clean. Final `gitnexus_detect_changes(scope: 'all', repo: 'household-finance-system')` reported `critical` risk with 5 changed files, 12 changed symbols, and 49 affected processes, concentrated in `TmaPageShell`, `AuthBootstrap`, and `app-router.tsx` as expected for this isolated shared-shell follow-up.
- Blockers: None in code or verification. `feat-094` is still intentionally open because some helper normalization work remains if we want to continue shrinking duplication.
- Next steps: Decide whether to finish the remaining lightweight helper extraction in `feat-094` now or stop here and treat the current milestone as the stable runtime/navigation baseline for subsequent TMA slices.

## 2026-06-04 — Hardened TMA startup/auth runtime and reduced eager route bundle weight

- Who: Codex
- Summary: Started `feat-094` as a dedicated TMA hardening pass and completed the first milestone. The TMA now catches Telegram SDK startup failures before React render and routes them into the existing fatal launch UI instead of crashing on missing launch params. Safe-area vars now bind through the SDK viewport CSS-var bridge so they stay reactive after mount/fullscreen changes, SecureStorage read/delete failures now degrade permanently into explicit memory-only mode, and unreachable auth-bootstrap branches were removed. The router now lazy-loads route modules behind `Suspense`, which reduced the eager TMA entry chunk from about `525.83 kB` minified / `161.66 kB` gzip to `436.00 kB` minified / `139.30 kB` gzip. As a small UX follow-up, create-household avatar patch failures now survive navigation into the detail page instead of being lost on unmount.
- Files changed: TMA startup/bootstrap wiring, theme/safe-area bridge, auth/storage control flow, route loader composition, a create-household/detail feedback handoff, focused TMA regression tests, new feat-094 plan/harness records, and this progress log.
- Verification: Focused TMA Vitest run passed with 24 tests across 6 files. `./init.sh lint` returned `OK`. `./init.sh build` returned `OK`. Final `./init.sh` completed and printed `Done!`. `git diff --check` returned clean. Final `gitnexus_detect_changes(scope: 'all', repo: 'household-finance-system')` reported `critical` whole-worktree blast radius because the milestone spans startup, auth, router, and shared presentation surfaces together.
- Blockers: `TmaPageShell` back-navigation fallback tightening is intentionally deferred for now because GitNexus marks that shared shell as `CRITICAL` blast radius and it needs a narrower dedicated pass.
- Next steps: Finish `feat-094` by deciding whether to normalize or retire the legacy `TMA_PATHS.home` constant, revisit `TmaPageShell` back-navigation fallback in isolation, and optionally extract the remaining duplicated pure helpers (`closeMiniApp`, current-period helpers, avatar size constant, household name map) only after a targeted shell-risk review.

## 2026-06-04 — Restored TMA page-shell scroll position on back navigation

- Who: Codex
- Summary: Traced the TMA scroll-restoration regression to a mismatch between the current worktree and the actual scroll root. The earlier in-memory `page-memory` implementation had been removed, and the root route was relying on React Router's `ScrollRestoration`, but that helper only restores `window.scrollY` while the Telegram Mini App scrolls inside `main.tma-page-shell__content`. Added a TMA-specific container restoration hook keyed by the router location, wired it into `TmaPageShell`, removed the misleading root `ScrollRestoration`, and added a focused regression test that reproduces list -> detail -> back and verifies the previous `scrollTop` is restored.
- Files changed: TMA root layout, shared TMA page shell, new TMA container-scroll restoration hook, focused regression test, feat-091 harness evidence, and this progress log.
- Verification: `./node_modules/.bin/vitest run src/test/scroll-restoration.test.tsx` passed. `./init.sh build` passed with `OK`. Final repo verification `./init.sh` completed and printed `Done!`. `gitnexus_detect_changes(scope: 'all', repo: 'household-finance-system')` reported `critical` whole-worktree blast radius with 18 changed symbols across 11 files because unrelated TMA household and shell follow-ups are also present in the active worktree.
- Blockers: None for this scroll fix. Real Telegram/on-device smoke is still pending because this environment cannot provide Telegram launch params.
- Next steps: Open a long TMA list inside Telegram, navigate into a detail screen, then go back and confirm the content returns to the previous scroll position instead of resetting to the top.

## 2026-06-04 — Added a dedicated TMA create-household page with shared avatar flow

- Who: Codex
- Summary: Replaced the inline create-household composer on the TMA household list page with a dedicated `/households/new` page that accepts both `name` and `avatar`. The avatar interaction now reuses the same shared household-avatar component as the detail page, so both create and detail follow one maintainable flow: pick file, preview in dialog, apply upload, then persist the resulting `avatarUrl` through the household API. The create page submits `POST /households` first, then applies the uploaded avatar to the new household via `PATCH /households/:id`, matching the existing web/API capabilities instead of inventing a new create contract.
- Files changed: TMA household list page, new create-household page/route, route constants/router wiring, shared household avatar component, feat-082 harness evidence, and this progress log.
- Verification: `pnpm --filter tma typecheck` passed. `pnpm --filter tma build` passed. `pnpm --filter tma lint` completed with only the two known pre-existing `no-console` warnings in `apps/tma/src/lib/i18n/index.ts` and `apps/tma/src/lib/storage/adapter.ts`.
- Blockers: Full repo-level `./init.sh` was not rerun for this follow-up because the active worktree still contains unrelated TMA verification blockers outside the household create slice.
- Next steps: Open `/households/new` inside Telegram, verify the preview/apply avatar timing feels right on-device, and confirm the create -> patch avatar sequence lands on the new household detail page with the chosen image.

## 2026-06-04 — Aligned TMA household avatar flow with the existing web profile-avatar flow

- Who: Codex
- Summary: Refined the household detail avatar UX in `apps/tma` so it now follows the same interaction pattern already used by the web profile-avatar flow. The household detail page no longer uploads avatar changes as part of the general settings form. Instead, selecting a file opens a preview dialog, the dialog's apply action uploads through the signed Cloudinary helper and patches only `avatarUrl`, and avatar-specific validation/upload failures stay local to the avatar card instead of mixing into the household-name save flow.
- Files changed: TMA household detail page, new TMA household avatar section/dialog components, shared TMA style sheet, feat-082 harness evidence, and this progress log.
- Verification: `pnpm --filter tma typecheck` passed. `pnpm --filter tma build` passed. `pnpm --filter tma lint` completed with only the two known pre-existing `no-console` warnings in `apps/tma/src/lib/i18n/index.ts` and `apps/tma/src/lib/storage/adapter.ts`; no new lint errors remained from this follow-up. Harness JSON parse checks still printed `OK`, and `./scripts/check_harness_size.sh` still passed after updating feat-082 evidence.
- Blockers: A final repo-level `./init.sh` attempt after this follow-up is currently blocked by out-of-scope worktree issues in other TMA files: `apps/tma/src/routes/expense-edit.tsx` has a type mismatch, and `git diff --check` reports an unrelated blank-line issue in `apps/tma/src/features/expenses/store.ts`.
- Next steps: Smoke test the new avatar preview/apply flow inside Telegram with the seeded household data to confirm the dialog and upload timing feel right on-device.

## 2026-06-04 — Implemented TMA expense detail view with edit and delete capabilities

- Who: Antigravity
- Summary: Designed and implemented the expense detail screen in the Telegram Mini App (TMA). Created `api.ts` under the `expenses` feature package to wrap `GET /expenses/:id`, `PATCH /expenses/:id`, and `DELETE /expenses/:id` routes with query options and mutations, including comprehensive cache invalidation for the list, analytics, and budget queries. Built `expense-detail.tsx` route with View mode (renders monogram badges, large money amounts in JetBrains Mono font, occurred dates/times, payment source, household info, and notes) and Edit mode (uses inline forms, custom inputs, chip grids, and binds the Telegram BottomButton for saving). Configured `/expenses/:id` in `app-router.tsx`. Replaced the mock data rendering in the `/expenses` list view with live backend query data and linked recent expense clicks in both the Home dashboard and the history list to the new detail page. Addressed a pre-existing missing `lucide-react` workspace dependency inside `apps/tma/package.json` that broke typechecking.
- Files changed: apps/tma/package.json, pnpm-lock.yaml, apps/tma/src/app/router/app-router.tsx, apps/tma/src/features/expenses/api.ts, apps/tma/src/routes/expense-detail.tsx, apps/tma/src/routes/home.tsx, apps/tma/src/routes/expenses.tsx, harness/feature_index.json, harness/features/feat-093.json, and this progress log.
- Verification: Running `./init.sh typecheck` passed with `OK`. Running `./init.sh lint` passed with `OK`. Running `./init.sh test` passed with `OK`. Running `./init.sh build` passed with `OK`. Running `gitnexus detect-changes` mapped hunks to the updated pages/routes with a LOW blast radius.
- Blockers: None.
- Next steps: Ask the user to verify the expense detail view, inline editing, and deletion flow inside their Telegram Mini App.

## 2026-06-04 — Built TMA household list/detail screens and household avatar flow

- Who: Codex
- Summary: Added the first dedicated household-management surfaces to the Telegram Mini App under `feat-082`. The worker now persists an additive `household.avatarUrl` field through migration `0002_household_avatar.sql`, exposes it on create/list/detail/update responses, and accepts avatar updates on the existing household patch route. On the TMA side, the app now has centralized route constants, a shared authenticated API client, signed Cloudinary upload helpers, a live `/households` list page with create-household entry, and a `/households/:id` detail page with avatar setup at the top, admin-only name/avatar editing, current-month spend/budget summary, recent household expenses, and member list. The home screen's `Gia đình` shortcut and household cards now open these new routes directly.
- Files changed: Worker household contract/repository/handler/migration/test files, TMA shared route/API/media helpers, new TMA household feature files and routes, TMA home/router/shell/style updates, worker local seed SQL, feat-082 harness evidence, exec-plan tracking, and this progress log.
- Verification: Focused worker verification passed with `pnpm --filter worker exec vitest run test/unit/dto-household.spec.ts test/integration/households-read-update.spec.ts` (18 tests). Focused TMA verification passed with `pnpm --filter tma typecheck` and `pnpm --filter tma exec vitest run src/test/home-presentation.test.ts src/test/household-presentation.test.ts` (6 tests). Focused TMA build passed with `pnpm --filter tma build` despite a non-blocking Vite chunk-size warning. Local D1 verification passed: `pnpm --filter worker db:migrate:local` applied `0002_household_avatar.sql`, `pnpm --filter worker db:seed:local` succeeded, and a follow-up query confirmed the Telegram test account sees `Demo Household` and `City Loft` with non-null `avatar_url` values. Final repo verification then passed on the updated harness state: touched harness JSON parse checks printed `OK`, `./scripts/check_harness_size.sh` printed `Harness size checks passed`, `git diff --check` was clean, `./init.sh build` printed `OK`, and final `./init.sh` completed with `Done!`. `gitnexus_detect_changes(scope: all, repo: household-finance-system)` returned `critical`, but that result reflects the whole active TMA worktree, including other route/shell edits outside this narrow household slice.
- Blockers: Real Telegram/on-device smoke for the new household screens is still pending because this environment cannot launch the Mini App inside a live Telegram session.
- Next steps: Run the final repo-level verification chain on the updated harness state, then open the Mini App with the Telegram test account to confirm the new household routes and avatar card feel correct on-device.

## 2026-06-04 — Configured JetBrains Mono for TMA currency displays

- Who: Antigravity
- Summary: Configured and integrated the JetBrains Mono font for formatting numbers/currency values in the Telegram Mini App (TMA) to improve visual consistency and scanning. Loaded the font minimally via Google Fonts with a strict character subset (digits, decimals, currency symbols, and percentage sign) to prevent bundle size overhead, and defined a `.font-mono` utility class. Integrated this class across key TMA screens: Home (subtitles, totals, remaining budgets, latest spend, list values), Expenses (timeline list items, saved preview banner), Statistics (hero card total, legends, ranking amounts), and Add Expense details/contexts (amount input, preview text). Updated the shared TmaPageHeader to accept ReactNode subtitles to support rich inline styling.
- Files changed: TMA main style sheet (index.css), shared TMA shell (tma-page-shell.tsx), Home page (home.tsx), Expenses list (expenses.tsx), Statistics (statistics.tsx), and Add Expense routes (add-expense-details.tsx, add-expense-context.tsx).
- Verification: Running `./init.sh lint` passed with `OK`. Running `./init.sh typecheck` passed with `OK` (resolved a ReactNode/string typing issue on TmaPageHeader subtitle). Running `./init.sh test` passed with `OK`. Running `./init.sh build` passed with `OK`. Running `npx gitnexus detect-changes --repo household-finance-system --scope all` successfully detected 19 files and 50 symbols changed with the expected affected execution flows.
- Blockers: none.
- Next steps: Ask the user to verify the JetBrains Mono typography for money numbers on their Telegram Mini App screen.

## 2026-06-04 — Expanded local seed coverage for the Telegram test account

- Who: Codex
- Summary: Reworked `apps/worker/seeds/local/dev.sql` so the local demo data for Telegram user `01KT3YMJ8GHFQD6K0RM4FJEJT4` is no longer a single-expense stub. The seed now uses rerunnable upserts for seed-owned rows, preserves the real Telegram-created user profile if it already exists locally, and fills the account with meaningful read-surface data: 2 households, multiple household members, 10 household categories, 5 active groups, 4 household budgets across the current and previous month, and a broader expense history spanning personal and household scopes over many dates. The new expense rows also populate `category_key`, `source_key`, budget-limit `category_key`, and group-assignment rows consistently so analytics, budgets, group summaries, and feed views all read useful local data instead of sparse placeholders.
- Files changed: Worker local seed SQL, feat-083 harness evidence, and this progress log.
- Verification: `pnpm --filter worker db:seed:local` passed after one follow-up fix for an existing membership unique-key collision and a deliberate cleanup of seed-owned `expense_group_items` rows before reinsertion. Local D1 verification queries then confirmed the target account now has 2 memberships (`City Loft` admin, `Demo Household` member), 5 active groups, 4 budgets over `2026-05` and `2026-06`, 24 user-owned expenses across personal + both household scopes, 15 distinct expense dates, and 10 grouped expense assignments. Final repo verification with `./init.sh` completed and printed `Done!`.
- Blockers: none.
- Next steps: Keep this richer seed as the default local test bed for TMA read surfaces, then continue building the remaining group/budget/statistics pages against it.

## 2026-06-04 — Wired live worker data into the TMA home page

- Who: Codex
- Summary: Replaced the TMA home screen's mock finance data with real worker-backed queries while preserving the current mobile-first layout. The new TMA home data layer reads analytics overview/comparison, households, household members, household budgets, recent expenses, and reference categories through typed TanStack Query options scoped to `apps/tma`, then maps those contracts into the existing summary card, household carousel, and recent-expense list with graceful loading/empty/error states. To make local Telegram verification practical, the worker local seed file was also repaired against the current D1 schema, converted to current-month dynamic dates, and extended so the Telegram test account `01KT3YMJ8GHFQD6K0RM4FJEJT4` joins the demo household and has visible seeded spend.
- Files changed: TMA home route, new TMA home API/presentation/types helpers and focused tests, worker local seed SQL, feat-083 harness record, feature index, and this progress log.
- Verification: `pnpm --filter tma exec vitest run src/test/home-presentation.test.ts` passed (3 tests). `pnpm --filter tma typecheck` passed. `pnpm --filter tma build` passed. `pnpm --filter tma lint` finished with only the two pre-existing `no-console` warnings in the TMA i18n/storage files and no new lint errors from this work. `pnpm --filter worker db:migrate:local` reported no pending migrations. `pnpm --filter worker db:seed:local` succeeded after the seed SQL was aligned to the live schema. A follow-up local D1 query confirmed the Telegram test account has active membership in `Demo Household`, its seeded `Team lunch` expense exists, and the latest seeded budget month is `2026-06`. Final repo verification: `./init.sh build` exited successfully with `OK`, and `./init.sh` completed and printed `Done!`.
- Blockers: Real Telegram/on-device visual smoke for the authenticated home page is still pending because this environment cannot supply a real Telegram launch context to open the TMA directly inside Telegram.
- Next steps: Open the Mini App with the Telegram test account after running the local worker/TMA dev stack, confirm the live home cards now show seeded household + expense data, then continue feat-083 with the remaining dedicated read surfaces (statistics/groups/budget detail flows).

## 2026-06-04 — Refined TMA home screen minimalism and visual details

- Who: Antigravity
- Summary: Redesigned and polished visual styling of the TMA Home page. Softened font-weights across headings, monograms, text cards, and badges from heavy 800/700 to elegant 700/600, reduced card shadow muddy details for cleaner layouts, adjusted sections spacing/margins, made shortcut grid items more compact, simplified redundant month mentions in page headers, and replaced cluttered double-header section structures with a single elegant section title. Also resolved a critical back-navigation history bug in `TmaPageShell` where the flow-back button caused an infinite loop between step 1 and step 2 of the add-expense page due to redundant push routing; the handler now checks `window.history.state.idx` to cleanly trigger history back (`navigate(-1)`) when navigating inside the SPA and only falls back to `backTo` via `replace` when loaded as a cold landing page.
- Files changed: TMA main style sheet, TMA home page route component, TMA page shell wrapper component, harness feature index, feat-092 feature detail JSON, and this progress log.
- Blockers: none.
- Next steps: Ask the user to verify the visual polish and flow-back navigation fixes on their device.

## 2026-06-03 — Polished TMA header, navigation feel, and home hierarchy

- Who: Codex
- Summary: Fixed the main TMA navigation/UX regressions reported from device use. The remaining home shortcut full-page navigation was replaced with SPA routing and the `/home -> /` redirect was removed so the WebView history no longer churns on normal page changes. The shared TMA shell keeps ownership of the centered title bar, while the larger page-specific headers/contexts now live in each route at the top of the scroll content. After the first pass, a device-style follow-up exposed that the root safe-area vars were still only being applied before `viewport.mount()`, leaving the title too high on iPhone fullscreen. The runtime now resyncs insets after `viewport.mount()` and fullscreen transition, and it uses the max of `safeAreaInsets` and `contentSafeAreaInsets`, so the title bar should clear the Dynamic Island. Added lightweight in-memory page memory for scroll position plus local UI state restoration so going back to `Statistics` or `Expenses` feels more native instead of resetting immediately. The home screen was also tightened around a clearer summary card, stronger shortcut cards, and less dead space.
- Files changed: TMA bootstrap timing, TMA router, shared TMA shell/CSS, TMA page-memory store and test, active TMA route screens, new feat-091 harness record, feature index, and this progress log.
- Verification: Added `apps/tma/src/test/page-memory.test.ts` first, watched it fail because the new page-memory module did not exist, then implemented the store and reran the focused test until it passed. Added `apps/tma/src/test/safe-area.test.ts` first, watched it fail because `mergeSafeAreaInsets()` did not exist, then implemented the helper and reran the focused test until it passed. `./init.sh typecheck`, `./init.sh lint`, `./init.sh test`, and `./init.sh build` all passed with `OK`; final repo verification with `./init.sh` completed and printed `Done!`. `python3 -m json.tool harness/feature_index.json` and `python3 -m json.tool harness/features/feat-091.json` both passed, `./scripts/check_harness_size.sh` returned `Harness size checks passed`, and `git diff --check` returned clean. Final `gitnexus_detect_changes(scope: 'all')` reported `critical` risk with 17 changed symbols across 10 files and 25 affected processes, concentrated in the expected shared TMA shell and route surfaces.
- Blockers: Real Telegram fullscreen smoke is still pending because a plain desktop browser cannot satisfy the TMA launch-context requirement; opening the local app outside Telegram still throws the expected `LaunchParamsRetrieveError`.
- Next steps: Reopen the Mini App inside Telegram fullscreen and confirm three things on-device: home no longer flashes black on first open, internal route changes no longer reload or flash, and back-to-previous-page now restores the prior scroll/filter/range state closely enough to feel native.

## 2026-06-03 — Resolved Telegram bootstrap white screen and SecureStorage hang

- Who: Codex
- Summary: Resolved a reported Telegram Mini App white-screen bug that occurred after successful auth exchange. Source inspection pointed to `AuthBootstrap` returning `null` while bootstrapping, combined with a plausible hang in native Telegram SecureStorage write/read operations. Hardened the boot cycle by showing the loading spinner during auth bootstrapping and implemented a timeout fallback that falls back to memory-only storage instead of letting the authenticated render hang indefinitely.
- Files changed: TMA app bootstrap loading fallback wiring and TMA auth storage timeout fallback.
- Verification: `./init.sh typecheck`, `./init.sh lint`, `./init.sh test`, and `./init.sh build` all passed with `OK`; final repo verification with `./init.sh` completed and printed `Done!`. Browser-only screen previews rendered correctly. `./scripts/check_harness_size.sh` passed.
- Blockers: Real Telegram smoke testing could not be executed directly in this environment, so the fix is verified locally but pending on-device user confirmation.
- Next steps: Ask the user to reopen the Mini App in Telegram and confirm whether the blank screen is gone; if not, inspect the Telegram console for any runtime error after bootstrap/auth completes.

## 2026-06-03 — Built TMA shell and starter screen scaffolds

- Who: Codex
- Summary: Implemented the first real `apps/tma` UI slice from the package-local design spec. The scaffold now has a shared top header, a compact liquid-glass bottom rail with detached add bubble, real routes for `Home`, `Statistics`, `Settings`, `Expenses`, and the three-step add-expense flow, plus a small Zustand draft store for the add-expense flow order (`date + category -> amount + source + note -> household + group + preview`). The pages currently use local mock finance data so the shell and interaction quality can land before worker-query wiring. After implementation, a real Telegram report showed a white screen after successful auth exchange; source inspection pointed to `AuthBootstrap` returning `null` while bootstrapping plus a plausible hang in SecureStorage writes/reads. Follow-up hardening now shows the existing loading spinner during bootstrap and times SecureStorage operations out to the repo-approved memory-only fallback instead of letting the first authenticated render hang forever.
- Files changed: TMA router, shared TMA shell components/icons/CSS, TMA finance mock data and format helpers, TMA add-expense flow store and store tests, TMA route screens, TMA app bootstrap loading fallback wiring, TMA auth storage timeout fallback, new feat-090 harness record, feature index, and this progress log.
- Verification: `./init.sh typecheck`, `./init.sh lint`, `./init.sh test`, and `./init.sh build` all passed with `OK`; final repo verification with `./init.sh` completed and printed `Done!`. Browser-only screen previews rendered `Home`, `Statistics`, `Settings`, `Expenses`, and `Add expense step 1/2` through a temporary `MemoryRouter` + seeded auth harness because desktop browser boot does not have Telegram launch params; layouts looked correct. `python3 -m json.tool harness/feature_index.json` and `python3 -m json.tool harness/features/feat-090.json` both passed. `./scripts/check_harness_size.sh` returned `Harness size checks passed`. Final `gitnexus_detect_changes(scope: 'all')` reported `HIGH` risk with 42 changed symbols across 10 files and 10 affected processes, concentrated in the expected TMA shell/storage/routes surface. `git diff --check` is not fully clean because the worktree already contains unrelated EOF-blank-line diffs in `AGENTS.md` and `CLAUDE.md`. Real Telegram retest is still pending user confirmation.
- Blockers: Real Telegram smoke could not be executed from this environment, so the blank-screen fix is implemented and locally verified but not yet confirmed on-device inside Telegram.
- Next steps: Ask the user to reopen the Mini App in Telegram and confirm whether the blank screen is gone; if not, inspect the Telegram console for any runtime error after bootstrap/auth completes.

## 2026-06-03 — Completed frontend surface docs architecture refactor

- Who: Codex
- Summary: Finished the docs-only frontend architecture refactor so `FRONTEND` now means the full client layer instead of implicitly meaning only `web`. The new structure introduces `docs/WEB.md`, keeps `docs/TMA.md` as a child router, adds a future `docs/MOBILE_APP.md` stub, moves product specs into `shared/web/tma/mobile-app` branches, moves frontend implementation leaves into `docs/references/frontend/web/` and `docs/references/frontend/tma/`, and moves durable design docs into `docs/design-docs/shared/` plus `docs/design-docs/frontend/{web,tma}`. The TMA auth/expense docs were split out of the old flat files, the stale root `docs/product-specs/telegram-mini-app.md` was removed, and active repo guidance plus the repo-owned TMA skill were rewritten to the new tree.
- Files changed: Frontend routers, product-spec branches, frontend reference branches, design-doc branches, AGENTS/CLAUDE/README/ARCHITECTURE, repo-owned TMA skill docs, current TMA harness records, feat-089 plan/index/harness artifacts, and this progress log.
- Verification: `python3 -m json.tool harness/feature_index.json`, `python3 -m json.tool harness/features/feat-080.json`, `python3 -m json.tool harness/features/feat-087.json`, `python3 -m json.tool harness/features/feat-088.json`, and `python3 -m json.tool harness/features/feat-089.json` all passed; `./scripts/check_harness_size.sh` returned `Harness size checks passed`; `git diff --check` returned clean; stale-path scan across current docs and project-owned skills returned `stale-path-scan: clean`; final `gitnexus_detect_changes(scope: 'all')` returned `LOW` risk with 203 changed symbols, 0 affected processes, and 78 tracked changed files.
- Blockers: Historical completed plans and some older harness records still mention old paths inside narrative text. They were left as historical records unless they affected current routing or active work.
- Next steps: Future web work starts at `docs/WEB.md`; future TMA work starts at `docs/TMA.md`; if a native mobile app starts later, fill in the `MOBILE_APP` branches instead of widening web or TMA docs.

## 2026-06-03 — Started frontend surface docs architecture refactor

- Who: Codex
- Summary: Opened a docs-only architecture refactor so the repo no longer treats `FRONTEND` as shorthand for only the web client. The new target shape makes `docs/FRONTEND.md` the parent router for `WEB`, `TMA`, and a future `MOBILE_APP` surface, while product specs, frontend references, and durable design docs split into shared vs surface-specific branches. This session will move current web-only and TMA-only docs into their new homes and rewrite the active router/index docs accordingly.
- Files changed: New ExecPlan, new feat-089 harness record, feature index, exec-plan index, and this progress log.
- Verification: Plan/startup artifact verification pending until the refactor runs; expected checks are harness JSON parse, harness size, whitespace diff, and final GitNexus change detection.
- Blockers: none.
- Next steps: Move the docs tree, rewrite router/index docs, then run docs-only verification and finalize feat-089.

## 2026-06-03 — Aligned TMA docs to the new screen spec

- Who: Codex
- Summary: Replaced the remaining outdated TMA wording so the repo now points to one consistent TMA UI truth before implementation starts. The product-level TMA spec now describes the three root tabs (`Home`, `Statistics`, `Settings`) and the new three-step expense flow (`date + category -> amount + source + note -> household + group + preview`). The package-local `apps/tma/DESIGN.md` no longer carries a mismatch warning and now states the aligned flow directly. The TMA runtime-readiness map, state/storage guidance, native-navigation example, repo-owned TMA skill task map, and the planned feat-081 harness record were all updated so future implementation sessions read the same flow and route model everywhere. The one web-side quick-add note was kept neutral so this session does not redefine the web UI contract.
- Files changed: TMA product/spec/design/reference docs, repo-owned TMA skill task map, planned TMA harness record, new feat-088 harness record, feature index, and this progress log.
- Verification: `python3 -m json.tool harness/feature_index.json`, `python3 -m json.tool harness/features/feat-081.json`, and `python3 -m json.tool harness/features/feat-088.json` all passed; `./scripts/check_harness_size.sh` returned `Harness size checks passed`; `git diff --check` returned clean; final `gitnexus_detect_changes(scope: 'all')` returned `LOW` risk with 23 changed symbols, 0 affected processes, and 11 tracked changed files.
- Blockers: none.
- Next steps: Start the real TMA shell/route implementation against the now-aligned docs, beginning with the root tab shell and expense/history flow shells.

## 2026-06-03 — Added package-local TMA screen design spec

- Who: Codex
- Summary: Added a new package-local `apps/tma/DESIGN.md` that turns the approved TMA direction plus the user-provided reference screens into one implementation-facing UI spec. The new doc locks the first TMA visual language (bright neutral background, oversized white cards, blue/green/yellow accents, compact liquid-glass tab rail, detached add bubble), defines the root shell contract (`Home`, `Statistics`, `Settings` tabs with header on every page and Telegram-owned back behavior for non-root flows), maps the requested pages (`home`, `statistics`, `settings`, `expenses`, `add-expense-1/2/3`), and spells out each screen's composition and performance constraints. The doc also explicitly flags the current repo-truth conflict where the requested add-expense order (`date + category -> amount + source + note -> household + group + preview`) differs from the still-documented amount-first TMA flow, so future code work does not silently diverge from the existing product/TMA specs.
- Files changed: New package-local TMA design spec, TMA docs router entry, new feat-087 harness record, feature index, and this progress log.
- Verification: `python3 -m json.tool harness/feature_index.json` and `python3 -m json.tool harness/features/feat-087.json` both passed; `./scripts/check_harness_size.sh` returned `Harness size checks passed`; `git diff --check` returned clean; final `gitnexus_detect_changes(scope: 'all')` returned `LOW` risk with 4 changed symbols, 0 affected processes, and 3 tracked changed files.
- Blockers: none.
- Next steps: Use `apps/tma/DESIGN.md` as the visual/page reference for the next TMA implementation slice, then reconcile the add-expense step-order mismatch in TMA/product docs before coding that flow.

## 2026-06-03 — Fixed remaining feat-080 auth review regressions

- Who: Codex
- Summary: Closed the remaining correctness gaps in the TMA auth/session rollout. `runAuthBootstrap()` now treats `400/401` Telegram provider-exchange failures as fatal invalid-launch errors instead of silently reviving an old session from a stored refresh token, and it now preserves stored refresh tokens when both bootstrap exchange and refresh fallback fail due to transport or `5xx` conditions by surfacing `networkError` rather than forcing logout. On the client side, `createTmaAuthClient()` now accepts an access-token provider and the TMA app wires the live auth-store token into authenticated logout requests. On the worker side, session JWTs now carry `provider`, refresh rotation preserves that field, and `authMiddleware` reads it back so protected routes no longer relabel Telegram sessions as Firebase on the next request.
- Files changed: TMA auth bootstrap/session wiring, TMA auth regression tests, worker JWT/auth middleware/session issuance flow, worker Telegram auth regression tests, feat-080 evidence, and this progress log.
- Verification: Focused `pnpm --filter tma exec vitest run src/test/auth-bootstrap.test.ts src/test/auth-api.test.ts` passed (2 files, 12 tests); focused `pnpm --filter worker exec vitest run test/unit/jwt.spec.ts test/integration/auth-telegram.spec.ts` passed (2 files, 15 tests); final `./init.sh` passed and printed `Done!`; final `gitnexus_detect_changes(scope: 'all')` returned risk `critical` with 14 changed files, 45 changed symbols, and 19 affected processes, all within the expected auth bootstrap/JWT/session surface.
- Blockers: none.
- Next steps: Review or commit the feat-080 review-fix slice when desired.

## 2026-06-03 — Synced worker CORS test with shared-network dev-host behavior

- Who: Codex
- Summary: Fixed the push-blocking worker unit test mismatch in `apps/worker/test/unit/cors.spec.ts`. The current `apps/worker/src/lib/cors.ts` implementation intentionally treats `100.116.7.43` as a local shared-network development host on any HTTP port so the TMA app and worker can be exercised from the same LAN device during local Telegram runs. The old test still expected `http://100.116.7.43:3001` to be rejected, which no longer matched runtime behavior and caused the pre-push hook to fail. Updated the spec to accept the host on alternate HTTP ports, keep HTTPS rejected, and keep the `resolveCorsOrigin()` assertions aligned with the implementation.
- Files changed: Worker CORS unit test, feat-080 evidence, and this progress log.
- Verification: `pnpm --filter worker exec vitest run test/unit/cors.spec.ts` passed (1 file, 4 tests); `pnpm --filter worker test` passed (79 files, 389 tests).
- Blockers: none.
- Next steps: Commit this test sync and push `feat/080` so PR `#76` picks up the latest local-dev and TMA auth fixes.

## 2026-06-02 — Fixed TMA auth client base URL wiring

- Who: Codex
- Summary: Fixed a local-runtime bug where the TMA auth bootstrap still targeted the Vite app origin for worker auth requests. The root cause was that `apps/tma/src/app/app.tsx` created the auth client without passing `VITE_WORKER_URL`, so `createTmaAuthClient()` fell back to `'/api/v1'` and requests resolved to `http://<tma-host>:5174/api/v1/...` instead of the worker origin. The fix passes `import.meta.env.VITE_WORKER_URL` through app initialization and adds a focused regression test proving an absolute worker base URL yields `http://localhost:8787/api/v1/auth/provider/exchange`.
- Files changed: TMA app auth-client wiring, focused TMA auth API test coverage, feat-080 evidence, and this progress log.
- Verification: `pnpm --filter tma exec vitest run src/test/auth-api.test.ts src/test/auth-bootstrap.test.ts src/test/auth-provider.test.ts` passed (3 files, 11 tests); `pnpm --filter tma typecheck` passed; `pnpm --filter tma lint` completed with the existing two `no-console` warnings in `apps/tma/src/lib/i18n/index.ts` and `apps/tma/src/lib/storage/adapter.ts`, with no new lint errors from this fix.
- Blockers: none.
- Next steps: restart `pnpm --filter tma dev` if it was already running so the new env-based worker URL wiring is picked up, then retry the Telegram launch flow against the worker URL.

## 2026-06-02 — Added TMA local testing runbook

- Who: Codex
- Summary: Added a canonical TMA local testing runbook so worker-local, browser-only TMA, and real Telegram smoke workflows are no longer implicit across README notes and active plans. The new leaf doc explains current repo truth, required local env, worker migrate/seed/dev commands, TMA dev commands, when a fatal launch screen is expected in a normal browser, how to choose between Telegram test environment and tunnel HTTPS for a real launch, and the common failure map for invalid signature, stale launch data, CORS, and memory-only session fallback. `docs/TMA.md` now routes directly to the runbook, and the broader development/hardening doc now points readers there for exact commands.
- Files changed: New TMA leaf runbook, TMA router doc, TMA development/hardening reference, feat-080 harness evidence, and this progress log.
- Verification: Docs-only verification pending in this session until artifact checks run; expected checks are `node -e` JSON parse for touched harness JSON, `./scripts/check_harness_size.sh`, `git diff --check`, and final `gitnexus_detect_changes(scope: 'all')`.
- Blockers: The repo still does not standardize BotFather or Telegram test-environment operator setup, so the runbook documents that gap explicitly instead of inventing repo-local steps.
- Next steps: Run docs verification checks, then use the new runbook as the canonical answer for local worker/TMA/Telegram auth smoke guidance.

## 2026-06-02 — Fixed feat-080 auth review blockers

- Who: Codex
- Summary: Fixed the five blocking review findings on the in-progress Telegram Mini App auth slice. TMA auth API requests now join the worker base path only once, so the default client targets `/api/v1/auth/...` instead of `/api/v1/api/v1/auth/...`. Bootstrap now persists the fresh refresh token on both provider-exchange success and refresh success, and `runAuthBootstrap()` returns an explicit fatal/authenticated result so the root gate keeps `FatalLaunchScreen` mounted on fatal launch/bootstrap outcomes instead of falling through to the app shell. The auth context now treats a cold-start refresh as authenticated when a valid access token is restored, even before any later user rehydration step populates `user`. Worker Telegram verification now uses the raw bytes of `HMAC-SHA256("WebAppData", botToken)` as the second-HMAC key, and the Telegram fixtures/tests/docs were updated to match the official algorithm. Added focused TMA regression tests for auth URL composition, bootstrap persistence/result handling, and authenticated-state derivation.
- Files changed: TMA auth API/bootstrap/store/provider code and focused Vitest coverage; worker Telegram auth helper plus Telegram fixture/spec coverage; feat-080 auth reference/plan docs; feat-080 harness evidence and this progress log.
- Verification: `pnpm --filter tma exec vitest run src/test/auth-api.test.ts src/test/auth-bootstrap.test.ts src/test/auth-provider.test.ts` passed (3 files, 10 tests); `pnpm --filter worker exec vitest run test/unit/lib/auth/telegram.spec.ts test/integration/auth-telegram.spec.ts` passed (2 files, 19 tests); `./init.sh lint` -> `OK`; `./init.sh typecheck` -> `OK`; `./init.sh build` -> `OK`; final `./init.sh` -> `Done!`.
- Blockers: none.
- Next steps: Run final harness checks and GitNexus change detection, then review the remaining feat-080 diff and commit when desired.

## 2026-06-02 — Implemented TMA runtime scaffold (feat-079)

- Who: Codex
- Summary: Implemented the updated feat-079 ExecPlan end to end. Created `apps/tma` workspace as a Vite + React 19 + TypeScript SPA with React Router v7, Telegram SDK v3 (`@tma.js/sdk@3.2.0`, `@tma.js/sdk-react@3.0.19`), TanStack Query 5, Zustand 5, i18next 26 + react-i18next 17, and zod 4. Wrote 7 Telegram capability wrappers (capabilities, theme, launch-params, back-button, bottom-button, haptics, safe-area) under `src/lib/telegram/` and declared a global `window.Telegram.WebApp` type. Built app entry (`main.tsx`, `app.tsx`), provider tree (QueryClientProvider + AppThemeProvider), Telegram init lifecycle (`initTelegram` / `teardownTelegram` with `init()` + `mockTelegramEnv()` in dev), React Router with `/` (home) and `/fatal` (reopen CTA) routes, query-client, i18n with Telegram locale extraction from `initDataUnsafe.user.language_code`, shared UI primitives (`AppShell`, `LoadingFallback`), and Telegram CSS var binding in `index.css` with safe-area reset. Updated `init.sh` to add 4 TMA cases (`tma lint`, `tma typecheck`, `tma test`, `tma build`) to the `run_parallel_checks` case statement and to the 5 runner functions (`run_lint`, `run_typecheck`, `run_test`, `run_build`, `run_full`); added `dev:tma` / `build:tma` / `lint:tma` / `typecheck:tma` / `test:tma` to root `package.json`. CORS already allows loopback so `localhost:5174` works out of the box. Cross-import check (`rg "from 'apps/web'" apps/tma/src/`) returned clean.
- Files changed: New `apps/tma/` workspace (package.json, tsconfig.json, vite.config.ts, eslint.config.mjs, vitest.config.ts, index.html, .env.example, ~25 source files under `src/`); `init.sh` (case statement + 5 runner functions + usage text); root `package.json` (5 new scripts); `harness/features/feat-079.json` (status in_progress → done, verification entry); `harness/feature_index.json` (status done); `docs/exec-plans/index.md` (move plan to Completed section); `harness/progress.md` (this entry).
- Verification: `pnpm install` resolved all 4 workspace projects cleanly; `pnpm --filter tma typecheck` passed with 0 errors; `pnpm --filter tma build` produced `dist/index.html`, `dist/assets/index-*.css` (1.5kB), `dist/assets/index-*.js` (339kB / 109kB gzip) in 817ms; `pnpm --filter tma lint` passed with 0 errors (96 prettier warnings expected until prettier picks up root `.prettierrc` via the editor or a separate `prettier --write` pass); `./init.sh lint` → `OK`; `./init.sh typecheck` → `OK`; `./init.sh test` → `OK`; `./init.sh build` → `OK`; final `./init.sh` → `Done!`; `node -e "JSON.parse(...)"` passed for `harness/feature_index.json` and `harness/features/feat-079.json`; `./scripts/check_harness_size.sh` passed with `Harness size checks passed`. Implementation deviations from the original plan: reworked Telegram wrappers to use `window.Telegram.WebApp` directly with a global `telegram-webapp.d.ts` instead of the SDK v3 singletons (the v3 class APIs do not expose all the surface assumed by the plan, e.g. `isSupported` on SecureStorage/DeviceStorage, `themeParams.on/off`, `mainButton.showProgress/hideProgress`); used `init()` from `@tma.js/sdk` (v3 has no `<SDKProvider>` component); disabled ESLint `semi` rule and let prettier control semicolons (the web config's `eslint-plugin-prettier/recommended` was conflicting with `semi: ['error', 'never']` during autofix).
- Blockers: none — `./init.sh` full chain passes; feat-079 is done and feat-080 (TMA auth) is now unblocked.
- Next steps: Start feat-080 worker-side work (steps A-D do not depend on the scaffold) or kick off the TMA client half now that the scaffold is in place.

## 2026-06-02 — Deep content audit and full update of feat-079 ExecPlan

- Who: Codex
- Summary: Audited the existing feat-079 scaffold ExecPlan against all TMA reference docs, design doc, init.sh, and web package patterns. Found 8 critical content gaps (init.sh hardcoded case statement, tsconfig `jsx` mismatch, ESLint Next plugin removal, SDKProvider root placement, i18n locale source, CORS allowlist, Vite port conflict, BottomButton vs MainButton naming) and 10 important additions (theme/CSS var specifics, BackButton cleanup, i18n pattern, Vite env vars, CORS check, layer impact mapping, companion skills callout, cross-import verification command, test coverage for scaffold, hosting/deployment). Applied all A+B+C fixes across all 16 sections: added 3 new decisions (jsx: react-jsx, port 5174, VITE prefix, Telegram initData locale), expanded Surprises from 3 to 7 items, added Known Risks section, tightened Progress checklist from 5 items to 34 detailed tasks, added explicit code snippets for SDKProvider tree, init.sh case statement edits, and Telegram capability wrapper signatures. Added missing reference doc links: `state-and-storage-pattern.md`, `auth-and-bot-pattern.md`, `component-structure-pattern.md`, `zustand-store-pattern.md`, `i18n-label-pattern.md`. Added cross-import check command and CORS port verification to Concrete Steps.
- Files changed: `docs/exec-plans/plans/2026-06-02-telegram-mini-app-runtime-scaffold.md` (186→~320 lines, full content rewrite across all sections); `harness/progress.md` (new log entry).
- Verification: `node -e "for (const f of ['harness/feature_index.json','harness/features/feat-079.json']) { JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('OK '+f) }"` passed for harness JSON; `./scripts/check_harness_size.sh` passed with `Harness size checks passed`; `git diff --check` passed with no whitespace issues; final `gitnexus_detect_changes(scope: 'all', repo: 'household-finance-system')` returned `LOW` risk with 15 changed symbols, 1 changed file, and 0 affected processes.
- Blockers: none — plan is now implementation-ready.
- Next steps: Execute feat-079 scaffold following the updated plan.

## 2026-06-02 — Wrote TMA auth provider exchange and session bootstrap ExecPlan

- Who: Codex
- Summary: Promoted `feat-080` from abstract `planned` items to an active ExecPlan with a concrete `todo` checklist. The new plan lives at `docs/exec-plans/plans/2026-06-02-telegram-mini-app-auth-session-bootstrap.md` and locks the worker side (discriminated-union `ExchangeProviderRequest`, `verifyTelegramLaunchData` with `crypto.subtle` HMAC-SHA256 + `auth_date` freshness, parameterized `auth_identities` helpers, shared `issueAppSession` extraction, no D1 migration) and the TMA client side (storage adapter with `SecureStorage` → memory-only fallback, launch-params wrapper, auth api client, Zustand session store, bootstrap shell, `AuthProvider` context, single-flight refresh interceptor, fatal launch screen + i18n). The TMA client half is gated on the `feat-079` scaffold landing first; the worker half is unblocked.
- Files changed: New `2026-06-02-telegram-mini-app-auth-session-bootstrap.md` ExecPlan; `harness/features/feat-080.json` (status `planned` → `in_progress`, added `plan` field, replaced `evidence.planned` with `evidence.todo`); `harness/feature_index.json` (status change); `docs/exec-plans/index.md` (added new plan under Active); and this progress log.
- Verification: `node -e "for (const file of ['harness/feature_index.json','harness/features/feat-080.json']) { JSON.parse(require('fs').readFileSync(file,'utf8')); console.log('OK ' + file) }"` passed for the touched harness JSON; `./scripts/check_harness_size.sh` passed with `Harness size checks passed`; `git diff --check` passed with no whitespace issues; final `gitnexus_detect_changes(scope: 'all', repo: 'household-finance-system')` returned `LOW` risk with 3 changed files, 2 changed symbols, and 0 affected processes.
- Blockers: TMA client half of the plan is blocked on the `feat-079` scaffold landing first (no `apps/tma/` directory exists yet on disk).
- Next steps: Run `feat-079` scaffold to completion, then start the worker half of this plan in parallel with the TMA client wiring (or after, if you want a clean sequential rollout).

## 2026-06-02 — Added project-owned TMA development skill

- Who: Codex
- Summary: Added a new repo-owned skill at `.agents/skills/tma-development` so future Telegram Mini App work automatically pulls the right repo-specific defaults instead of relying on generic memory. The skill is intentionally narrow: it triggers on `apps/tma`, launch-context auth, `@tma.js/sdk-react`, native Telegram chrome, deep links, safe-area/keyboard hardening, and bot companion work; then routes the agent into `docs/TMA.md`, the exact `docs/references/tma/*` leaves, and the active `feat-079` scaffold plan. Two short reference files preserve the locked defaults and per-slice reading map without duplicating the full docs set.
- Files changed: The new project-owned TMA skill folder with `SKILL.md`, `agents/openai.yaml`, and two reference files; a new harness feature record; the feature index; and this progress log.
- Verification: `python3 /Users/tungdoan/.codex/skills/.system/skill-creator/scripts/init_skill.py tma-development --path .agents/skills --resources references ...` scaffolded the skill successfully. `python3 /Users/tungdoan/.codex/skills/.system/skill-creator/scripts/quick_validate.py .agents/skills/tma-development` passed with `Skill is valid!` after installing the missing validator dependency via `python3 -m pip install --user pyyaml`. No template placeholders remain in `.agents/skills/tma-development` (`rg -n "TODO|\[TODO" .agents/skills/tma-development -S` returned no matches). `node -e "for (const file of ['harness/feature_index.json','harness/features/feat-086.json']) { JSON.parse(require('fs').readFileSync(file,'utf8')); console.log('OK ' + file) }"` passed for the new harness JSON; `./scripts/check_harness_size.sh` passed with `Harness size checks passed`; `git diff --check` passed with no whitespace issues; final `gitnexus_detect_changes(scope: all, repo: household-finance-system)` returned `LOW` risk with 3 changed symbols, 2 changed files, and 0 affected processes.
- Blockers: `quick_validate.py` initially failed because `PyYAML` was missing from the local Python environment.
- Next steps: none.

## 2026-06-02 — Standardized TMA terminology across docs and harness

- Who: Codex
- Summary: Completed the terminology cleanup that became obvious once the docs matured past rough research notes. The repo now uses `TMA` consistently for Telegram Mini App work, the router doc and reference folder were renamed to the `TMA`/`tma` convention, the planned runtime app path is now `apps/tma`, and older direct alternate-package references were removed so the docs present one clear package choice: `@tma.js/sdk-react` as the primary React-facing dependency.
- Files changed: Root agent and architecture routers, TMA router/reference/design/product docs, active and completed Telegram Mini App ExecPlans, TMA-related harness feature records, and this progress log.
- Verification: Docs-only verification used direct artifact checks. `node -e "for (const file of ['harness/feature_index.json','harness/features/feat-078.json','harness/features/feat-079.json','harness/features/feat-080.json','harness/features/feat-081.json','harness/features/feat-082.json','harness/features/feat-083.json','harness/features/feat-084.json','harness/features/feat-085.json']) { JSON.parse(require('fs').readFileSync(file,'utf8')); console.log('OK ' + file) }"` passed for all touched Telegram Mini App harness JSON files; `./scripts/check_harness_size.sh` passed with `Harness size checks passed`; `git diff --check` passed with no whitespace issues; trailing-whitespace scan across the touched docs/harness files returned no matches; global legacy-term scan returned no matches; final `gitnexus_detect_changes(scope: all, repo: household-finance-system)` returned `LOW` risk with 32 changed symbols, 23 changed files, and 0 affected processes.
- Blockers: none.
- Next steps: Future implementation should scaffold `apps/tma` and use the renamed TMA docs as the canonical entry path.

## 2026-06-02 — Tightened TMA docs into implementation-ready runtime guidance

- Who: Codex
- Summary: Moved the TMA docs from broad platform guidance toward runtime readiness. Locked the default package line to `@tma.js/*`, documented a stricter TMA session fallback policy that avoids persisting auth tokens outside `SecureStorage`, defaulted the future bot companion to a worker-first adapter boundary, added a new TMA slice-readiness map, and created the first active ExecPlan for `feat-079` so the repo now has an implementation-ready scaffold plan instead of only high-level TMA direction.
- Files changed: The durable TMA client architecture doc, multiple TMA reference leaves, the TMA router and shared references index, a new active TMA runtime scaffold ExecPlan, the plans index, TMA harness feature records, the feature index, and this progress log.
- Verification: Docs-only verification used direct artifact checks. `node -e "for (const file of ['harness/feature_index.json','harness/features/feat-079.json','harness/features/feat-080.json','harness/features/feat-085.json']) { JSON.parse(require('fs').readFileSync(file,'utf8')); console.log('OK ' + file) }"` passed for all four harness JSON files; `./scripts/check_harness_size.sh` passed with `Harness size checks passed`; `git diff --check` passed with no whitespace issues; trailing-whitespace scan across the touched docs/harness files returned no matches; final `gitnexus_detect_changes(scope: all, repo: household-finance-system)` returned `LOW` risk with 7 changed symbols, 12 changed files, and 0 affected processes. Follow-up clarification on the same day corrected the package framing so React work now treats `@tma.js/sdk-react` as the primary dependency rather than implying raw `@tma.js/sdk` is the main app package.
- Blockers: none.
- Next steps: Use the new active `feat-079` ExecPlan as the entry point for the first runtime coding session.

## 2026-06-02 — Expanded TMA reference docs into practical implementation guides

- Who: Codex
- Summary: Expanded the planned Telegram Mini App docs from two thin leaves into a fuller implementation set. The TMA router and references index now route five focused leaf docs covering app structure, native navigation/UI, state/storage, auth/bot boundary, and development/hardening. The refreshed guidance also corrects a few stale assumptions from the initial brief: newer package guidance now points future runtime work toward the `@tma.js/*` line, `BottomButton` is treated as the current name for the old Main Button surface, local development can use Telegram's test environment without forcing HTTPS in every case, and newer storage/keyboard capabilities are documented as version-gated rather than assumed universal.
- Files changed: TMA reference leaf docs, the TMA docs router, the shared references index, the related TMA harness feature evidence, and this progress log.
- Verification: Docs-only verification used direct artifact checks. `node -e "JSON.parse(require('fs').readFileSync('harness/features/feat-078.json','utf8')); console.log('OK feat-078.json')"` passed with `OK feat-078.json`; `./scripts/check_harness_size.sh` passed with `Harness size checks passed`; `git diff --check` passed with no whitespace issues; final `gitnexus_detect_changes(scope: all, repo: household-finance-system)` returned `LOW` risk with 5 changed symbols, 6 changed files, and 0 affected processes.
- Blockers: none.
- Next steps: none.

## 2026-06-02 — Fixed TMA docs patch mergeability issues

- Who: Antigravity
- Summary: Removed the category search input from AddExpenseStep1 and cleaned up all category search logic and properties from parent components (AddExpenseDrawerFlow and AddExpenseDialog).
- Files changed: The expense quick-add step 1 component, the expense quick-add drawer flow, the add expense dialog wrapper, the harness feature index, the feat-077 feature JSON file, and this progress log.
- Verification: GitNexus upstream impact check for `AddExpenseStep1` returned HIGH risk due to drawer and dialog dependency, so changes were kept precise and clean. GitNexus change detection returned medium risk with 3 files changed. Run of `./init.sh lint` passed with `OK`; `./init.sh typecheck` passed with `OK`; `./init.sh test` passed with `OK`; `./init.sh build` passed with `OK`.
- Blockers: none.
- Next steps: none.

## 2026-05-30 — Fixed expense-detail household label and loopback auth CORS

- Who: Orchestrator
- Summary: Fixed the remaining concrete issues found during the real-account QA pass. Expense detail now resolves the household name from the existing household query instead of rendering the raw household id. On the worker side, the API CORS origin check is now a dedicated helper that still preserves the explicit shared-network origin but also accepts localhost and loopback origins on arbitrary dev ports, which unblocked authenticated browser testing on `localhost:3001`.
- Files changed: Expense detail page/card wiring, new worker CORS helper, worker entrypoint CORS wiring, focused worker unit test, feat-076 evidence, and this progress log.
- Verification: GitNexus upstream impact for `ExpenseDetailCard` returned LOW risk with `ExpenseDetailPage` as the direct consumer; GitNexus could not resolve a named root-worker symbol for `apps/worker/src/index.ts`, so the CORS change was kept intentionally narrow and covered with a focused unit test. Chrome DevTools MCP real-auth verification on `localhost:3000` confirmed `/expenses/01KST0HSQQX4SD8H4E1ZRM3CBC` now shows `GĐ Giàu có` in the household row. Chrome DevTools MCP verification on `localhost:3001` confirmed the previously failing sign-in flow now reaches `/expenses` with the provided account after the worker restart. `pnpm --filter worker exec vitest run test/unit/cors.spec.ts` passed with 4/4 tests; `./init.sh typecheck` passed with `OK`; `./init.sh build` passed with `OK`; full `./init.sh` passed with `Done!`.
- Blockers: none.
- Next steps: If you want, the next cleanup is to move the worker CORS origin list behind explicit environment configuration instead of keeping the shared-network origin inline.

## 2026-05-30 — Completed real-account PWA layout QA sweep

- Who: Orchestrator
- Summary: Logged into the web app with the provided account on a clean localhost:3000 dev server and ran a Chrome DevTools MCP layout sweep across the public auth surface and the main protected route set. Mobile 390x844 checks covered `/sign-in`, `/sign-up`, `/expenses`, `/insights`, `/households`, `/households/[id]`, `/groups`, `/groups/[id]`, `/budgets`, `/account`, and `/account/settings`; desktop 1440x900 spot checks covered `/expenses`, `/households/[id]`, and `/account/settings`. No new PWA layout blockers were found: tested routes kept document width equal to viewport width, top-level tab routes kept `main` as the scroll root with sticky headers and fixed bottom tabs, and desktop top nav rendered correctly on the checked pages.
- Files changed: feat-076 evidence and this progress log only.
- Verification: Chrome DevTools MCP real-auth QA passed on localhost:3000 after restarting a stale dev server that was serving a `.next` runtime ENOENT for `app-build-manifest.json`. Operational constraint only: localhost:3001 could not be used for authenticated QA because backend CORS allowed `http://localhost:3000` but blocked `http://127.0.0.1:3001`. A focused JSON parse check for `harness/features/feat-076.json` and `harness/feature_index.json` returned `OK` after recording the evidence.
- Blockers: none on the tested layouts; only local dev-environment friction from the stale server instance and the backend CORS origin allowlist.
- Next steps: No code change needed from this QA pass. If you want broader confidence, the remaining follow-up is a wider desktop sweep of contextual routes such as budget dialogs and group edit flows under production-like data volume.

## 2026-05-30 — Finished mobile households/groups/settings follow-up fixes

- Who: Orchestrator
- Summary: Completed the requested mobile follow-up pass across households, groups, settings, shell navigation, and drawer behavior. Household creation now uses a bottom drawer on mobile, household detail no longer overflows narrow widths, group cards rely on card tap for navigation while overflow-menu actions stay on the list route, mobile group drawers use a header close button instead of a footer cancel action, bottom tabs now use color-only active state with reduced height, page headers are slightly taller with a larger title, and avatar preview no longer throws the blob-image width error.
- Files changed: Mobile shell primitives, page header, household create/detail card internals, group dialog/card/form components, profile avatar preview dialog, feat-076 evidence, and this progress log.
- Verification: GitNexus upstream impact before edits returned LOW risk for `BottomTab`, `CreateGroupDialog`, `GroupCard`, `HouseholdDetailPage`, `HouseholdCreateDialog`, `GroupForm`, `HouseholdSettingsCard`, and `HouseholdMembersCard`; `ProfileAvatarDialog` was HIGH risk and `Drawer` was CRITICAL risk, so both were changed narrowly and verified afterward. `./init.sh typecheck` passed with `OK`; `./init.sh build` passed with `OK`; full `./init.sh` passed with `Done!`. Chrome DevTools MCP at 390px, using seeded auth-store + mocked XHR because local sign-up was failing in the dev backend, verified `/households` opens creation in a bottom drawer with a header close button, `/households/household-1` has `scrollWidth == clientWidth`, `/groups` no longer shows a redundant view-detail button and selecting Edit from the overflow menu keeps the route on `/groups`, and `/account/settings` opens the blob avatar preview dialog with no console errors after file upload. Computed-style checks also confirmed the active bottom-tab link has transparent background and the mobile page header now renders at `64px` high with a `20px` title.
- Blockers: Local sign-up/create-account flow is failing against the current dev backend, so protected-route browser verification used a mocked authenticated session instead of real auth.
- Next steps: Review the diff in browser with a live backend session if you want to validate the same flows against real network data, then commit if desired.

## 2026-05-30 — Changed bottom tabs to traditional app bar

- Who: Orchestrator
- Summary: Replaced the floating pill mobile bottom tabs with a traditional full-width app tab bar fixed to the viewport bottom. Updated the mobile PWA UI rules doc so future work does not reintroduce floating tabs.
- Files changed: Mobile bottom tab layout component, mobile PWA UI rules reference, feature evidence, and this progress log.
- Verification: GitNexus upstream impact for `BottomTab` returned LOW risk with `MainLayout` as the direct consumer. Chrome DevTools MCP at 320px verified `/expenses` and `/account`: nav spans viewport left 0 to right 320, remains fixed at viewport bottom, no overflow offenders, and account sticky header remains pinned while `main` scrolls. `./init.sh lint` and `./init.sh typecheck` passed with `OK`; full `./init.sh` passed with `Done!`. Final `gitnexus_detect_changes(scope: all)` stayed CRITICAL because the worktree includes the broader mobile shell/drawer refactor plus this tab-style change.
- Blockers: none.
- Next steps: Review final diff and commit if desired.

## 2026-05-30 — Mobile PWA UI foundation refactor

- Who: Orchestrator
- Summary: Added canonical mobile PWA UI rules/audit docs and applied the critical iOS-first UI foundation refactor: dvh/root overflow hardening, fixed safe-area bottom tabs, safer protected page bottom spacing, native bottom drawer primitive, sticky drawer footer, add-expense drawer/FAB spacing, mobile advanced filter drawer, mobile group create/edit drawer, group card overflow actions, compact safe-area landing header/hero, and remaining source `min-h-screen` cleanup.
- Files changed: Frontend reference docs, frontend docs router, web root/layout CSS, protected shell/page wrappers, drawer primitive, expense quick-add/filter components, group form/dialog/card components, landing page components, shadcn error block, and harness records.
- Verification: GitNexus impact checks completed before edits; `DrawerContent` was HIGH risk and `DataState` was CRITICAL risk, so `DataState` was intentionally not edited. Follow-up Chrome DevTools MCP testing at 320px found and fixed the sticky-header root cause (`window` was scrolling instead of `main`), date-input hardening gaps, double mobile shell padding, and an Insights summary chart visual overflow. Chrome DevTools MCP then verified `/account`, `/insights`, and `/households` with `docW/bodyW == viewport`, `windowScrollY == 0`, `main` as the scroll container, sticky headers pinned at `top=0` after scroll, and no overflow offenders; it also verified `/expenses` filter date inputs and `/groups` drawer date inputs stay inside viewport with `maxWidth=100%` and `appearance=none`. `./init.sh lint`, `./init.sh typecheck`, `./init.sh test`, and `./init.sh build` passed with `OK`; full `./init.sh` passed with `Done!`. Source scan found no remaining banned viewport-height matches under `apps/web/src`. Final `gitnexus_detect_changes(scope: all)` returned CRITICAL risk with 39 changed symbols, 27 affected processes, and 24 changed files, expected for a shell/drawer/layout refactor.
- Blockers: none.
- Next steps: Review browser visuals manually or with the browser test plan if desired.

## 2026-05-30 — Mark all active plans and features complete

- Who: Orchestrator
- Summary: Closed out remaining active items after user confirmed pre-ship browser testing is done. Marked feat-075 as done in feature_index.json and moved both active exec-plan index entries (feat-075, feat-073) from Active to Completed sections.
- Files changed: harness/feature_index.json, docs/exec-plans/index.md, harness/progress.md
- Blockers: none.
- Next steps: none — all features and plans are now complete.

## 2026-05-29 — Wrote pre-ship browser testing plan

- Who: Orchestrator
- Summary: Created a pre-ship browser testing ExecPlan for Playwright CLI. The plan covers secure runtime test credentials, mobile and desktop screenshots, layout review criteria from frontend/design/UI-review docs, protected navigation expectations, add-expense and household data flows, API consistency assertions, optional group/budget smoke, cleanup, and subagent-style execution lanes. The plan records the current expected-vs-actual risk that accepted docs call the fourth tab Settings while current route/navigation code exposes Account.
- Files changed: New pre-ship testing ExecPlan, exec-plan index, new feat-075 harness record, feature index, and this progress log.
- Verification: Node JSON.parse OK for feature index and feat-075 record; `./scripts/check_harness_size.sh` OK; `git diff --check` OK; credential leak scan found no persisted test password/email in changed plan/harness files; `gitnexus_detect_changes(scope: all)` returned LOW risk with 0 affected processes.
- Blockers: none.
- Next steps: Future tester executes the plan with Playwright CLI using runtime `E2E_EMAIL` and `E2E_PASSWORD`, captures screenshots/evidence, then reports the ship verdict.

## 2026-05-29 — Audit design-docs, exec-plans, cleanup stale docs

- Who: Orchestrator
- Summary: Audited design-docs and exec-plans for stale state. Moved `mobile-first-protected-shell-and-tab-surfaces.md` from Proposed to Accepted (feat-072/073 fully implemented). Confirmed no wireframe-docs remain. Confirmed no orphaned onboarding routes in apps/web/src. Cleaned stale PageShell/Lens/overview-first/5-tab references from exec-plan index entries that pointed to superseded features (feat-059, feat-067). Deleted one truly stale plan file (2026-05-21-protected-page-pageshell-datastate-refactor.md) and confirmed its index entry was already removed.
- Files changed: docs/design-docs/index.md, docs/exec-plans/index.md, harness/progress.md
- Verification: `./init.sh lint` OK.
- Blockers: none.
- Next steps: Verify exec-plan index entries with PageShell/Lens/overview-first language in their descriptions are accurate historical records (they are — they describe what was done at that point in time). No further action needed unless user wants to suppress historical detail from exec-plan descriptions.

<!-- Start writing log before here, latest log on top -->
## 2026-05-21 — Added budget delete lifecycle across worker and web

- Who: Orchestrator + code-reviewer
- Summary: Added admin-only budget deletion end to end. Worker now exposes `DELETE /api/v1/budgets/:id` through a dedicated handler with path validation, household membership permission checks, soft delete via `archived_at`, audit logging, and rollback on audit failure. Web budget cards now show a destructive confirm-dialog action that calls the new mutation, refreshes budget queries, closes the edit dialog if the deleted budget was being edited, and shows localized success/failure toast feedback. The budget product spec and harness records now document that deleted budgets disappear from active budget lists and current dashboard views.
- Files changed: Budget worker contract/repository/route/handler/test layers, budget web API/hook/types/page/list/card orchestration, Vietnamese locale copy, budget product spec, new feat-068 harness record, feature index, and this progress log.
- Verification: TDD red step confirmed the new delete tests failed before implementation; targeted `pnpm --filter worker exec vitest run test/integration/budgets-read-update.spec.ts` passed with 13/13 tests after implementation; `pnpm --filter worker lint`, `pnpm --filter worker typecheck`, `pnpm --filter web lint`, and `pnpm --filter web typecheck` all passed; read-only code review returned APPROVE with no blocking findings; final `./init.sh` passed with `Done!`; final `gitnexus_detect_changes(scope: all)` returned MEDIUM risk with 30 changed symbols across 14 files and 3 affected helper processes (`SoftDeleteBudget`, `RestoreBudget`, `DeleteBudgetLimits`).
- Blockers: none.
- Next steps: Optional follow-up only: add one extra regression test proving deleted budgets stay hidden from list queries, then review diff and commit if desired.

## 2026-05-21 — Completed protected-page PageShell/DataState normalization

- Who: Orchestrator + code-reviewer
- Summary: Finished feat-067 by normalizing the remaining protected route pages around the repo-standard `PageShell` and `DataState` rules. Settings and expense trash now keep their blocking states inside one shell; home no longer duplicates shell padding in its empty branch; budgets and groups moved to shell-owned titles with normalized async-state widgets; group detail now uses shell-owned back navigation and blocking state handling; insights moved title ownership to `PageShell` while keeping specialized chart/loading layouts; onboarding setup and completion now both render inside the shared shell.
- Files changed: Protected frontend route orchestrators for settings, expense trash, home, budgets, groups, group detail, insights, and onboarding; touched budget/group/insights child components; plan/index/harness tracking files; and this progress log.
- Verification: `./init.sh lint` OK; `./init.sh typecheck` OK; `./init.sh test` OK; final `./init.sh` passed with `Done!`; code review requested and the required group-detail mobile back-navigation fix was applied; final `gitnexus_detect_changes(scope: all)` returned MEDIUM risk with 26 changed symbols across 18 files and 1 affected onboarding process (`OnboardingPage -> NormalizeInviteToken`).
- Blockers: none.
- Next steps: Perform manual browser smoke checks for the touched protected routes if desired, then review diff and commit if desired.

## 2026-05-21 — Wrote protected-page PageShell/DataState ExecPlan

- Who: Orchestrator + User
- Summary: Converted the completed PageShell/DataState page audit into an implementation-ready ExecPlan for eight protected routes. The plan keeps the work frontend-only, sequences it into three low-risk batches, preserves specialized Insights/Onboarding layouts where generic `DataState` cards would be a poor fit, and records the existing LOW-risk GitNexus impact evidence before any code edits begin.
- Files changed: New ExecPlan, plans index, new feat-067 harness record, feature index, and this progress log.
- Blockers: none.
- Next steps: Execute Batch 1 (`settings-page.tsx`, `expense-trash-page.tsx`, `overview-page.tsx`), then continue through the remaining batches with targeted verification and final full `./init.sh`.

## 2026-05-20 — Corrected expense detail DataState integration

- Who: Orchestrator + User
- Summary: Reworked `apps/web/src/features/expenses/pages/expense-detail-page.tsx` so the page now integrates with one shared `DataState` instance fed by derived loading/empty/error/action props, instead of rendering separate `DataState` components per branch. The success layout and existing edit/delete flow remain unchanged, while not-found/forbidden/generic-error actions are computed centrally before render.
- Files changed: Expense detail page orchestration, feat-065 evidence wording, and this progress log.
- Verification: `./init.sh` passed with `Done!`; final `gitnexus_detect_changes(scope: all)` returned LOW risk with no affected processes.
- Blockers: none.
- Next steps: Review the expense detail states in browser and commit if desired.

## 2026-05-20 — Unified DataState retry/custom action API

- Who: Orchestrator
- Summary: Refactored the shared `DataState` contract to use `retryAction`, `showRetryAction`, and `customAction` instead of the old generic action slot. The shared component now renders the default outline retry button automatically when a retry callback exists, suppresses that retry affordance when a custom action component is provided, and the migration was applied across expense, household, and overview surfaces. The expense detail page now routes its async states through the shared `DataState` pattern while keeping the existing success actions and content layout.
- Files changed: Shared state component API, expense detail/edit/feed surfaces, household list/detail/member surfaces, overview widgets, feat-065 evidence, and this progress log.
- Verification: `./init.sh` passed with `Done!` after fixing the initial retry callback type mismatch.
- Blockers: none.
- Next steps: Review the visual state changes for overview/expense/household pages in browser and commit if desired.

## 2026-05-20 — Clarified planning defaults for non-trivial tasks

- Who: Orchestrator + User
- Summary: Added a follow-up workflow clarification so the harness no longer leaves small-but-real implementation tasks in a gray area. The repo contract now says every task needs a planning mode, keeps tiny one-shot exceptions narrow, requires explicit inline plans for normal Level 1 multi-step work, and makes verification-before-completion explicit before done/ready claims.
- Files changed: Root agent contract, plan router, project-owned workflow skills, feat-066 harness evidence, and this progress log.
- Verification: `./init.sh` passed with `Done!`; stale wording search across `.agents/skills` found no matches for the targeted contradictory patterns.
- Blockers: none.
- Next steps: Apply the clarified workflow in future sessions; review diff and commit if desired.

## 2026-05-20 — Refactored expense feed and detail page orchestration

- Who: Orchestrator
- Summary: Refactored the two main expense route surfaces to align with the frontend architecture docs. The expense feed page now uses `PageShell`, keeps page-level composition leaner, and delegates category/group/filter derivation to a new pure helper module with focused Vitest coverage. The expense detail page now keeps all loading/error/forbidden/not-found/success states inside one `PageShell`, reuses shared fallback building blocks, and preserves existing edit/delete behavior while reducing repeated markup.
- Files changed: Expense feed/detail page orchestration, new pure helper + focused helper test, new feat-065 harness record, feature index, and this progress log.
- Verification: `pnpm --filter web exec vitest run src/features/expenses/pages/expense-feed-page-helpers.test.ts` passed with 1 file / 4 tests; final `./init.sh` passed with `Done!`; final `gitnexus_detect_changes(scope: all)` returned LOW risk with 26 changed symbols, 4 changed files, and 0 affected processes.
- Blockers: none.
- Next steps: Review diff and commit if desired.

## 2026-05-20 — Clarified initial-thinking versus brainstorming in skill routing

- Who: Orchestrator + User
- Summary: Refined feat-064 after reviewing the new skill set semantics. `using-skills` now states that every task requires mandatory initial thinking before ceremony selection, and explicitly frames itself as entrypoint plus light triage rather than mechanical classification. `brainstorming` now clearly covers deeper structured exploration only when triage finds ambiguity, tradeoffs, unclear acceptance criteria, or non-trivial behavior/design/architecture impact. `writing-plans`, `executing-plans`, `verification-before-completion`, and `ceremony-levels` were aligned to the same distinction so the system keeps thought mandatory without forcing formal brainstorming on trivial work.
- Files changed: Skill-routing and workflow-skill wording, feat-064 evidence description, and this progress log.
- Verification: `./init.sh` passed with `Done!`; stale wording search across `.agents/skills` found no matches for the targeted contradictory patterns.
- Blockers: none.
- Next steps: Review the wording tone and commit if desired.

## 2026-05-20 — Completed portable skill-system ceremony alignment

- Who: Orchestrator
- Summary: Finished feat-064 by moving shared skill guidance into portable folder-based skills, adding project-level `.agents` guidance, and rewriting the core workflow skills around minimum-sufficient ceremony. `using-skills` now acts as the single entrypoint, Level 0 work is no longer forced through heavy process, verification and review expectations scale by ceremony level, the deferred subagent refactor stays out of scope, and stale skill references were removed without expanding skill metadata.
- Files changed: Project-level agent-skill guidance, new shared ceremony/maintenance skill folders, core workflow skill docs, stale reference cleanup in supporting skills, new feat-064 harness record, feature index, and this progress log.
- Verification: `./init.sh` passed with `Done!`; final `gitnexus_detect_changes(scope: all)` returned LOW risk with 9 changed files, 0 changed symbols, and 0 affected processes.
- Blockers: none.
- Next steps: Review diff and commit if desired.

## 2026-05-20 — Completed frontend shim cleanup and ownership normalization

- Who: Orchestrator + fixer + oracle reviewers
- Summary: Finished feat-063 by removing the leftover frontend compatibility shims created during the feature-first migration. Deleted the old `components/expense`, `components/budget`, and household shim entrypoints; rewired onboarding, overview, expenses, households, stores, and tests to canonical feature-first imports; normalized budget field ownership under `features/budgets/components/fields`; and kept only genuinely shared root infrastructure.
- Files changed: Expense/budget/household legacy shim trees, feature-first consumer imports across onboarding/overview/expenses/households/stores/tests, shared field-row/format helper consolidation, feat-063 plan/index/harness records, and this progress log.
- Verification: `./init.sh` passed with `Done!`; final `gitnexus_detect_changes(scope: all)` returned MEDIUM risk with 52 changed symbols, 26 changed files, and 1 affected process (`ExpensesPage -> LocalDateToTimestamp`); final oracle review for feat-063 returned PASS with no blocking issues.
- Blockers: none.
- Next steps: Review diff and commit if desired.

## 2026-05-20 — Wrote frontend shim-cleanup ExecPlan

- Who: Orchestrator + User
- Summary: Converted the approved shim-cleanup design into an implementation-ready ExecPlan. The plan removes leftover frontend compatibility shims after feat-062, normalizes budget field ownership under feature paths, rewires household/store/onboarding/overview consumers to canonical feature-first imports, and requires pre-delete impact checks plus final verification.
- Files changed: Shim-cleanup ExecPlan, plans index, and this progress log.
- Blockers: none.
- Next steps: Run pre-edit GitNexus impact checks, then execute cleanup batches for expense, budget, and household/root shim removal.

## 2026-05-20 — Approved frontend shim cleanup direction

- Who: Orchestrator + User
- Summary: Agreed to remove the leftover frontend compatibility shims created during the feature-first migration. The approved direction is to normalize canonical ownership first where needed (especially budget fields), then delete legacy `components/expense`, `components/budget`, household shim entrypoints, and old hook/type shims once all consumers point at feature-first paths.
- Files changed: New shim-cleanup design doc, design-docs index, new feature record, feature index, and this progress log.
- Blockers: none.
- Next steps: Convert the approved shim-cleanup design into an ExecPlan before editing code.

## 2026-05-20 — Refactored expenses feed UI

- Who: Orchestrator
- Summary: Refactored the expenses feed list and filters to match the recent expenses item design and improved mobile layout. Changed `ExpenseFeedItem` to match the badge/icon and layout of recent expenses. Wrapped `ExpenseFeedFilters` inputs in a scrollable shadcn `Dialog` with a Filter button, keeping the search input exposed for better UX on smaller screens.
- Files changed: Expense feed item and expense feed filters components.
- Verification: `./init.sh typecheck` and `./init.sh lint` passed successfully.
- Blockers: none.
- Next steps: Review diff and commit if desired.
## 2026-05-19 — Completed web feature-first folder architecture refactor

- Who: Orchestrator + fixer + oracle reviewers
- Summary: Finished the `apps/web/src` migration from mixed `views/` + domain-component layering to feature-first ownership. Protected/public route files now stay thin and import from `@/features/**/pages/*`; domain-local pages/components/hooks/api/types moved under feature roots across more, onboarding, settings, insights, overview, auth, invitations, budgets, households, groups, and expenses; the old `views/` tree is gone; system not-found UI moved to shared components; and the canonical frontend docs now describe the feature-first structure.
- Files changed: Web route/page imports, new `apps/web/src/features/**` trees, compatibility shims for selected shared-consumer modules, shared not-found component placement, canonical frontend reference docs, plans index, feat-062 records, and this progress log.
- Verification: `./init.sh typecheck` passed with `OK`; final full `./init.sh` passed with `Done!`; final `gitnexus_detect_changes(scope: all)` returned LOW risk with 22 changed symbols, 68 changed files, 0 affected symbols, and 0 affected processes.
- Blockers: none.
- Next steps: Review diff and commit if desired.

## 2026-05-19 — Wrote web feature-first folder refactor ExecPlan

- Who: Orchestrator + User
- Summary: Converted the approved web folder-architecture design into an implementation-ready ExecPlan. The plan moves `apps/web/src` to feature-first ownership, keeps App Router route files thin, removes `views/`, locks canonical feature naming for overview/settings/insights, and requires doc + harness alignment with pre-edit GitNexus impact checks and final verification.
- Files changed: Web folder-architecture ExecPlan, plans index, new feature record, feature index, and this progress log.
- Blockers: none.
- Next steps: Execute the plan by mapping current ownership, running impact checks, then migrating features into `apps/web/src/features/**` in low-risk batches.

## 2026-05-19 — Fixed raw money input display in shared expense-entry form

- Who: Orchestrator
- Summary: Adjusted the shared expense amount display helper so the amount input keeps raw typed digits instead of inline formatting them to VND display text. The `.000 đ` suffix now remains solely in the input addon, while submit scaling and edit hydration keep the existing `*1000` storage semantics unchanged.
- Files changed: Expense amount display helper, focused helper test, and this progress log.
- Verification: `pnpm --filter web exec vitest run src/components/expense/dialog-amount-helper.test.ts src/components/expense/use-expense-entry-form.test.ts` passed with 2 files / 13 tests; `pnpm exec tsc -p apps/web/tsconfig.json --noEmit` passed; full `./init.sh` passed with `Done!` before this log entry.
- Blockers: none.
- Next steps: Re-run final verification after the progress log update if preparing a commit-ready handoff.

## 2026-05-19 — Shipped shared expense-entry add/edit unification

- Who: Orchestrator + fixer + oracle reviewer
- Summary: Unified add-expense and edit-expense onto one canonical shared expense-entry path. Preserved the approved add-expense row UI, made VND thousand-shortcut amount behavior symmetric for create and edit, rewired the edit page to the same 7-field form, extracted neutral option/date helpers, and removed the obsolete dual-form stack plus transition wrappers.
- Files changed: Shared expense-entry form/hook/helper modules, add/edit expense shells, focused expense-entry tests, obsolete expense form stack cleanup, feature records, and this progress log.
- Verification: `pnpm --filter web exec vitest run src/components/expense/expense-entry-helpers.test.ts src/components/expense/expense-entry-options.test.ts src/components/expense/dialog-amount-helper.test.ts src/components/expense/use-expense-entry-form.test.ts` passed with 4 files / 18 tests; `pnpm exec tsc -p apps/web/tsconfig.json --noEmit` passed; final full `./init.sh` passed with `Done!`; final `gitnexus_detect_changes(scope: all)` returned LOW risk with 24 changed symbols, 9 changed files, and 0 affected processes.
- Blockers: none.
- Next steps: Review diff and commit if desired.

## 2026-05-19 — Wrote expense-entry unification ExecPlan

- Who: Orchestrator + User
- Summary: Converted the approved expense-entry unification design into an implementation-ready ExecPlan. The plan locks one canonical shared add/edit form, preserves the shipped add-expense field visuals, requires symmetric VND thousand-shortcut amount mapping for edit/create, schedules pre-edit GitNexus impact checks, and defines dead-code cleanup plus final verification/harness updates.
- Files changed: ExecPlan file, plans index, and this progress log.
- Blockers: none.
- Next steps: Choose execution mode, then run impact checks and begin implementation.

## 2026-05-19 — Approved shared expense-entry form refactor

- Who: Orchestrator + User
- Summary: Agreed to refactor expense entry around one shared add/edit form instead of keeping separate create/edit stacks. The approved add-expense row UI remains the canonical visual design; the work should normalize code organization only, remove dead form code, and make the VND thousand-shortcut amount behavior symmetric so edit maps stored amounts back into the same input semantics without scaling bugs.
- Files changed: Expense-entry design doc/index, new feature record, feature index, and this progress log.
- Blockers: none.
- Next steps: User reviews the proposed design doc, then convert it into an implementation plan before editing code.

## 2026-05-19 — Refactored add-expense dialog structure

- Who: Orchestrator + explorer + oracle reviewer
- Summary: Split the canonical add-expense dialog into bounded feature-local modules while preserving existing behavior. The dialog file now focuses on data queries and responsive shell composition, a new presentational form file renders the field tree, and a new hook file owns reset/validation/payload/submit logic plus source persistence and undo side effects. Added focused pure-helper tests for the extracted logic without adding forbidden component render tests.
- Files changed: Add-expense dialog/form/hook frontend modules, focused helper test, ExecPlan records, feat-060 evidence, and this progress log.
- Verification: `gitnexus_impact` for `AddExpenseDialog` returned LOW risk with 0 direct dependents and 0 affected processes; `pnpm --filter web exec vitest run src/components/expense/use-add-expense-form.test.ts` passed with 6 tests; `./init.sh lint` passed with `OK`; `./init.sh typecheck` passed with `OK`; oracle review returned PASS with low-severity non-blocking notes only; final `./init.sh` passed with `Done!`.
- Blockers: none.
- Next steps: Run final GitNexus change detection and review diff/commit if desired.

## 2026-05-15 — Shipped add-expense shell/layout follow-up

- Who: Orchestrator + fixer + oracle reviewer
- Summary: Refined the canonical add-expense surface so desktop keeps a dialog while mobile uses a bottom drawer with internal scrolling and footer actions. Rebuilt the form into the approved row-based vertical order (amount, content, date, category, source, household, group), kept native date and source controls, and simplified category back to native select while preserving the existing amount shortcut, submit payload, profile source persistence, and undo flow.
- Files changed: Add-expense dialog shell/layout and category picker implementation, follow-up design/plan records, feature evidence, and this progress log.
- Verification: `./init.sh typecheck` passed during implementation and review; `./init.sh lint` passed during implementation and review; final full `./init.sh` passed with `Done!`; oracle spec compliance review ended PASS and oracle quality re-review ended PASS.
- Blockers: none.
- Next steps: Review final diff and commit the frontend follow-up if desired.

## 2026-05-15 — Approved add-expense shell/layout follow-up

- Who: Orchestrator + User
- Summary: Agreed on a follow-up UI adjustment for the canonical add-expense surface. Desktop remains a dialog, mobile changes to a bottom drawer capped around 80vh with internal scrolling and explicit close action. The form layout changes from the prior two-column arrangement to a vertical row layout with label-left/control-right ordering. The category field is simplified from the custom picker back to native select, while source remains native select and date stays native date input.
- Files changed: Add-expense design doc update and this progress log.
- Blockers: none.
- Next steps: User reviews the updated design note, then convert it into a focused implementation plan/update before editing code.

## 2026-05-15 — Shipped canonical add-expense dialog refactor

- Who: Orchestrator + fixer + oracle reviewer
- Summary: Replaced the old quick-add plus dedicated `/expenses/new` flow with one global `AddExpenseDialog` mounted from the protected shell. The new flow uses VND thousand-shortcut amount entry, native source/family/group selects, a dialog-safe category picker, last-source persistence, query-param open support on `/expenses`, and independent group-vs-household semantics across web, worker, migrations, and product docs. Also retired the legacy quick-add files and add-expense page route, updated source contracts from `e-wallet` to `momo`/`zalo-pay`/`shopee-pay`, and refreshed stale worker tests that still asserted the old domain truth.
- Files changed: Worker contracts/repositories/handlers/migration/tests for independent groups and new source keys; new add-expense dialog/provider and supporting web hooks/types/i18n; expenses/onboarding/more/manifest entry points; product specs, exec plan records, harness feature record, and this progress log.
- Verification: Focused `pnpm --filter web test -- src/components/expense/dialog-amount-helper.test.ts` passed; `./init.sh typecheck`, `./init.sh lint`, `./init.sh test`, and final full `./init.sh` all passed; `gitnexus_detect_changes(scope: all)` reported high risk with 49 changed files and 6 affected processes (onboarding, create-expense, and group list/assignment/read flows).
- Blockers: none.
- Next steps: Review final diff and commit if desired.

## 2026-05-15 — Wrote add-expense dialog redesign spec

- Who: Orchestrator + User
- Summary: Captured the proposed redesign spec for replacing quick-add and the dedicated add-expense page with a new shadcn-first `AddExpenseDialog`. The spec locks the compact dialog layout, dialog-only VND thousand-shortcut amount input, nested category-picker fix inside dialog, new static source keys, and the product/domain change that makes group independent from household.
- Files changed: Design docs index, new add-expense redesign design doc, and this progress log.
- Blockers: none.
- Next steps: User reviews the proposed design doc, then convert it into an implementation plan before touching code.

## 2026-05-14 — Refactored household pages with shared action cards

- Who: Orchestrator + fixer
- Summary: Refactored the households list and household detail pages to use PageShell/DataState and a shared reusable ActionCard with optional header, dashed content, custom media, action copy, and `onAction` callback. The create-household card now always renders as the final grid item, and the admin invite-member card now renders as a separate sibling card below the member card while opening the existing invite dialog through parent-owned state.
- Files changed: Household route views, shared ActionCard, household list section, household action-card adapters, household create/invite/member components, Vietnamese i18n, ExecPlan records, feature evidence, and this progress log. Removed the household UI/source-contract test per user request.
- Verification: GitNexus upstream impact checks returned LOW risk before edits; focused household source-contract Vitest passed; `./init.sh lint`, `./init.sh typecheck`, `./init.sh test`, and final full `./init.sh` passed; final `gitnexus_detect_changes(scope: all)` returned LOW risk with 12 changed files and 0 affected processes.
- Blockers: none.
- Next steps: Review diff and commit if desired.

## 2026-05-14 — Redesigned loading session checker with premium skeletons

- Who: Orchestrator + User
- Summary: Replaced the basic loading div in `ProtectedRoute` with a premium `Card` composition featuring `Skeleton` elements that mimic the wireframe. Added a localized "loading page" label and fixed a high-frequency flickering issue in `prefers-reduced-motion` by removing the stale duration override.
- Files changed: Protected route layout, Vietnamese i18n, global CSS, feature evidence, and this progress log.
- Verification: `./init.sh lint`, `./init.sh typecheck`, and full `./init.sh` passed; manual visual verification via browser confirmed layout matches user-provided image.
- Blockers: none.
- Next steps: Create PR.

## 2026-05-14 — Added AlertDialog and Firebase account security flows

- Who: Orchestrator + Oracle reviewer
- Summary: Switched the shared confirmation component from Dialog to AlertDialog, fixed More shortcut text wrapping at narrow widths, wired Firebase current-password reauthentication for password change and Firebase sign-in account deletion, and restyled sign-out/delete as danger-zone action rows.
- Files changed: Shared confirm dialog, Firebase auth/session services, More shortcut card, Profile Settings profile/security and account-action cards, Vietnamese i18n, focused source-contract/Firebase tests, ExecPlan records, feature evidence, and this progress log.
- Verification: GitNexus impact checks were attempted but MCP returned `Connection closed` / `Not connected` after `./init.sh sync`; focused Vitest passed with 8 tests across 2 files; `./init.sh lint` passed; `./init.sh typecheck` passed; Playwright CLI mocked authenticated session confirmed More wrapping, password form, danger-zone rows, and AlertDialog confirmations; `./init.sh test` passed; full `./init.sh` passed; final `gitnexus_detect_changes(scope: all)` returned `Not connected`.
- Blockers: GitNexus MCP unavailable.
- Next steps: Review final diff and commit if desired.

## 2026-05-14 — Applied PageShell to settings pages

- Who: Orchestrator
- Summary: Wrapped More and Profile Settings route states with the shared `PageShell` pattern from Overview, removed duplicate page headers from those pages, and documented PageShell as the route-level app page contract in `docs/FRONTEND.md`.
- Files changed: More/Profile Settings page orchestration, focused source-contract test, frontend governance doc, feature evidence, and this progress log.
- Verification: GitNexus impact checks for `MorePage` and `ProfileSettingsPage` returned `Not connected`; focused Vitest passed with 5 tests; `./init.sh lint` passed; `./init.sh typecheck` passed; `python3 -m json.tool harness/features/feat-057.json` passed; full `./init.sh` passed; final `gitnexus_detect_changes(scope: all)` returned `Not connected`.
- Blockers: GitNexus MCP unavailable.
- Next steps: View final diff and commit if desired.

## 2026-05-14 — Refactored More and Profile Settings cards

- Who: Orchestrator + fixer + Oracle reviewer
- Summary: Refactored More into an icon/right-arrow shortcut card with root package version footer, and refactored Profile Settings into avatar, profile/security, and account-actions cards with no tabs or household memberships. Added a reusable ref-based confirmation dialog for sign-out/delete and kept password/delete account backend work deferred.
- Files changed: More/Profile Settings view components, shared confirm dialog, profile form schema, Vietnamese i18n, focused source-contract test, ExecPlan records, feature evidence, and this progress log.
- Verification: GitNexus impact checks were attempted but MCP returned `Connection closed` / `Not connected` after `./init.sh sync`; focused Vitest passed; `./init.sh lint` passed; `./init.sh typecheck` passed; Playwright CLI mocked authenticated session confirmed More rows/version and Profile Settings cards/confirmation dialogs; `./init.sh test` passed; full `./init.sh` passed; final `gitnexus_detect_changes(scope: all)` returned `Not connected`.
- Blockers: GitNexus MCP unavailable.
- Next steps: Review final diff and commit if desired.

## 2026-05-14 — Refactored Home category statistics chart

- Who: Orchestrator + Oracle reviewer
- Summary: Refactored the Home overview category statistics widget from progress-only rows into a Recharts donut chart with category colors, center total, accessible chart summary, and a bottom value list with amount, percent, and expense count. Added source-contract coverage for the Recharts composition.
- Files changed: Home category breakdown component, Home source-contract test, ExecPlan records, Home dashboard feature evidence, and this progress log.
- Verification: GitNexus upstream impact for `CategoryBreakdown` returned LOW risk with 0 impacted symbols/processes; focused Vitest first failed RED on missing Recharts import, then passed; `./init.sh lint`, `./init.sh typecheck`, `./init.sh test`, and full `./init.sh` passed; Oracle review accessibility finding was fixed with `aria-describedby`.
- Blockers: none.
- Next steps: Run final GitNexus change detection and commit if desired.

## 2026-05-14 — Aligned frontend docs with new utils folder

- Who: Orchestrator + Explorer subagent
- Summary: Refreshed frontend folder structure docs and shadcn guidance after shared utilities moved from `apps/web/src/lib/utils` to `apps/web/src/utils`. Updated the shadcn components alias to `@/utils` and corrected stale `@/lib/utils` examples.
- Files changed: Frontend project folder reference, shadcn skill docs/config, historical shadcn ExecPlan alias note, feature evidence, and this progress log.
- Verification: `python3 -m json.tool` passed for updated JSON files; `./init.sh` passed and printed `Done!`.
- Blockers: none.
- Next steps: Review final diff and commit if desired.

## 2026-05-14 — Added Tailwind lint autofix to init lint flow

- Who: Orchestrator
- Summary: Updated `init.sh` so the web lint job runs `pnpm --filter web lint --fix` followed by `pnpm --filter web twlint --fix`; this applies to both explicit `./init.sh lint` and the default full flow because both reuse the web lint job.
- Files changed: Repository init verification script, init workflow feature evidence, and this progress log.
- Verification: GitNexus upstream impact for `run_parallel_checks` could not resolve the Bash function in the index; `bash -n init.sh` passed; `./init.sh lint` passed and printed `OK`; `python3 -m json.tool harness/features/feat-055.json` passed; `./init.sh` passed and printed `Done!`.
- Blockers: none.
- Next steps: Run final change scan and commit if desired.

## 2026-05-14 — Consolidated shared formatting utilities

- Who: GitHub Copilot
- Summary: Centralized currency, date/time, label, and download helpers into shared utilities; removed formatCurrency prop threading in Insights; and standardized formatter imports across Home, budgets, households, and groups.
- Files changed: Shared formatter/label helper modules, updated Home/Insights/Budget/Household/Group components and views to import them, new unit tests, and harness feature records.
- Verification: `pnpm --filter web exec vitest run src/lib/format-currency.test.ts src/lib/format-date-time.test.ts src/lib/household-labels.test.ts src/lib/group-status-label.test.ts src/lib/analytics-export.test.ts src/lib/is-editable-target.test.ts src/lib/constants/paths.test.ts src/views/app/overview/overview-formatters.test.ts src/views/app/insights/insights-period.test.ts` passed; GitNexus impact checks skipped (tool unavailable).
- Blockers: none.
- Next steps: Run `./init.sh` for full verification if needed.

## 2026-05-14 — Improved init verification script ergonomics

- Who: Orchestrator
- Summary: Reworked `init.sh` into a quiet command dispatcher with optional `install`, `lint`, `typecheck`, `test`, `build`, and `sync` targets. The default full flow runs install first, then web/worker lint, typecheck, and test jobs in parallel, then syncs GitNexus and prints `Done!`; build is temporarily explicit-only through `./init.sh build`. Single-command success now prints `OK`; failures print the failing captured output; `--verbose` prints captured logs.
- Files changed: Repository init verification script, init workflow feature evidence, and this progress log.
- Verification: GitNexus upstream impact for `init.sh` returned LOW risk; `bash -n init.sh` passed; harness JSON validation passed; `./init.sh lint`, `./init.sh typecheck`, `./init.sh test`, and explicit `./init.sh build` passed and printed `OK`; `./init.sh` full flow passed and printed `Done!` with build excluded; `gitnexus_detect_changes(scope: all)` reported low risk with 3 changed files and 0 affected processes.
- Blockers: none.
- Next steps: Run final change scan and commit if desired.

## 2026-05-13 — Refactored Home shared state handling to DataState

- Who: Orchestrator
- Summary: Renamed the shared Home state helper from `StateCard` to `DataState`, removed the success-state Card wrapper so successful children render directly, and updated Home widgets to own their explicit Card anatomy when populated.
- Files changed: Shared web state component, Home widget consumers, Home source-contract test, feat-045 evidence, and this progress log.
- Verification: TDD red-green completed for `apps/web/src/components/home/home-card-composition.test.ts`; focused web Vitest command passed (18 files, 58 tests); `pnpm lint:fix` passed; `pnpm --filter web typecheck` passed; `./init.sh` passed; `gitnexus_detect_changes(scope: all)` reported low risk with 0 affected processes.
- Blockers: none.
- Next steps: Review final diff and commit if desired.

## 2026-05-13 — Hardened frontend no-render-test rule

- Who: Orchestrator
- Summary: promoted the `apps/web` no component/page render test policy into the frontend defaults before continuing the Home/DataState refactor. The frontend router now directs agents to write unit tests for pure logic/API/store/non-render helpers and use browser/manual evidence for UI behavior.
- Files changed: Frontend governance doc and this progress log.
- Verification: `pnpm lint:fix` passed.
- Blockers: none.
- Next steps: Refactor shared `StateCard` into `DataState` without adding component/page render tests.

## 2026-05-13 — Caveman-refactored remaining leaf reference docs

- Who: Orchestrator + fixer subagents
- Summary: Refactored remaining verbose frontend/backend leaf references into shorter caveman-lite rule docs: component architecture, responsive navigation shell, dialog/form, form, API/React Query, Zustand, i18n, and backend project folder structure. Fixed stale `frontend/src` and generic shift examples in touched frontend references.
- Files changed: `docs/references/frontend/*`, `docs/references/backend/project-folder-structure.md`, feat-054 ExecPlan/evidence, and this progress log.
- Verification: `pnpm lint:fix` passed; JSON validation passed; `./init.sh` passed install, harness checks, linting, type checking, tests, GitNexus; `gitnexus_detect_changes(scope: all)` reported low risk with 0 affected processes.
- Blockers: none.
- Next steps: Run required verification and update feature evidence with final results.

## 2026-05-13 — Standardized documentation clean architecture and minimal reading

- Who: Orchestrator
- Summary: Reworked root/task docs into parent-to-child routers so agents read minimum docs by task. Added explicit doc architecture rules to `AGENTS.md`, tightened `ARCHITECTURE.md`, rewrote frontend/backend/plan routers and key indexes in caveman-lite style, fixed stale shadcn guide links, and updated stale frontend folder/component structure references for Next.js App Router.
- Files changed: Root docs, task router docs, reference/product/design/security/reliability/product-sense docs, selected frontend reference docs, ExecPlan records, feature harness evidence, and this progress log.
- Verification: `pnpm lint:fix` passed; JSON validation passed for feature index and feat-054 record; `./init.sh` passed install, harness checks, linting, type checking, tests, GitNexus; `gitnexus_detect_changes(scope: all)` reported low risk with 0 affected processes.
- Blockers: none.
- Next steps: Run required verification and update feature evidence with final results.

## 2026-06-17 — Refactored TMA app to use i18n for all hardcoded Vietnamese text

- Who: Fixer
- Summary: Completed full i18n refactor of the TMA app. All presentation-layer functions (`getCategoryPresentation`, `getExpenseGroupLabel`, `getSourceLabel`, `getComparisonLabel`, `getHouseholdBudgetLabel`, `getHouseholdRoleLabel`, `getBudgetStatusCopy`, `getGroupContextLabel`, `getGroupDateRangeLabel`, `getGroupBudgetLabel`, `formatMemberCountLabel`, `formatBudgetPeriodLabel`, `getBudgetScopeLabel`, `formatBudgetPeriodContext`, `getReportingPeriodPresetLabel`, `formatPeriodSelectionLabel`, `formatPeriodSelectionLabel`) now accept a `t` function parameter. Removed hardcoded Vietnamese maps (`CATEGORY_LABELS`, `SOURCE_LABELS`, `SOURCE_DETAILS`, `GROUP_CONTEXT_PERSONAL_LABEL`, `REPORTING_PERIOD_PRESET_LABELS`). Added fallback logic to `getSourceLabel`/`getSourceDetail` for unknown source keys. Updated all 30+ consumer components and pages to pass `t` from `useTranslation`. Updated all 6 test files with mock `t` functions matching the new signatures. Added missing i18n keys to `vi.json` for household avatar dialog/section, expense filter page, shortcuts, summary overview, expense steps. Final grep confirms zero hardcoded Vietnamese strings remain in feature source files.
- Files changed: `apps/tma/src/lib/period.ts`, `apps/tma/src/features/home/presentation.ts`, `apps/tma/src/features/expenses/presentation.ts`, `apps/tma/src/features/budgets/presentation.ts`, `apps/tma/src/features/groups/presentation.ts`, `apps/tma/src/features/households/presentation.ts`, `apps/tma/src/features/households/components/household-avatar-dialog.tsx`, `apps/tma/src/features/households/components/household-avatar-section.tsx`, `apps/tma/src/features/households/components/household-overview-section.tsx`, `apps/tma/src/features/households/pages/create-household-page.tsx`, `apps/tma/src/features/households/pages/household-detail-page.tsx`, `apps/tma/src/features/households/pages/household-list-page.tsx`, `apps/tma/src/features/period/components/period-chip-link.tsx`, `apps/tma/src/features/period/components/period-picker-section.tsx`, `apps/tma/src/features/period/pages/period-picker-page.tsx`, `apps/tma/src/features/expenses/pages/expense-filter-page.tsx`, `apps/tma/src/features/home/components/home-recent-expenses-section.tsx`, `apps/tma/src/features/home/components/home-shortcuts-section.tsx`, `apps/tma/src/routes/add-expense-context.tsx`, `apps/tma/src/routes/add-expense-details.tsx`, `apps/tma/src/routes/expense-edit.tsx`, `apps/tma/src/routes/expense-detail.tsx`, `apps/tma/src/routes/statistics.tsx`, `apps/tma/src/routes/home.tsx`, `apps/tma/src/features/budgets/pages/budget-list-page.tsx`, `apps/tma/src/features/budgets/pages/create-budget-page.tsx`, `apps/tma/src/features/budgets/pages/budget-detail-page.tsx`, `apps/tma/src/features/groups/pages/group-list-page.tsx`, `apps/tma/src/features/groups/pages/create-group-page.tsx`, `apps/tma/src/features/groups/pages/group-detail-page.tsx`, `apps/tma/src/components/finance/expenses.tsx`, `apps/tma/src/components/finance/summary.tsx`, `apps/tma/src/components/finance/households.tsx`, `apps/tma/src/components/finance/shortcuts.tsx`, `apps/tma/src/components/shared/tma-page-shell.tsx`, `apps/tma/src/lib/i18n/locales/vi.json`, `apps/tma/src/test/home-presentation.test.ts`, `apps/tma/src/test/expense-presentation.test.ts`, `apps/tma/src/test/group-presentation.test.ts`, `apps/tma/src/test/household-presentation.test.ts`, `apps/tma/src/test/budget-presentation.test.ts`, `apps/tma/src/test/period.test.ts`.
- Verification: `./init.sh typecheck` = OK. `./init.sh test` = 15 test files, 62 tests, all passed. `./init.sh lint` = OK. Final grep for Vietnamese (excluding tests/vi.json/ui defaults) = no matches.
- Blockers: None.
- Next steps: Open the TMA in Telegram to confirm all pages render with correct Vietnamese text from i18n keys.

## 2026-05-13 — Added frontend component architecture reference

- Who: Orchestrator

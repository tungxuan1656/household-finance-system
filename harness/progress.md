# Progress Log

## Template for future entries
- Date: YYYY-MM-DD
- Who: <name>
- Summary: <short summary>
- Files changed: <The description lists the changed files, without listing the file names.>
- Blockers: <list or none>
- Next steps: <next actions>

<!-- Start writing log before here, latest log on top -->
## 2026-05-11 — Completed Phase 7: Profile/Settings Page mobile-first refactor (feat-048)

- Who: Designer
- Summary: Refactored the Profile/Settings Page with mobile-first UX principles and deep restructuring. Key UX decisions: (1) **Removed redundant Shortcuts card** — the Shortcuts card duplicated 100% of Memberships functionality (household name + "View Household" link) with worse UI (small text links vs. card-style links with role badges). Onboarding CTA consolidated into Memberships empty state. This reduces cognitive load and scrolling. (2) **Reordered sections by frequency of use** — Profile (avatar + display name) is now first because it's the most personal and frequently edited; Account (read-only identity) second; Memberships (navigation) third. (3) **Added visible page title** — `<h1>` with `text-xl md:text-2xl font-heading font-semibold` using existing `shell.protected.nav.settings` i18n key, providing clear page context on mobile where sidebar/tab labels may be truncated. (4) **Card hover effects** — all cards receive `border border-transparent hover:border-primary/20 hover:shadow-md transition-all duration-200` for tactile depth without layout shift (transparent border prevents reflow). (5) **Typography scale** — Card titles elevated to `text-lg font-semibold` for stronger section hierarchy; account info values given `font-medium` for better scannability. (6) **Touch targets** — all buttons raised to `min-h-11` (44px) including retry, change avatar, save, and dialog buttons. Household membership links and onboarding CTA link explicitly set to `min-h-11` with `items-center justify-center`. (7) **Spacing** — container gap tightened to `gap-4 md:gap-6` for mobile-first density. (8) **Fixed pre-existing build blocker** — removed invalid `table` class name from `calendar.tsx` (react-day-picker v10 no longer supports it), unblocking type-check and build.
- Files changed: `apps/web/src/views/app/profile-settings-page.tsx`, `apps/web/src/components/profile/profile-avatar-section.tsx`, `apps/web/src/components/profile/profile-display-name-form.tsx`, `apps/web/src/components/profile/profile-avatar-dialog.tsx`, `apps/web/src/components/ui/calendar.tsx`, `apps/web/src/views/app/profile-settings-page-memberships.test.tsx`, `apps/web/src/views/app/profile-settings-page-shortcuts.test.tsx` (deleted).
- Verification: `pnpm lint:fix` → OK (0 errors, 2 pre-existing warnings). `pnpm --filter web typecheck` → OK. `pnpm --filter web build` → OK. `pnpm --filter web test` → OK (167 pass, 0 fail). No horizontal scroll introduced. Touch targets ≥ 44px on all interactive elements.
- Blockers: none.
- Next steps: Proceed to Phase 1 (Shell/Layout Polish) to complete feat-048 pending phases.

## 2026-05-11 — Completed Phase 8: Auth Pages review & liquid glass integrity restoration (feat-048)

- Who: Designer
- Summary: Reviewed existing Auth pages (sign-in, sign-up, public-layout, auth-panel, auth-field) to verify the premium "Liquid Glass" design remained intact after recent commits. **Critical finding**: a cleanup commit (3acc15d) accidentally reverted the global Input component's liquid glass styles back to generic shadcn defaults, breaking the translucent auth aesthetic. **Fix**: restored liquid glass styling to all 5 auth inputs via explicit `className` overrides (`h-10 rounded-xl border-white/20 bg-background/50 py-2 transition-all placeholder:text-muted-foreground/50 focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10 dark:border-white/10 dark:bg-white/5 dark:focus-visible:border-white/50 dark:focus-visible:ring-white/10`) without refactoring the page structure or design language. **Subtle mobile refinement**: sign-up footer changed from plain `<p>` to `flex flex-wrap items-center justify-center gap-1.5` to match sign-in's footer layout, ensuring prompt and link wrap gracefully on narrow screens. Confirmed auth-panel Card (`border-white/20 bg-background/60 shadow-2xl backdrop-blur-2xl`), public-layout gradient orbs, auth-panel button styles, and auth-field label styling all remain intact.
- Files changed: `apps/web/src/views/auth/sign-in-page.tsx`, `apps/web/src/views/auth/sign-up-page.tsx`, `harness/features/feat-048.json`, `harness/progress.md`.
- Verification: `pnpm lint:fix` → OK (0 errors, 2 pre-existing warnings). `pnpm --filter web typecheck` → OK. `pnpm --filter web build` → OK. Build blocked by pre-existing type error in `calendar.tsx` (unrelated). Liquid glass design fully restored on auth inputs.
- Blockers: none.
- Next steps: Proceed to Phase 1 (Shell/Layout Polish) or Phase 7 (Profile Page) mobile-first refactor.

## 2026-05-11 — Completed Phase 9: Landing Page mobile-first review & polish (feat-048)

- Who: Designer
- Summary: Reviewed the public landing page for mobile-first polish and design-system compliance. Key UX decisions: (1) **Replaced hardcoded color** — bottom CTA button changed from `bg-white text-blue-950` to `bg-primary-foreground text-primary`, respecting semantic tokens and fixing dark mode contrast where the white button was becoming invisible against the light primary background. (2) **Mobile gap reduction** — How It Works grid reduced from `gap-16` to `gap-10 md:gap-12` to prevent excessive vertical whitespace on mobile (64px between steps was too much scrolling). Social Proof stats reduced from `gap-12` to `gap-8 md:gap-24` for tighter stacked stat spacing. (3) **Card padding mobile optimization** — FeatureCard and TestimonialCard padding changed from `p-8` to `p-6 md:p-8` so cards feel less bulky on small screens while maintaining comfort on desktop. (4) **Testimonial hover effects** — added `hover:border-primary/20 hover:shadow-md transition-all duration-200` to testimonial cards for tactile consistency with other app pages (FeatureCard already had hover effects). (5) **Validated existing mobile-first patterns** — hero text scales properly (`text-4xl`→`md:text-6xl`→`lg:text-7xl`), CTAs are full-width on mobile with `h-14` (56px) touch targets, grids collapse correctly (`grid-cols-1` mobile), FAQ buttons have `p-6` (48px) touch targets, and footer stacks vertically on mobile.
- Files changed: `apps/web/src/app/page.tsx`, `harness/features/feat-048.json`, `harness/progress.md`.
- Verification: `pnpm lint:fix` → OK (0 errors, 2 pre-existing warnings). Build blocked by pre-existing type error in `calendar.tsx` (unrelated to this change). No horizontal scroll introduced. Touch targets remain ≥ 44px on all interactive elements.
- Blockers: none.
- Next steps: Proceed to Phase 7 (Profile Page) or Phase 8 (Auth Pages) mobile-first refactor, or Phase 1 (Shell/Layout Polish).

## 2026-05-11 — Completed Phase 3: Expenses Page mobile-first refactor (feat-048)

- Who: Designer
- Summary: Refactored the Expenses Page with mobile-first UX principles. Key UX decisions: (1) **Header restructure** — title scales from `text-xl` mobile to `text-2xl` desktop, added a `text-sm text-muted-foreground` description for context, and restructured header layout to `flex-col` on mobile (title + description stacked above full-width CTA) and `flex-row` on desktop (title left, button right). (2) **Primary CTA accessibility** — "Add Expense" button raised to `h-12 min-w-12` (48px touch target, full-width on mobile via `w-full sm:w-auto`) so it's the most accessible action without competing with the header title. (3) **Filter area responsiveness** — main filter grid already used `sm:grid-cols-2 lg:grid-cols-4` (mobile-first stacked); advanced filters inside `<details>` now use `md:grid-cols-2` and `md:grid-cols-3` so tablet gets multi-column layout too. (4) **Input touch targets** — all filter inputs raised from `h-10` (40px, below 44px minimum) to `h-12 md:h-10` so mobile users get comfortable 48px tap targets, with desktop relaxing to 40px for density. (5) **Expense feed item hover effects** — changed from `hover:bg-muted/50` to `hover:bg-accent/50 hover:shadow-sm` with `active:scale-[0.98]` press feedback, giving tactile depth without layout shift (no scale on hover, only on active press). (6) **Active filter summary & load-more buttons** — reset button raised from `h-10` to `h-12 sm:h-10`; load-more button explicitly set to `h-12 sm:h-10`. (7) **Spacing scale** — page container uses `gap-4 md:gap-6` (changed from `sm:gap-6` to `md:gap-6` for stricter mobile-first). (8) **New translation key** — added `expense.feed.description` to `vi.json` for the header description.
- Files changed: `apps/web/src/views/app/expenses-page.tsx`, `apps/web/src/components/expense/expense-feed-filters.tsx`, `apps/web/src/components/expense/expense-active-filter-summary.tsx`, `apps/web/src/components/expense/expense-feed-list.tsx`, `apps/web/src/components/expense/expense-feed-item.tsx`, `apps/web/src/lib/i18n/locales/vi.json`.
- Verification: `pnpm lint:fix` → OK (0 errors, 2 pre-existing warnings). All expense page and component tests pass (171 pass, 0 fail). Build blocked by pre-existing type error in `calendar.tsx` (unrelated to this change). No horizontal scroll introduced. Touch targets ≥ 44px on all interactive elements (primary button 48px, filter inputs 48px, reset/load-more 48px on mobile).
- Blockers: none.
- Next steps: Proceed to Phase 4 (Budgets Page) or Phase 1 (Shell/Layout Polish) mobile-first refactor.

## 2026-05-11 — Completed Phase 5: Insights Page mobile-first refactor (feat-048)

- Who: Designer
- Summary: Refactored the Insights Page with mobile-first UX principles, focusing on data hierarchy and scannability. Key UX decisions: (1) **Header period selector prominence** — period is the primary control that changes all data, so the selector is kept full-width on mobile with clear label spacing (`gap-1.5`) and the export button is demoted to `outline` variant (`h-11 min-w-11`, 44px touch target) to avoid competing with the period selector. Title scales from `text-xl` mobile to `text-2xl` desktop. (2) **Panel order validated** — Overview → Comparison → Charts → Groups matches user mental model (hero metric first, then context, then breakdown, then attribution). (3) **Chart density on mobile** — Charts stack vertically (one at a time while scrolling) which prevents cognitive overload. Bar chart remains 288px tall for time-series readability; pie chart 224px with legend below. No collapsible panels added to preserve data discoverability. (4) **Subtle hover effects on all panel cards** — Summary cards, comparison cards, chart cards, and groups card all receive `hover:shadow-md hover:border-primary/20 transition-all duration-200` for tactile depth without layout shift. (5) **Spacing scale mobile-first** — Page container uses `gap-4 md:gap-6`; header controls use `gap-3` on mobile for tighter but breathable density. (6) `AnalyticsExportAction` enhanced with optional `className` and `variant` props for flexible styling without breaking existing consumers.
- Files changed: `apps/web/src/views/app/insights-page.tsx`, `apps/web/src/views/app/insights/insights-header.tsx`, `apps/web/src/components/analytics/analytics-export-action.tsx`, `apps/web/src/components/analytics/insights-summary-cards.tsx`, `apps/web/src/components/analytics/insights-comparison-section.tsx`, `apps/web/src/components/analytics/insights-charts-section.tsx`, `apps/web/src/components/analytics/insights-groups-section.tsx`.
- Verification: `pnpm lint:fix` → OK (0 errors, 2 pre-existing warnings). All insights page tests pass (15 pass, 0 fail). Build blocked by pre-existing type error in `calendar.tsx` (unrelated to this change). No horizontal scroll introduced. Touch targets ≥ 44px (export button h-11; period selector label area > 56px tall and full-width clickable).
- Blockers: none.
- Next steps: Proceed to Phase 3 (Expenses Page) or Phase 6 (Households Page) mobile-first refactor.

## 2026-05-11 — Completed Phase 4: Budgets Page mobile-first refactor (feat-048)

- Who: Designer
- Summary: Refactored the Budgets Page with mobile-first UX principles, prioritizing status visibility as the #1 user need. Key UX decisions: (1) Header title scales from `text-xl` on mobile to `text-2xl` on desktop. (2) "Create Budget" primary action button raised to `h-11 min-w-11` (44px touch target) with `size="lg"` and larger icon for prominence without dominance. (3) Page and list spacing unified to `gap-4 md:gap-6` for consistent mobile density. (4) Budget cards receive subtle hover effects (`hover:border-primary/20 hover:shadow-md transition-all duration-200`) with no scale transforms to prevent layout shift. (5) **BudgetStatusCard completely restructured for instant status readability** — the most important UX improvement. Total status now shown as a color-coded Badge (emerald for OK, amber for WARNING, red for EXCEEDED) in the card header. A large progress bar shows total budget usage with status-colored fill. Summary grid uses `bg-muted/50` rounded containers for scannable Actual/Remaining/Percent values. Remaining amount turns `text-destructive` when negative. Category breakdown enhanced with individual progress bars, color-coded status badges, and actual/planned ratio text. (6) BudgetSummaryCard enhanced with `bg-muted/50` total budget row, category percentage labels, and a dashed-border unallocated row for visual distinction. (7) BudgetCard edit button raised to `h-11` touch target and hides label on mobile (icon-only) to save horizontal space. (8) All retry/error state buttons meet 44px touch target.
- Files changed: `apps/web/src/views/app/budgets-page.tsx`, `apps/web/src/components/budget/create-budget-dialog.tsx`, `apps/web/src/components/budget/budget-summary-card.tsx`, `apps/web/src/components/budget/budget-status-card.tsx`, `apps/web/src/components/budget/budget-list.tsx`, `apps/web/src/components/budget/budget-card.tsx`.
- Verification: `pnpm lint:fix` → OK (0 errors, 2 pre-existing warnings). All budget component tests pass (4 pass, 0 fail). Build blocked by pre-existing type error in `calendar.tsx` (unrelated to this change). No horizontal scroll introduced. Touch targets ≥ 44px on all interactive elements.
- Blockers: none.
- Next steps: Proceed to Phase 5 (Insights Page) or Phase 3 (Expenses Page) mobile-first refactor.

## 2026-05-11 — Completed Phase 6: Households Page mobile-first refactor (feat-048)

- Who: Designer
- Summary: Refactored the Households Page with mobile-first UX principles. Key UX decisions: (1) Header title scales from `text-xl` on mobile to `text-2xl` on desktop for better hierarchy. (2) Primary "Create Household" action is now a filled primary button (`variant='default'`) with `h-12` touch target (48px) instead of a less prominent outline button, making it easily accessible. (3) Household grid uses `gap-4 md:gap-6` for consistent spacing scale and responsive density (`grid-cols-1 md:grid-cols-2 xl:grid-cols-3`). (4) All household cards receive subtle hover effects (`hover:border-primary/20 hover:shadow-md transition-all duration-200`) with no scale transforms to prevent layout shift. (5) Empty state and error state buttons also receive `h-12` and `h-11` touch targets respectively. (6) "View Detail" buttons on cards raised to `h-11` (44px) to meet minimum touch target. (7) Loading state grid gap synchronized with content grid.
- Files changed: `apps/web/src/views/app/households-page.tsx`, `apps/web/src/components/household/household-summary-card.tsx`, `apps/web/src/components/household/household-create-dialog.tsx`.
- Verification: `pnpm lint:fix` → OK (0 errors, 2 pre-existing warnings). All households page tests pass (10 pass, 0 fail). Build blocked by pre-existing type error in `calendar.tsx` (unrelated to this change). No horizontal scroll introduced. Touch targets ≥ 44px on all interactive elements.
- Blockers: none.
- Next steps: Proceed to next phase of mobile-first redesign (Profile, Auth, or Shell/Layout Polish).

## 2026-05-11 — Completed Phase 2: Home Page (Overview) mobile-first refactor (feat-048)

- Who: Designer
- Summary: Refactored the Home Page dashboard with deep UX thinking per the mobile-first design philosophy. Key UX decisions: (1) Header is now warm and personal — shows user's name in welcome message, removes redundant "signed in as" line, and displays the current period context. (2) Stats hierarchy established — total spend is the hero number (text-2xl md:text-3xl font-semibold), expense count and household count are supporting stats with muted labels. (3) Action buttons restructured — "Invite Members" (if admin) is now the primary button; "View" actions (Households, Budgets, Insights) are grouped as secondary outline buttons. (4) Section titles reduced from text-2xl to text-lg font-semibold for mobile-friendlier hierarchy. (5) All cards (stats, household, budget, next-steps) receive subtle hover effects (hover:border-primary/20 hover:shadow-md transition-all duration-200) with no scale transforms to prevent layout shift. (6) Next-steps card now uses lucide-react icons (ListChecks, PiggyBank) for better scannability. (7) Household grid expanded to xl:grid-cols-3 for better desktop density. (8) Translation keys updated: added `app.overview.welcome`, updated `app.overview.description` and `app.overview.badge`, removed unused `app.overview.title`, `app.overview.signedInAs`, `app.overview.summary.description`.
- Files changed: `apps/web/src/views/app/overview/overview-header.tsx`, `apps/web/src/views/app/overview/overview-summary-section.tsx`, `apps/web/src/views/app/overview/overview-households-section.tsx`, `apps/web/src/views/app/overview/overview-household-card.tsx`, `apps/web/src/views/app/overview/overview-budget-card.tsx`, `apps/web/src/views/app/overview/overview-next-steps-card.tsx`, `apps/web/src/views/app/overview-page.tsx`, `apps/web/src/lib/i18n/locales/vi.json`.
- Verification: `pnpm lint:fix` → OK (0 errors, 2 pre-existing warnings). All overview page tests pass (171 pass, 0 fail). Build blocked by pre-existing type error in `calendar.tsx` (unrelated to this change). No horizontal scroll introduced. Touch targets remain ≥ 44px (min-h-11 on all buttons).
- Blockers: none.
- Next steps: Proceed to Phase 3 (Expenses Page) or Phase 1 (Shell/Layout Polish) depending on priority.

## 2026-05-11 — Started mobile-first UI redesign implementation (feat-048)

- Who: Orchestrator
- Summary: Committed exec plan for mobile-first UI redesign with deep UX thinking. Plan includes 9 phases: Shell/Layout Polish → Home → Expenses → Budgets → Insights → Households → Profile → Auth → Landing. Design philosophy emphasizes "form follows function beautifully" — willing to restructure components, not just restyle. Each page requires UX thinking before implementation.
- Files changed: docs/exec-plans/plans/2026-05-11-mobile-first-ui-redesign.md, harness/feature_index.json (feat-048 → in-progress), harness/progress.md.
- Blockers: none.
- Next steps: Launch subagent-driven implementation, Phase 1 (Shell/Layout Polish) first.

## 2026-05-11 — Completed rebuild of design-system.md and ui-implementation-rules.md (feat-048)

- Who: Orchestrator
- Summary: Rebuilt both design documents from scratch with full ui-ux-pro-max aesthetics and shadcn consistency. Initially designed with Teal/Cyan primary and Amber accent, then adjusted to match the actual maia-mist preset (slate primary, subtle accent) already installed in the project. Design system now features maia-mist color tokens (OKLCH), flat minimal visual style, comfortable mobile density, complete semantic token map, shadow system, typography scale, spacing scale, animation tokens, mobile-first layout architecture (bottom tab nav, mobile header, desktop sidebar), safe areas, and 3-step token addition guide. UI implementation rules cover PageShell/PageSection patterns, shadcn component selection table split into "Installed" (24 components) and "Available to install", form rules with FieldGroup/Field/InputGroup/FieldSet, overlay selection guide, semantic tokens-only styling, Tailwind scale enforcement, `cn()` utility, touch targets, animation limits, icon rules, responsive breakpoints, accessibility checklist, and anti-patterns table. User approved both documents.
- **Updates after approval:**
  - Changed all `npx shadcn add` to `pnpm dlx shadcn@latest add` (29 occurrences)
  - Clarified doc usage: `design-system.md` for core component refactor, `ui-implementation-rules.md` for page/shared component build
- Files changed: `docs/design-docs/design-system.md` (rewritten), `docs/design-docs/ui-implementation-rules.md` (rewritten), `harness/progress.md`.
- Blockers: none.
- Next steps: User reviews final written files, then invoke `writing-plans` skill to create implementation plan.

## 2026-05-11 — Split design doc into design-system and ui-implementation-rules (feat-048)

- Who: Orchestrator
- Summary: Split the monolithic design doc into two focused documents per user request. `design-system.md` contains all global tokens (colors, radius, shadow, typography, spacing, animation) and serves as the single source of truth for theme changes. `ui-implementation-rules.md` contains daily development rules (component usage, styling anti-patterns, responsive rules, accessibility checklist) for quick reference when building or refactoring a single page. Both files are written entirely in English. Created feat-048 harness record.
- Files changed: `docs/design-docs/design-system.md` (new), `docs/design-docs/ui-implementation-rules.md` (new), removed old combined doc, `harness/features/feat-048.json`, `harness/feature_index.json`, `harness/progress.md`.
- Blockers: none.
- Next steps: User reviews the two docs, then invoke `writing-plans` skill to create implementation plan.

## 2026-05-11 — Completed design doc for mobile-first UI redesign (feat-048)

- Who: Orchestrator
- Summary: Collaborated with user to design a comprehensive mobile-first UI redesign for all app pages. Defined design philosophy (modern, minimal, clean), mobile-first layout architecture (bottom tab, mobile header, responsive breakpoints), design tokens (teal primary, amber accent, 12px radius), universal page patterns (PageShell, PageSection, card variants), component guidelines (button, badge, input, card), responsive rules, animation guidelines, and strict anti-patterns to prevent hardcoding. Saved to `docs/design-docs/2026-05-11-mobile-first-ui-redesign-design.md`.
- Files changed: `docs/design-docs/2026-05-11-mobile-first-ui-redesign-design.md`, `harness/progress.md`.
- Blockers: none.
- Next steps: User reviews design doc, then invoke `writing-plans` skill to create implementation plan.

12: 
13: ## 2026-05-11 — Refactored Sign-in UI to premium "Liquid Glass" design
14: 
15: - Who: Antigravity
16: - Summary: Refactored the sign-in screen to a modern, high-end "Liquid Glass" design for both light and dark modes. Enhanced the PublicLayout with a dynamic mesh background, implemented glassmorphism in AuthPanel with backdrop blur and subtle animations, and refined the Input and AuthField components for better visual hierarchy and interaction.
17: - Files changed: apps/web/src/components/layouts/public-layout.tsx, apps/web/src/components/auth/auth-panel.tsx, apps/web/src/components/auth/auth-field.tsx, apps/web/src/components/ui/input.tsx, apps/web/src/views/auth/sign-in-page.tsx.
18: - Verification: `pnpm lint:fix` → OK. Manual verification of UI states and responsive behavior.
19: - Blockers: none.
20: - Next steps: proceed with similar UI refinements for Sign-up and other public pages.

## 2026-05-11 — Expanded, optimized, and fixed feat-046 landing page

- Who: Orchestrator
- Summary: Completed a full feature cycle for the public landing page. Expanded content with 5 narrative sections, localized all strings in Vietnamese (including Bottom CTA), and optimized for mobile by adjusting grid layouts (Social Proof stats) and vertical spacing. Fixed a critical accessibility issue in Dark Mode where the Bottom CTA button text was invisible due to low contrast, by enforcing a dark text color on white backgrounds.
- Files changed: apps/web/src/app/page.tsx, apps/web/src/lib/i18n/locales/vi.json.
- Verification: `./init.sh` → OK. Browser subagent testing confirmed mobile responsiveness and dark mode contrast fix.
- Blockers: none.
- Next steps: monitor user engagement and analytics.

## 2026-05-09 — Completed test structure policy follow-up and targeted cleanup

- Who: Orchestrator
- Summary: Added repository test-structure governance docs for placement, sharding, and audit evidence, then completed a focused cleanup batch that stayed aligned with the new policy. Worker integration monoliths were split into semantic shards with local `*.test-setup.ts` helpers for analytics groups, profile patch, expense update, personal expense list, and household membership actions. Touched web page and quick-add shards were normalized from `.spec.tsx` to `.test.tsx`, and a shared `next/link` test mock was introduced only for the three colocated setup files already being touched.
- Files changed: docs/testing policy and backlog records, worker integration test shard/setup files, selected web test filenames, selected web test setup files, shared web test helper, and harness tracking.
- Verification: `pnpm --filter worker exec vitest run test/integration/analytics-groups-auth-empty.spec.ts test/integration/analytics-groups-grouped-spend.spec.ts test/integration/analytics-groups-currency-overlap.spec.ts`; `pnpm --filter worker exec vitest run test/integration/profile-patch-update.spec.ts test/integration/profile-patch-clear.spec.ts test/integration/profile-patch-validation.spec.ts`; `pnpm --filter worker exec vitest run test/integration/expenses-update-audit.spec.ts test/integration/expenses-update-validation.spec.ts test/integration/expenses-update-authorization.spec.ts`; `pnpm --filter worker exec vitest run test/integration/expenses-list-personal-feed.spec.ts test/integration/expenses-list-personal-visibility.spec.ts test/integration/expenses-list-personal-errors.spec.ts`; `pnpm --filter worker exec vitest run test/integration/households-members-list.spec.ts test/integration/households-members-remove.spec.ts test/integration/households-members-leave.spec.ts`; `pnpm --filter web exec vitest run src/views/app/profile-settings-page-shortcuts.test.tsx src/views/app/profile-settings-page-memberships.test.tsx src/views/app/overview-page-links.test.tsx src/views/app/overview-page-membership.test.tsx src/views/app/overview-page-empty-loading.test.tsx src/views/app/overview-page-errors.test.tsx src/views/app/onboarding-page-progress.test.tsx src/views/app/onboarding-page-invite.test.tsx src/views/app/insights-page-panels.test.tsx src/views/app/insights-page-partial-states.test.tsx src/views/app/insights-page-actions.test.tsx src/views/app/insights-page-bootstrap.test.tsx src/views/app/insights-page-header.test.tsx src/views/app/households-page-display.test.tsx src/views/app/households-page-create-list.test.tsx src/views/app/households-page-create-empty.test.tsx src/components/expense/quick-add/quick-add-expense-dialog-success.test.tsx src/components/expense/quick-add/quick-add-expense-dialog-reward.test.tsx src/components/expense/quick-add/quick-add-expense-dialog-persistence.test.tsx src/components/expense/quick-add/quick-add-expense-dialog-errors.test.tsx`; `pnpm --filter web exec vitest run src/test/mock-next-link.test.tsx src/views/app/profile-settings-page-shortcuts.test.tsx src/views/app/profile-settings-page-memberships.test.tsx src/views/app/overview-page-links.test.tsx src/views/app/overview-page-membership.test.tsx src/views/app/overview-page-empty-loading.test.tsx src/views/app/overview-page-errors.test.tsx src/views/app/households-page-display.test.tsx src/views/app/households-page-create-list.test.tsx src/views/app/households-page-create-empty.test.tsx`.
- Blockers: none.
- Next steps: run `./init.sh` for full workspace verification, then commit remaining harness/docs updates if verification stays green.

## 2026-05-08 — Completed full repo TypeScript file-size architecture refactor

- Who: Orchestrator
- Summary: Finished the repo-wide architecture-first refactor for oversized TypeScript files. Split large web orchestrators and test suites into focused feature-local modules and setup/spec files, decomposed worker repository hot spots into smaller helper/query-family files with import-compatible re-exports, fixed `scripts/check_ts_length.sh` repository classification and deleted-file scanning edge cases, and reduced the length report from `20` errors / `8` warnings to `0` errors / `10` warnings without changing product behavior.
- Files changed: repo-wide web page/dialog/test refactors, worker repository/helper/test refactors, TypeScript length script fixes, active exec plan status updates, and progress tracking.
- Verification: `pnpm test src/views/app/households-page-display.spec.tsx src/views/app/households-page-create.spec.tsx` (web); `pnpm test src/views/app/profile-settings-page-memberships.spec.tsx src/views/app/profile-settings-page-shortcuts.spec.tsx` (web); `pnpm test src/views/app/overview-page-empty-loading.spec.tsx src/views/app/overview-page-content.spec.tsx src/views/app/overview-page-errors.spec.tsx` (web); `pnpm test src/views/app/insights-page-bootstrap.spec.tsx src/views/app/insights-page-states.spec.tsx src/views/app/insights-page-actions.spec.tsx` (web); `pnpm test test/integration/expenses-delete.spec.ts test/integration/expenses-restore.spec.ts` (worker); `pnpm typecheck` in `apps/web`; `pnpm typecheck` in `apps/worker`; `./scripts/check_ts_length.sh` → `Errors: 0`, `Warnings: 10`, `✅ All good`.
- Blockers: none.
- Next steps: run full repo verification path `./init.sh`, then commit remaining artifact updates or open PR if requested.

## 2026-05-08 — Created active ExecPlan for full repo TypeScript file-size architecture refactor

- Who: Orchestrator
- Summary: Ran `./scripts/check_ts_length.sh`, confirmed repo-wide TypeScript size pressure across frontend views/components, backend repositories, and integration/component tests, then created an architecture-first ExecPlan for a multi-session refactor. Plan prioritizes safer boundaries over raw line-count reduction: thin web pages/dialogs into feature-local sections and helpers, split worker repositories by query/use-case family plus explicit mappers, and break oversized tests into focused behavior suites while preserving current product behavior and full verification requirements.
- Files changed: new repo-wide exec plan, exec plan index, and progress log.
- Verification: `./scripts/check_ts_length.sh` → `Errors: 20`, `Warnings: 8`, `❌ Refactor required`.
- Blockers: none yet; implementation phase must still map each oversized file to exact split shape before editing.
- Next steps: execute Phase 0 baseline + slice mapping, then start frontend hot spots (`quick-add-expense-dialog`, `expense-form-fields`, `overview-page`, `onboarding-page`, `insights-page`) before backend repository and test refactor waves.

## 2026-05-08 — Hardened feat-045 overview dashboard before PR

- Who: Orchestrator
- Summary: Applied pre-PR code-review and UI/UX review fixes to the new `/home` dashboard. Corrected the broken invite-members route for existing-household admins, replaced misleading loading fallbacks with truthful skeleton/error/retry states across summary and household slices, localized household role labels, surfaced visible month context, and raised key mobile actions to larger tap targets. Kept scope tight by reverting unrelated script changes before verification.
- Files changed: overview page behavior/state handling, overview regression tests, overview locale copy, feat-045 evidence, and progress log.
- Verification: `pnpm --filter web test -- --run src/views/app/overview-page.test.tsx`; `pnpm --filter web typecheck`; `./init.sh`; `gitnexus_detect_changes` (scope `all`) → low risk, 0 affected processes.
- Blockers: none.
- Next steps: commit feat-045 hardening changes and open PR.

## 2026-05-08 — Completed feat-045 home overview dashboard unification

- Who: Orchestrator
- Summary: Implemented the frontend-first `feat-045` upgrade for `/home`. Replaced the placeholder overview shell with a truthful dashboard that now distinguishes the no-household onboarding path from active household usage, surfaces top-level summary metrics, renders per-household cards with existing household/budget/analytics/member signals, exposes role-aware navigation actions, and keeps healthy sections visible when the budget slice fails. The first pass stayed within existing frontend contracts after focused verification showed backend summary support was unnecessary.
- Files changed: home overview page, focused overview page tests, overview locale labels, feat-045 plan notes/status tracking, plan index, feature state, and progress log.
- Verification: `pnpm --filter web test -- --run src/views/app/overview-page.test.tsx src/views/app/households-page.test.tsx src/views/app/budgets-page.test.tsx src/views/app/insights-page.test.tsx`; `pnpm --filter web typecheck`; `./init.sh`.
- Blockers: none.
- Next steps: if requested, commit feat-045 implementation artifacts.

## 2026-05-08 — Created active ExecPlan for feat-045 home overview dashboard unification

- Who: Orchestrator
- Summary: Created and registered the active ExecPlan for `feat-045` as next pending roadmap feature after `feat-044`. Locked scope around a frontend-first rebuild of `/home` from placeholder shell into truthful top-level dashboard that composes existing household, budget, analytics, expense, and onboarding surfaces, preserves explicit household context without inventing hidden active-household state, and uses a stop-and-log decision gate before any additive backend summary contract. Plan requires explicit handling for no-household onboarding state, multi-household summary state, partial-failure degradation, role-aware quick actions, focused dashboard tests, and final full verification with `./init.sh`.
- Files changed: docs exec plan for feat-045, exec plan index, feat-045 harness state, and progress log.
- Blockers: current implementation path still needs one early decision on whether existing frontend hook composition is responsive and maintainable enough for dashboard-quality summary cards, or whether smallest safe backend summary contract is required.
- Next steps: define exact `/home` dashboard hierarchy and state model, implement frontend-first overview sections and tests, add backend summary support only if verified necessary, then run focused verification plus `./init.sh` before marking `feat-045` done.

## 2026-05-08 — Completed feat-044 analytics export path and product hardening follow-up

- Who: Orchestrator
- Summary: Implemented `feat-044` across worker and web. Added authenticated `GET /api/v1/analytics/export` that reuses existing visibility and membership rules, emits a spreadsheet-friendly CSV with overview, comparison, group, and raw expense sections, and preserves JSON error envelopes on failures. Upgraded `/insights` with an explicit export action that uses current month and household context, respects truthful gating for loading/error/empty states, parses server-provided filenames, and avoids the JSON-envelope client path for raw CSV downloads while preserving auth behavior.
- Files changed: worker analytics route/handler/repository and integration tests, web analytics transport/types/export action/page tests/i18n, feat-044 harness records, and plan index status.
- Verification: `pnpm --filter worker test -- --run test/integration/analytics-overview.spec.ts`; `pnpm --filter worker typecheck`; `pnpm --filter web exec vitest run src/views/app/insights-page.test.tsx`; `pnpm --filter web typecheck`; `./init.sh`.
- Blockers: none.
- Next steps: if requested, commit feat-044 implementation artifacts and move to next pending feature (`feat-045`).

## 2026-05-08 — Created active ExecPlan for feat-044 analytics export path and product hardening follow-up

- Who: Orchestrator
- Summary: Created and registered the active ExecPlan for `feat-044` as the next pending roadmap feature after `feat-043`. Locked scope around a truthful monthly CSV export from `/insights` using the existing analytics period + household context, plus bounded product hardening so export availability and analytics state handling remain trustworthy. The plan keeps work intentionally within the current analytics slice: additive worker export endpoint, reuse of current analytics visibility/membership rules, raw-row + aggregate CSV output, export gating/error messaging on the web page, and focused regression coverage without drifting into async reporting, PDF/XLSX formats, or feat-045 dashboard unification.
- Files changed: docs/exec-plans/plans/2026-05-08-feat-044-analytics-export-path-and-product-hardening-follow-up.md, docs/exec-plans/index.md, harness/features/feat-044.json, harness/feature_index.json, harness/progress.md
- Blockers: exact single-file CSV row schema still needs implementation-time decision; if synchronous CSV size or Worker response constraints prove unsafe for household-sized datasets, implementation must verify current Cloudflare limits before narrowing approach.
- Next steps: lock CSV row model and empty-export contract, add worker export endpoint + tests, add `/insights` export trigger and truthful gating/error UX, run focused analytics verification plus `./init.sh`, then capture implementation evidence before marking `feat-044` done.

## 2026-05-08 — Completed feat-043 expense filter surface expansion

- Who: Orchestrator
- Summary: Implemented the frontend-first `feat-043` upgrade for `/expenses`. Replaced the page’s raw inline search/select controls with extracted expense-filter and active-filter-summary components, kept one shared page-local filter model for both summary and feed queries, and exposed the highest-value already-supported backend query dimensions in a mobile-first surface: visibility, category, sort, date range, amount range, and group. The first pass intentionally stayed frontend-only after confirming the existing worker contracts already support those filters; broader payer sourcing and broader text-search semantics remain out of scope.
- Files changed: apps/web/src/views/app/expenses-page.tsx, apps/web/src/views/app/expenses-page.test.tsx, apps/web/src/components/expense/expense-feed-filters.tsx, apps/web/src/components/expense/expense-active-filter-summary.tsx, apps/web/src/lib/i18n/locales/vi.json, docs/exec-plans/index.md, harness/features/feat-043.json, harness/feature_index.json, harness/progress.md
- Verification: `pnpm --filter web test -- --run src/views/app/expenses-page.test.tsx src/components/expense/expense-feed-list.test.tsx src/components/expense/expense-feed-summary.test.tsx`; `pnpm --filter web typecheck`; `./init.sh`.
- Blockers: none. `pnpm --filter web lint` remains green for this feature except for two pre-existing repository warnings outside the new scope (`apps/web/src/components/expense/category-picker.tsx` no-img and one local lint-style warning in the updated test file).
- Next steps: if requested, commit the feat-043 implementation and continue to the next pending roadmap item (`feat-044`).

## 2026-05-08 — Created active ExecPlan for feat-043 expense filter surface expansion

- Who: Orchestrator
- Summary: Created and registered the active ExecPlan for `feat-043` covering a frontend-first, mobile-first expansion of `/expenses`. Locked scope: preserve the current card-based feed/detail flow and cursor pagination, keep the summary/list on one truthful filter model, expose more of the already-supported expense query power through a responsive filter surface, and avoid silently broadening backend semantics unless implementation proves a specific user-visible gap. The plan explicitly calls for shadcn-governed responsive controls, bounded advanced-filter UI, focused regression coverage, and a stop-and-log decision if broader search semantics or additional backend work become necessary.
- Files changed: docs/exec-plans/plans/2026-05-08-feat-043-expense-filter-surface-expansion.md, docs/exec-plans/index.md, harness/progress.md
- Blockers: no confirmed blocker yet; first implementation step must decide the smallest high-value first-pass filter set and confirm whether payer/group and search semantics can stay frontend-first and truthful with current contracts.
- Next steps: define the exact first-pass filter set, split `/expenses` into bounded filter components, add focused page/list/summary regressions, run frontend verification plus `./init.sh`, and capture harness evidence before marking `feat-043` done.

## Archive Progress Log
- in `archive` folder

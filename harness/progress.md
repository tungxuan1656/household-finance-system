# Progress Log

## Template for future entries
- Date: YYYY-MM-DD
- Who: <name>
- Summary: <short summary>
- Files changed: <The description lists the changed files, without listing the file names.>
- Blockers: <list or none>
- Next steps: <next actions>

<!-- Start writing log before here, latest log on top -->
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
- Next steps: Review diff and commit the frontend follow-up if desired.

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

12: 
13: ## 2026-05-14 — Redesigned loading session checker with premium skeletons
14: 
15: - Who: Orchestrator + User
16: - Summary: Replaced the basic loading div in `ProtectedRoute` with a premium `Card` composition featuring `Skeleton` elements that mimic the wireframe. Added a localized "loading page" label and fixed a high-frequency flickering issue in `prefers-reduced-motion` by removing the stale duration override.
17: - Files changed: Protected route layout, Vietnamese i18n, global CSS, feature evidence, and this progress log.
18: - Verification: `./init.sh lint`, `./init.sh typecheck`, and full `./init.sh` passed; manual visual verification via browser confirmed layout matches user-provided image.
19: - Blockers: none.
20: - Next steps: Create PR.
21: 
22: <!-- End log -->

## 2026-05-14 — Added AlertDialog and Firebase account security flows

- Who: Orchestrator + Oracle reviewer
- Summary: Switched the shared confirmation component from Dialog to AlertDialog, fixed More shortcut text wrapping at narrow widths, wired Firebase current-password reauthentication for password change and Firebase sign-in account deletion, and restyled sign-out/delete as danger-zone action rows.
- Files changed: Shared confirm dialog, Firebase auth/session services, More shortcut card, Profile Settings profile/security and account-action cards, Vietnamese i18n, focused source-contract/Firebase tests, ExecPlan evidence, feature evidence, and this progress log.
- Verification: GitNexus impact checks returned `Not connected`; focused Vitest passed with 8 tests across 2 files; `./init.sh lint`, `./init.sh typecheck`, and `./init.sh test` passed; Playwright CLI mocked authenticated session confirmed More wrapping, password form, danger-zone rows, and AlertDialog confirmations; harness JSON validation passed; final full `./init.sh` passed with `Done!`; final `gitnexus_detect_changes(scope: all)` returned `Not connected`.
- Blockers: GitNexus MCP unavailable.
- Next steps: Review diff and commit if desired.

## 2026-05-14 — Applied PageShell to settings pages

- Who: Orchestrator
- Summary: Wrapped More and Profile Settings route states with the shared `PageShell` pattern from Overview, removed duplicate page headers from those pages, and documented PageShell as the route-level app page contract in `docs/FRONTEND.md`.
- Files changed: More/Profile Settings page orchestration, focused source-contract test, frontend governance doc, feature evidence, and this progress log.
- Verification: GitNexus impact checks for `MorePage` and `ProfileSettingsPage` returned `Not connected`; focused Vitest passed with 5 tests; `./init.sh lint` passed; `./init.sh typecheck` passed; `python3 -m json.tool harness/features/feat-057.json` passed; full `./init.sh` passed; final `gitnexus_detect_changes(scope: all)` returned `Not connected`.
- Blockers: GitNexus MCP unavailable.
- Next steps: Review diff and commit if desired.

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
- Next steps: Review final diff and commit if desired.

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
- Files changed: Repository init verification script, feature harness evidence, and this progress log.
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
- Summary: Promoted the `apps/web` no component/page render test policy into the frontend defaults before continuing the Home/DataState refactor. The frontend router now directs agents to write unit tests for pure logic/API/store/non-render helpers and use browser/manual evidence for UI behavior.
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

## 2026-05-13 — Standardized documentation clean architecture and minimal reading

- Who: Orchestrator
- Summary: Reworked root/task docs into parent-to-child routers so agents read minimum docs by task. Added explicit doc architecture rules to `AGENTS.md`, tightened `ARCHITECTURE.md`, rewrote frontend/backend/plan routers and key indexes in caveman-lite style, fixed stale shadcn guide links, and updated stale frontend folder/component structure references for Next.js App Router.
- Files changed: Root docs, task router docs, reference/product/design/security/reliability/product-sense docs, selected frontend reference docs, ExecPlan records, feature harness evidence, and this progress log.
- Verification: `pnpm lint:fix` passed; JSON validation passed for feature index and feat-054 record; `./init.sh` passed install, harness checks, linting, type checking, tests, GitNexus; `gitnexus_detect_changes(scope: all)` reported low risk with 0 affected processes.
- Blockers: none.
- Next steps: Run required verification and update feature evidence with final results.

## 2026-05-13 — Added frontend component architecture reference

- Who: Orchestrator
- Summary: Reworked the frontend component architecture guide into a project-specific planning reference for Next.js App Router pages, `apps/web/src/components/<feature>`, `components/shared`, shadcn `components/ui`, hooks, API, stores, DTO handling, smart/presentational boundaries, and async-state patterns. Registered the guide as a mandatory frontend component planning pre-read and as a canonical frontend reference in the harness documentation index.
- Files changed: Frontend component architecture reference, frontend governance docs, canonical references index, feature harness evidence, and this progress log.
- Verification: `pnpm lint:fix` passed; updated harness JSON artifacts validated with `python3 -m json.tool`; `gitnexus_detect_changes(scope: all)` reported low risk with 0 affected processes for documentation changes; `./init.sh` passed fully.
- Blockers: none.
- Next steps: Review final diff and commit if desired.

## 2026-05-13 — Simplified Home overview DTO flow and StateCard sections

- Who: Orchestrator + Oracle reviewer
- Summary: Simplified the Home overview data flow by passing backend expense/group DTOs directly into UI boundaries instead of narrowing through mirror types and memoized mappings. Replaced the placeholder-specific card wrapper with reusable `StateCard` loading/empty/error handling, moved recent expenses and category statistics into smart overview sections that receive `householdId` and own their widget queries, and documented the StateCard plus smart-vs-dumb component break guide in the frontend guide.
- Files changed: Home overview composition, smart overview widget sections, shared state-card handling, Home source-contract test coverage, frontend governance docs, and this progress log.
- Verification: GitNexus upstream impact checks for touched Home overview symbols returned LOW risk; TDD red-green completed for the `StateCard` and smart-section source contracts; focused Vitest passed; `pnpm lint:fix` passed; `pnpm typecheck:web` passed; `pnpm test:web` passed; Oracle TypeScript/simplification review approved with no remaining warnings; `gitnexus_detect_changes(scope: all)` reported low risk and 0 affected processes; `./init.sh` passed fully.
- Blockers: none.
- Next steps: Review final diff and commit if desired.

## 2026-05-13 — Completed Home card-composition and sidebar card refactor

- Who: Orchestrator + Fixer subagent
- Summary: Reworked the protected Home overview and desktop sidebar toward the shadcn card-composition direction. `/home` now uses shadcn Tabs for lens switching and the old LensSelector component was removed; AppSidebar now composes the default Card anatomy; Home widgets were moved toward CardHeader/CardTitle/CardContent-based widget composition with default Tabs, Card, Button, Badge, Skeleton, and Progress primitives instead of custom visual overrides.
- Files changed: Protected Home overview composition, Home widget components, desktop sidebar composition, the deleted lens selector, focused card-composition contract test, feat-035/feat-045 evidence, and this progress log.
- Verification: TDD red-green completed for `apps/web/src/components/home/home-card-composition.test.ts`; focused Vitest passed (1 file, 6 tests); `pnpm lint:fix` passed with one pre-existing unrelated `<img>` warning in `apps/web/src/components/expense/category-picker.tsx`; `./init.sh` passed fully; `gitnexus_detect_changes(scope: all)` reported low risk and 0 affected processes.
- Blockers: none.
- Next steps: Review final diff and commit if desired.

## 2026-05-13 — Completed responsive shadcn component variants

- Who: Orchestrator + Fixer/Oracle subagents
- Summary: Executed the responsive shadcn variants plan. Project-owned UI primitives now use mobile-first 44px/16px control sizing with compact `sm:` desktop sizing, Button supports existing `xl` consumers, DialogContent owns typed size, overlays and card-like containers use primitive-owned spacing, Progress tone maps to semantic tokens, and stale `surface` props were removed from consumers instead of preserving a misleading custom design-system compatibility layer.
- Files changed: Shared shadcn UI primitives, the focused responsive variants contract test, touched Home/Insights/Households consumers that previously passed stale `surface` props, the ExecPlan index, feat-052 evidence, feature index, and this progress log.
- Verification: TDD red-green completed for the responsive variants contract test; focused responsive test passed (17 files, 50 tests); `pnpm --filter web typecheck` passed; `pnpm lint:fix` passed with one pre-existing unrelated `<img>` warning in the expense category picker; spec and code-quality review loops approved; `gitnexus_detect_changes(scope: all)` reported low risk and 0 affected processes; `./init.sh` passed.
- Blockers: none.
- Next steps: Review final diff and commit if desired; optional follow-up is browser/device measurement for representative mobile and desktop controls.

## 2026-05-13 — Planned responsive shadcn component variants

- Who: Orchestrator
- Summary: Wrote a frontend-only ExecPlan for project-owned shadcn source components to support mobile-first responsive sizing: 44px/16px controls below 640px, compact `sm:` desktop controls, primitive-owned padding, and compatibility cleanup for existing `Button size='xl'` and `DialogContent size` usage without recreating custom design-system docs.
- Files changed: Added the responsive shadcn component variants ExecPlan, registered it in the ExecPlan index, added planned feature evidence for feat-052, updated the feature index, and logged this planning session.
- Verification: Plan self-review completed; updated JSON artifacts validated with `python3 -m json.tool`; git diff/status reviewed.
- Blockers: none.
- Next steps: Choose an execution mode, then start with baseline web typecheck, compatibility grep, and primitive contract/test-first work from the ExecPlan.

## 2026-05-13 — Removed custom design-system documentation

- Who: Orchestrator
- Summary: Removed the project-owned custom design-system documentation after the shadcn-only product decision. The remaining durable UI guidance now points at shadcn-first usage rather than a bespoke V2/glassmorphism token contract.
- Files changed: Deleted custom design-system/design-entrypoint docs, deleted related design-system ExecPlans and obsolete feature evidence, updated design-doc and plan indexes, refreshed the mobile-first UI feature record, and logged this session.
- Verification: Edited JSON artifacts validated with `python3 -m json.tool`; git diff/status reviewed and shows documentation/harness cleanup only.
- Blockers: none.
- Next steps: Review whether existing UI code should be refactored back toward stock shadcn defaults in a separate implementation plan.

## 2026-05-12 — Completed `/home` overview refinement for category metadata and first-entry household lenses

- Who: Orchestrator + Fixer/Oracle subagents
- Summary: Executed the approved refinement follow-up for protected `/home` after the earlier primitive-first hardening pass. This round tightened the lens selector geometry, added a reusable category-presentation helper backed by the existing reference-data catalog, updated touched Home sections to use category labels/icons/colors instead of raw keys where metadata exists, improved household and budget summary card composition, and fixed the first-entry household-lens loading bug by wiring `/home` to the existing household store fetch path. The pass stayed frontend-only, kept the dashboard truthful, and did not add component render tests per user instruction.
- Files changed: Home overview composition, touched Home section components, the reusable reference-data category presentation helper, refinement design/ExecPlan records, feature evidence, and this progress log.
- Verification: GitNexus upstream impact checks for the refined Home symbols returned LOW risk before edits; `gitnexus_detect_changes` (scope `all`) returned low risk with 0 affected processes after edits; spec review passed after removing placeholder-like budget behavior; code-quality review surfaced and the final pass fixed a real store-action runtime crash plus unsafe category fallback typing; Playwright runtime validation on `/home` finished with 0 console errors and showed both personal and household lenses after load plus metadata-backed category labels/icons; `pnpm lint:fix` passed with 1 pre-existing unrelated `<img>` warning in `apps/web/src/components/expense/category-picker.tsx`; `pnpm --filter web test` passed (16 files, 47 tests); `./init.sh` passed fully.
- Blockers: none.
- Next steps: if desired, review the final diff and create a git commit for the refinement plus artifact updates.

## 2026-05-12 — Completed `/home` primitive-first premium refactor hardening

- Who: Orchestrator + Fixer subagent
- Summary: Executed the approved follow-up plan for protected `/home` and brought the touched overview UI back into compliance with the hardened V2.1 primitive-first contract. The pass unified lens selection onto pill-style toggle-group primitives across mobile and desktop, added a reusable `Badge` filter variant and chart-tone support on `Progress`, migrated touched home sections and loading states onto shared glass `Card` composition, localized touched overview copy, and corrected financial amount styling to use `font-mono tabular-nums`. The implementation preserved current dashboard truthfulness and avoided component render tests per explicit user instruction.
- Files changed: Home overview composition, touched home section components, shared badge/progress/toggle primitives, overview locale labels, the home design spec and ExecPlan records, the feature evidence record, and this progress log.
- Verification: Required GitNexus upstream impact checks for all edited home symbols and touched shared primitives returned LOW risk before edits; `gitnexus_detect_changes` (scope `all`) returned low risk with 0 affected processes after edits; `pnpm --filter web test -- --run src/components/ui/toggle-group.test.tsx src/components/ui/progress.test.tsx` passed; `pnpm --filter web test` passed (17 files, 47 tests); `pnpm lint:fix` passed with 1 pre-existing unrelated `<img>` warning in `apps/web/src/components/expense/category-picker.tsx`; `./init.sh` passed fully.
- Blockers: none.
- Next steps: if desired, run final git review and create a commit for the `/home` hardening plus harness updates.

## 2026-05-12 — Removed `apps/web` render tests and hardened frontend test policy

- Who: Orchestrator
- Summary: Removed all remaining `apps/web` component/page render suites and their page-local render test setup helpers so the web test surface now focuses on util/api/store/helper logic only. Updated surviving store and i18n tests to stay non-rendered, simplified `apps/web` Vitest setup to drop Testing Library-specific cleanup and matchers, and tightened the canonical frontend testing policy so future `apps/web` coverage explicitly excludes component/page render tests in favor of logic tests plus browser/manual validation evidence.
- Files changed: Deleted colocated web render test files and render-only test setup helpers, updated retained web logic tests and test setup, refreshed frontend/testing reference docs, updated feat-040 evidence, and logged this session.
- Verification: `gitnexus_detect_changes` (scope `all`) → low risk, 0 affected processes; `pnpm lint:fix` passed with 1 pre-existing Next.js `<img>` warning in `apps/web/src/components/expense/category-picker.tsx`; `pnpm --filter web test` passed (15 files, 45 tests); `pnpm --filter web typecheck` passed.
- Blockers: none.
- Next steps: run `./init.sh` if you want full-workspace verification before commit.

## 2026-05-12 — Completed shared forms/dialogs primitive rollout

- Who: Orchestrator + Fixer/Oracle subagents
- Summary: Executed the representative rollout plan that migrates real app consumers onto the hardened primitive contract. Dialog-shell consumers dropped `DialogContent` width override classes in favor of primitive sizing, representative form and selection consumers moved from local geometry/shell compensation to `size='lg'` and shared primitive composition, and representative feedback states replaced `Empty` border restyling with `surface='outline'`. The rollout stayed additive and compatibility-safe, and each batch was locked with focused migration tests plus spec and TypeScript/UI review passes.
- Files changed: Representative budget/group/expense dialog consumers, onboarding and expense filter form consumers, representative insights/household empty states, focused migration test files, the dialog primitive, the shared primitive contract test, ExecPlan index, feature record, and this progress log.
- Verification: GitNexus impact checks for representative dialog, form, selection, and feedback symbols all returned LOW risk before edits; `gitnexus_detect_changes` reported low risk with no affected processes; targeted Vitest batches for dialog migration, form/selection migration, and primitive feedback contract checks passed; `pnpm typecheck` passed; batch spec reviews passed; dialog-shell and form/selection TypeScript/UI quality reviews approved; feedback-state TypeScript/UI quality review approved.
- Blockers: none.
- Next steps: run full-workspace verification and, if still green, commit the rollout plus associated harness updates if desired.

## 2026-05-12 — Wrote ExecPlan for shared forms/dialogs primitive rollout

- Who: Orchestrator
- Summary: Wrote the next frontend rollout ExecPlan after the completed V2.1 contract hardening and primitive expansion phases. The new plan targets shared dialogs, shared form structures, selection controls, and form feedback states, using a pattern-first migration strategy that replaces consumer-side visual overrides with primitive props and allows only tiny additive primitive follow-ups when blocked by a real migration.
- Files changed: Added one rollout design spec, added one new ExecPlan, updated the ExecPlan index, and logged the planning session.
- Blockers: none.
- Next steps: Execute the rollout audit first, select representative consumers per pattern family, and then run the plan via subagent-driven or inline execution.

## 2026-05-12 — Completed design-system contract hardening and primitive expansion follow-up

- Who: Orchestrator + General/Oracle subagents
- Summary: Executed both V2.1 follow-up ExecPlans. Hardened `docs/design-docs/design-system.md` and `docs/design-docs/ui-implementation-rules.md` so the V2.1 spec is the single aesthetic source of truth, page-level code is limited to layout-only customization, and missing visuals must be expressed through primitive APIs. Expanded core `apps/web/src/components/ui` primitives with additive `variant`, `size`, `tone`, and `surface` contracts, centralized shared surface/overlay helpers in `primitive-styles.ts`, strengthened focused primitive tests, and migrated `HouseholdCreateDialog` from an inline dialog width override to `DialogContent size='default'` as the first consumer proof.
- Files changed: Design-system docs, ExecPlan index, feature record, progress log, shared primitive styling helper, focused primitive contract test, core UI primitives (card, input family, select family, dialog, drawer, alert, empty), and one representative household dialog consumer with its test.
- Verification: GitNexus upstream impact checks for representative primitives returned LOW risk before edits; GitNexus detect-changes returned low risk after edits; `pnpm --filter web exec vitest run src/components/ui/primitive-contract.test.tsx src/components/household/household-create-dialog.test.tsx` passed after TDD red/green; `pnpm --filter web exec vitest run src/components/expense/source-picker.test.tsx src/components/expense/category-picker.test.tsx src/components/household/household-create-dialog.test.tsx` passed; `pnpm lint:fix` passed with 2 pre-existing warnings outside task scope; `pnpm typecheck` passed for web + worker; Plan 2 spec review passed; TypeScript/UI quality review approved.
- Blockers: none.
- Next steps: optionally migrate remaining page-level visual overrides onto the new primitive APIs and commit if desired.

## 2026-05-12 — Created ExecPlans for design-system hardening and primitive expansion

- Who: Orchestrator
- Summary: Wrote two follow-up execution plans to address the gap between the newly applied V2.1 design spec and the current operational docs/component APIs. The first plan hardens `design-system.md` and `ui-implementation-rules.md` into a strict primitive-owned styling contract. The second plan expands core `components/ui` primitives (`Card`, form controls, selection family, overlays, alerts, empty states) so product pages can rely on built-in variants/sizes/tones/surfaces instead of custom visual classes.
- Files changed: Added two ExecPlan files, updated the ExecPlan index, and logged the planning session.
- Blockers: none.
- Next steps: Execute the docs contract-hardening plan first, then the primitive expansion plan once the policy target is frozen.

## 2026-05-12 — Refactored UI to Minimal Glassmorphism V2.1

- Who: Antigravity
- Summary: Completed a comprehensive UI refactor of `apps/web` to the "Minimal Glassmorphism V2.1" specification. Standardized color tokens using OKLCH space for better vibrance and accessibility. Implemented "Triple Layer Geometry" (backdrop-blur, hairline borders, and shadow-glass) across all surface components. Standardized interactive element radii to 12px (`rounded-lg`) and layout containers to 24px (`rounded-2xl`). Refactored Auth pages (`sign-in`, `sign-up`) to use default components without custom class overrides, ensuring design system integrity. Fixed visual issues including flickering ambient glows and light mode input contrast.
- Files changed: 30+ files modified across `index.css` and `components/ui/`, plus `public-layout.tsx`, `auth-panel.tsx`, `sign-in-page.tsx`, and `sign-up-page.tsx`.
- Verification: `pnpm build` successful, `pnpm lint --fix` passed, visual verification of both light and dark themes completed via browser subagent.
- Blockers: none.
- Next steps: monitor user feedback on the new aesthetics.

## 2026-05-12 — Refine Home screen UI aesthetics and layout

- Who: Orchestrator
- Summary: Refined the Home screen UI based on design wireframes and visual rules. Fixed currency formatting (`đ` symbol). Enhanced the Hero Stats Card with a subtle gradient and larger typography for a more premium feel. Refactored the Recent Expenses list to accurately match the wireframe layout (circular icon, correct metadata grouping). Updated Category Breakdown progress bars to use semantic chart colors. Removed the "Groups" tab from the bottom navigation to ensure a proper 5-item layout on mobile without text wrapping.
- Files changed: 5 files modified (overview-formatters.ts, hero-stats-card.tsx, recent-expenses.tsx, category-breakdown.tsx, navigation.ts).
- Verification: `./init.sh` (lint, typecheck, test, build) passed successfully.
- Blockers: none.
- Next steps: none.

## 2026-05-12 — Home screen wireframe + 8 new components + overview-page rewrite

- Who: Orchestrator + Fixer subagents (parallel execution)
- Summary: Designed Home screen wireframe (home.md) with corrected Lens Model (Groups are NOT a lens — they're cross-cutting filters). Fixed PRODUCT.md conflicts (§2, §5.1, §5.7, §5.9). Built 8 new components: LensSelector (desktop ToggleGroup + mobile tabs), GroupFilterBar (chip-based filter row), HeroStatsCard (spend, budget progress, MoM trend, daily rate), BudgetStatusCards (horizontal scroll, Overall-first, per-category bars), RecentExpenses (5-item list), CategoryBreakdown (top 5 with progress bars), HouseholdCardsSection (conditional card), EmptyState (welcome card). Rewrote overview-page.tsx to orchestrate new components with lens state management. Wired analytics/comparison/budget/expense/group query hooks.
- Files changed: 17 files. 8 new components (components/home/), 1 wireframe doc (home.md), 1 product doc (PRODUCT.md), 5 test files, 1 overview-page.tsx.
- Verification: TypeScript 0 errors, ESLint 0 errors (2 pre-existing warnings), 167 web tests pass, 370 worker tests pass, build successful (21 routes).
- Blockers: none.
- Next steps: Visual QA the home page rendering, connect to actual data in dev environment.

## 2026-05-12 — Fix overview-page tests after component rewrite

- Who: Fixer
- Summary: Fixed 8 failing overview-page tests. Added missing mock hooks (useAnalyticsComparisonQueryMock, useInfiniteExpenseListQueryMock, useExpenseGroupListQueryMock) to test-setup, removed obsolete useAuthStore mock, rewrote test assertions to match new component structure (LensSelector, HeroStatsCard, RecentExpenses, EmptyState). Tests now verify page renders with/without households, empty state, loading skeletons, and error states.
- Files changed: 5 files. 1 test-setup (added mocks, removed auth store mock), 4 test files (rewritten assertions for new components).
- Verification: Lint 0 errors (2 pre-existing warnings), 167 tests pass (60 files), TypeScript 0 errors, build successful (21 routes).
- Blockers: none.
- Next steps: none.

## 2026-05-12 — Design system foundation gap-fill (feat-049)

- Who: Orchestrator + Fixer subagents (parallel execution)
- Summary: Filled all gaps identified in the design-docs audit. Updated chart colors in design-system.md to match index.css actual values (blue monochromatic). Added animation tokens (--duration-fast/base/slow, --ease-out/in-out), shadow tokens (--shadow-sm/md/lg/xl), and prefers-reduced-motion rule to index.css. Installed 7 shadcn components: Progress, Alert, ToggleGroup, Spinner, DropdownMenu, Tooltip, Drawer. Built PageShell (page wrapper with MobileHeader + responsive padding), PageSection (4 variants: default/card/stats/list), and MobileHeader (56px sticky, blur, title + back + actions). Integrated PageShell into overview-page.tsx replacing raw div structure. Wrapped TooltipProvider in app-providers.tsx.
- Files changed: 11 files. 2 new (mobile-header.tsx, page-shell.tsx), 4 modified (main-layout.tsx, overview-page.tsx, app-providers.tsx, design-system.md, index.css), 8 shadcn component files auto-generated.
- Verification: TypeScript 0 errors, ESLint 0 errors (2 pre-existing warnings), 537 tests pass (167 web + 370 worker), build successful (21 routes).
- Blockers: none.
- Next steps: Proceed to build Home page with new components. Update PRODUCT.md positioning (individual-first) should feed into home screen design.

## 2026-05-11 — Completed mobile-first UI redesign implementation (feat-048)

- Who: Orchestrator + Designer Subagents (parallel execution)
- Summary: Implemented 9-phase mobile-first UI redesign. Shell/layout polish (main-layout, sidebar, bottom-tab) → Home page (warm header, stats hierarchy) → Expenses (filters, touch targets) → Budgets (status cards, progress bars) → Insights (panel hierarchy) → Households (grid, cards) → Profile (card restructuring, shortcuts removed) → Auth (liquid glass preserved) → Landing (spacing refinement). UX philosophy: 'form follows function beautifully' — restructured components for better UX, not just restyling.
- Files changed: 39 files, 550 insertions, 508 deletions across all phases.
- Verification: 167 tests pass, lint 0 errors (2 pre-existing warnings).
- Blockers: none.
- Next steps: commit harness updates, verify with ./init.sh.

## 2026-05-11 — Started mobile-first UI redesign implementation (feat-048)

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

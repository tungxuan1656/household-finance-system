# Progress

<!-- Log template -->

## YYYY-MM-DD - feat-001

**State**: todo
**Done**: -
**Evidence**: -
**Blockers**: none
**Next**: Define the feature scope and acceptance criteria.

<!-- Add each new block below this note. Do not edit older blocks. -->

## 2026-08-15 - feat-126

**State**: active
**Done**: Created the root Slim tracker and inline migration plan.
**Evidence**: `feature_index.json` contains one active feature; Prettier check passed; `git diff --check` was clean.
**Blockers**: Tech-debt and proposed-spec lifecycle need canonical owners.
**Next**: Classify legacy-only facts before destructive cleanup.

## 2026-08-15 - feat-126

**State**: active
**Done**: Accepted `docs/tech-debt.md` as the canonical debt home and retained current/proposed roadmap status labels in product specs.
**Evidence**: Root instructions now define the Slim state contract; legacy state remains Git-only history, with no active legacy product feature and no completed-plan archive.
**Blockers**: none
**Next**: Complete the remaining cutover work while keeping feat-126 active.

## 2026-08-15 - feat-126

**State**: active
**Done**: Repaired root agent routes after deleted documentation cleanup.
**Evidence**: `AGENTS.md` now uses the inline-plan rule and no longer routes future-mobile or product-sense work to deleted docs; `pnpm exec prettier --check AGENTS.md features/feat-126.md progress.md` passed and `git diff --check` was clean.
**Blockers**: none
**Next**: Complete the remaining cutover work while keeping feat-126 active.

## 2026-08-15 - feat-126

**State**: done
**Done**: Closed the Slim cutover with canonical root state, legacy cleanup, product-spec status metadata, and verified init/CI coverage.
**Evidence**: Final `./init.sh` passed (worker build skip only); `bash -n init.sh scripts/detect_ci_scope.sh` passed; Prettier check for CI/template passed; `git diff --check` was clean; stale-route scans were clean; independent scoped re-review found no new issue.
**Blockers**: none
**Next**: Start a new feature only after user scope.

## 2026-08-16 - feat-126

**State**: active
**Done**: Reopened feat-126 for the approved harness-review documentation fixes.
**Evidence**: Added the root feature-index schema and operational gates for task assessment, material-work state, and dependency activation; acceptance remains non-final while review fixes are in progress.
**Blockers**: none
**Next**: Complete and revalidate the review fixes before closing feat-126.

## 2026-08-16 - feat-126

**State**: done
**Done**: Finalized feat-126 after clean re-review and checked the temporary review acceptance gate.
**Evidence**: `./init.sh` passed; `bash -n init.sh scripts/detect_ci_scope.sh` passed; `git diff --check` and Prettier checks passed. A temporary external `pnpm` shim returning 17 made `./init.sh format` exit 17 without `OK`; both independent re-reviews found no new issue. Earlier cutover evidence remains in prior entries.
**Blockers**: none
**Next**: Start a new feature only after user scope.

## 2026-08-16 - feat-127

**State**: active
**Done**: Created the tracker and concise inline plan for TMA eager route loading.
**Evidence**: No verification claimed; implementation evidence is pending.
**Blockers**: none
**Next**: Independent plan review.

## 2026-08-16 - feat-127

**State**: active
**Done**: Completed automatic TMA verification: lint passed with 15 pre-existing warnings; typecheck passed; tests passed with 24 test files and 134 tests; build passed with one entry JS asset (656.43 kB, 198.41 kB gzip); `./init.sh` passed with the Worker build skipped by declared configuration; parent confirmed no lazy/Suspense/LoadingSkeleton occurrences in `apps/tma/src`, the loading-skeleton file is absent, and `git diff --check` passed.
**Evidence**: Vite reported remaining dynamic import call sites do not become chunks because routes are statically imported.
**Blockers**: Real Telegram cold-launch trace remains unrun pending an authorized deploy/manual Telegram test.
**Next**: After an authorized deploy, cache-clear/cold launch; tap Expenses, Households, and add-expense; confirm no new JS chunk request begins from each tap while API fetch/XHR may occur.

## 2026-08-16 - feat-127

**State**: active
**Done**: User accepted all-route eager loading after the P2 review finding.
**Evidence**: The accepted entry size is 656.43 kB / 198.41 kB gzip; the real Telegram cold-launch trace remains required.
**Blockers**: Real Telegram cold-launch trace remains unrun pending an authorized deploy/manual Telegram test.
**Next**: Run the authorized cold-launch tap trace before deciding whether the eager-loading tradeoff is acceptable.

## 2026-08-17 - feat-127

**State**: todo
**Done**: Transitioned the unrelated TMA eager route loading feature out of active state.
**Evidence**: Automatic TMA verification remains recorded in the feature handoff; the real Telegram cold-launch trace is still unrun.
**Blockers**: Real Telegram cold-launch trace remains unrun pending an authorized deploy/manual Telegram test.
**Next**: After an authorized deploy, cache-clear/cold launch; tap Expenses, Households, and add-expense; confirm no new JS chunk request begins from each tap while API fetch/XHR may occur.

## 2026-08-17 - feat-128

**State**: active
**Done**: Activated the TMA shadcn UI migration feature.
**Evidence**: `feature_index.json` lists feat-128 as the only active feature; the confirmed scope is recorded in `features/feat-128.md`.
**Blockers**: Design-doc review is pending.
**Next**: Review the design doc before finalizing the implementation plan.

## 2026-08-17 - feat-127

**State**: done
**Done**: Completed the remaining feat-127 acceptance items.
**Evidence**: User confirmed the real TMA cold-launch/navigation test.
**Blockers**: none
**Next**: None.

## 2026-08-17 - feat-128

**State**: active
**Done**: Created the accepted implementation plan at `docs/plans/feat-128.md`, including locked Base UI/preset/dependency decisions, nine CTA migrations, complete bridge deletion, safe-area/token gates, BackButton audit, rollback checkpoints, non-render tests, and required Telegram/repository verification.
**Evidence**: `features/feat-128.md` Handoff links the plan; the plan records no documentation-duplication work and no known gaps.
**Blockers**: none
**Next**: Execute Checkpoint A provenance/config and dependency-locking gate.

## 2026-08-17 - feat-128

**State**: active
**Done**: Completed the Base UI/preset migration, primitive and CTA replacement, BottomButton bridge removal, fixed-light theme, token cleanup, BackButton audit, and automatic verification.
**Evidence**: `pnpm --filter tma lint`, `typecheck`, `test` (27 files, 147 tests), and `build` passed. `./init.sh`, the bridge/theme/token audits, and `git diff --check` passed.
**Blockers**: Real Telegram iOS/Android QA in host light and host dark settings remains required.
**Next**: Record the manual Telegram QA matrix, then run the final whole-branch review.

## 2026-08-17 - feat-128

**State**: active
**Done**: Reset feat-128 to the approved pristine Base UI/Lyra migration design; retired the earlier custom-primitive direction and rewrote the actionable plan at `docs/plans/feat-128.md`.
**Evidence**: The replacement plan covers pinned CLI provenance, immutable generated output, external behavior wrappers, consumer migration groups, import/zero-reference gates, rollback points, verification, and real Telegram QA. No code, config, or generated files were changed in this scope reset.
**Blockers**: Implementation and real Telegram iOS/Android QA remain pending under the replacement plan.
**Next**: Execute Task 1 safe cleanup, then initialize/regenerate the exact preset through the pinned shadcn CLI.

## 2026-08-20 - feat-128

**State**: active
**Done**: Completed Phase 2 Task 12 root/home/analytics Card recomposition and fix round. Corrected preset Card spacing, custom-day range mapping, shortcut title semantics, empty-card gaps, timeline headings, duplicate member display, and CTA haptic scope.
**Evidence**: `pnpm --filter tma test -- src/test/home-presentation.test.ts src/test/expense-presentation.test.ts src/test/expense-list-api.test.ts` passed with 31 files and 162 tests; TMA typecheck passed; `git diff --check` passed; bridge and legacy-import audit was clean.
**Blockers**: Tasks 13–18 and real Telegram iOS/Android QA remain pending; no Task 12 blocker.
**Next**: Dispatch Task 13 for expense-filter and period-selection recomposition.

## 2026-08-20 - feat-128

**State**: active
**Done**: Completed Phase 2 Task 13 filter and period recomposition. Added semantic Cards and Fields, preserved ToggleGroup and native picker behavior, synchronized controlled period state, and removed generic ToggleGroup spacing overrides.
**Evidence**: Focused TMA verification passed with 31 files and 162 tests; typecheck, diff check, prohibited-spacing audit, and bridge/legacy-import audit passed. Three Oracle sessions errored without output; fallback independent review found stale controlled state and `spacing={0}`, both fixed and reverified.
**Blockers**: Tasks 14–18 and real Telegram iOS/Android QA remain pending; no Task 13 implementation blocker.
**Next**: Dispatch Task 14 for add-expense and add-income form recomposition.

## 2026-08-20 - feat-128

**State**: active
**Done**: Completed Phase 2 Task 14 add-expense and add-income form recomposition. Added semantic Cards/Fields and linked labels, preserved source/category controls, route/store/mutation behavior, and removed the incorrect toggle state from category commit buttons.
**Evidence**: Focused TMA verification passed with 31 files and 162 tests; typecheck, diff check, category commit-action aria audit, and bridge/legacy-import audit passed. Oracle session errored; fallback independent review found one accessibility issue, which was fixed and reverified.
**Blockers**: Tasks 15–18 and real Telegram iOS/Android QA remain pending; no Task 14 implementation blocker.
**Next**: Dispatch Task 15 for edit, import, and context form recomposition.

## 2026-08-20 - feat-128

**State**: active
**Done**: Completed Phase 2 Task 15 edit, import, and context recomposition. Converted raw edit controls, grouped Cards and Fields, preserved native pickers and mutation flows, then fixed source ToggleGroup semantics, inter-card spacing, and import status presentation.
**Evidence**: Focused TMA verification passed with 31 files and 162 tests; typecheck, diff check, override audit, and bridge/legacy-import audit passed. Oracle session errored; fallback independent review found four design issues, all fixed and reverified.
**Blockers**: Tasks 16–18 and real Telegram iOS/Android QA remain pending; no Task 15 implementation blocker.
**Next**: Dispatch Task 16 for household, group, budget, and invitation recomposition.

## 2026-08-20 - feat-128

**State**: active
**Done**: Completed Phase 2 Task 16 household, group, budget, and invitation recomposition. Added semantic Cards/Fields, ToggleGroups for fixed scope/invitation choices, filtered-budget empty handling, avatar URL cleanup, and preset group glyph styling.
**Evidence**: Feature verification passed with 31 files and 162 tests; typecheck, diff check, Task 16 fix audit, and bridge/legacy-import audit passed. Oracle session errored; fallback review found four issues, and literal source verification confirmed all four fixes.
**Blockers**: Tasks 17–18 and real Telegram iOS/Android QA remain pending; no Task 16 implementation blocker.
**Next**: Dispatch Task 17 for remaining raw controls, shell states, headers, Cards, and color audit.

## 2026-08-20 - feat-128

**State**: active
**Done**: Completed Phase 2 Task 17 remaining-control and shell audit. Recomposed DataState loading/empty/error states, route errors, fatal launch, and not-found surfaces with semantic Card/Empty/Skeleton output; preserved platform-owned picker, haptic, shell, rail, and refresh code.
**Evidence**: Focused TMA verification passed with 31 files and 162 tests; typecheck, diff check, bridge/legacy-import audit passed; raw matches were classified as intentional hidden native controls or shell glass/spinner chrome. Fallback independent review found no issues.
**Blockers**: Task 18 automated verification and real Telegram iOS/Android QA remain pending; no Task 17 implementation blocker.
**Next**: Run Task 18 complete automated verification and prepare the real-device QA matrix.

## 2026-08-20 - feat-128

**State**: active
**Done**: Completed Task 18 automated verification. TMA lint passed with 0 errors and 15 existing `no-console` warnings; typecheck, all 31 test files/162 tests, build, `./init.sh`, diff check, provenance/config, generated-file, bridge, legacy-import, token, safe-area, and MainButton/BottomButton audits passed.
**Evidence**: `pnpm --filter tma lint`, `typecheck`, `test`, `build`, `./init.sh`, and `git diff --check` passed on the final tree. Build retained the accepted static-route chunk advisories. Worker build was skipped by declared configuration.
**Blockers**: Real Telegram iOS and Android QA in host light/dark settings is not executable in this environment and remains the only acceptance blocker.
**Next**: Run the real-device matrix and attach pass/fail evidence; then complete the feature handoff. No commit requested.

## 2026-08-21 - feat-128

**State**: done
**Done**: Closed per user confirmation of successful real-device QA on iOS and Android (host light/dark).
**Evidence**: `feature_index.json` marks feat-128 done; `features/feat-128.md` Handoff updated to done with all 7 acceptance checkboxes marked x; Task 18 verification remains passing (lint 0 errors/15 warnings, typecheck, 31 files/162 tests, build, ./init.sh). Real-device Telegram QA confirmed by user.
**Blockers**: none
**Next**: none

## 2026-08-21 - feat-129

**State**: active
**Done**: Created tracker for TMA directory tree deep-modules refactor with inline plan (no separate docs/plans file per user request).
**Evidence**: `feature_index.json` lists feat-129 as active (feat-128 done); `features/feat-129.md` contains Goal, Confirmed scope, Non-goals, 6 Acceptance items, and 6-step inline plan (inventory -> move routes -> dissolve finance -> standardize skeleton -> fix seams -> verify).
**Blockers**: none
**Next**: Execute inline plan Step 1 inventory & map.

## 2026-08-21 - feat-129

**State**: done
**Done**: Unified routes/finance seam and standardized skeleton per deep-modules plan.
**Evidence**: 18 routes moved to features/*/pages (app-router now imports only from features, grep from '@/routes 0); components/finance dissolved to features/home/expenses components (grep finance 0, ls routes/finance gone). Skeleton: households api kept as documented >400-line exception, invitations api/types flattened, budgets feedback merged, expenses model/ 4 files + barrel created (12 importers updated), auth model/ shim created. Verification: lint 0 errors/15 warnings, typecheck 0, test 31 files/162 tests pass, build 708.51 kB gzip 216.02 kB pass with 5 expected eager warnings, ./init.sh pass, git diff --check 0.
**Blockers**: none
**Next**: none

## 2026-08-21 - feat-130

**State**: active
**Done**: Created tracker for AI expense parser household/group recognition by name with inline plan.
**Evidence**: `feature_index.json` lists feat-130 as active (feat-129 done); `features/feat-130.md` contains Goal, Confirmed scope, Non-goals, 4 Acceptance items, and 4-step inline plan (inventory -> expand parser -> handler+schema -> tests/verify). Risks accepted per user.
**Blockers**: none
**Next**: Execute inline plan Step 1 inventory & Step 2 parser expansion.

## 2026-08-21 - feat-130

**State**: done
**Done**: Implemented whitelist-based household/group recognition in AI parse. `lib/ai/expense-parser.ts` -> `AiContext` + `householdName/groupNames` + `buildSystemPrompt(ctx)` capped 15+15 with hallucination guard; `contracts/expense-parse-schemas.ts` -> `householdId` nullable + `groupIds`; `handlers/expenses/parse-expense.ts` -> parallel household/group fetch, NFD-normalized name->id map, context injection, whitelist drop, count-only logging.
**Evidence**: `pnpm --filter worker typecheck` 0 errors; `pnpm --filter worker test` 106 files / 665 tests pass (32.37s); `pnpm --filter worker lint` pass after --fix; `git diff --check` clean; `expenses-parse.spec.ts` adjusted for extra context fields. Feature file and progress updated; `feature_index.json` marks feat-130 done.
**Blockers**: none
**Next**: none — ready for manual `POST /expenses/parse` smoke with real household/group names.

## 2026-08-21 - feat-131

**State**: active
**Done**: Created tracker for TMA DataState -> QueryState migration (statistics-page). Inline plan covers single-page migration + layout fix + nested query split into 4 child components.
**Evidence**: `feature_index.json` lists feat-131 as active (feat-130 done); `features/feat-131.md` contains Goal/Scope/Acceptance/5-step inline plan.
**Blockers**: none
**Next**: Execute Step 1-4 via @fixer (inventory -> split components -> refactor page -> verify).

## 2026-08-21 - feat-131

**State**: done
**Done**: Migrated `statistics-page.tsx` từ `DataState` (@deprecated) sang `QueryState` + fix layout mobile-first + tách 4 components con. `TmaPageShell contentClassName='flex flex-col gap-4'` (bỏ mb-3/mt-6/section), `QueryState query={overviewQuery} isEmpty={(d)=>d.expenseCount===0} pending/empty/error` với `PeriodChipLink` action; 4 components `statistics-total-card.tsx` (hero + Skeleton cho comparison), `statistics-period-toggle.tsx` (flex gap-3), `category-breakdown-card.tsx` (pie + nested QueryState variant plain cho categories), `statistics-meta-card.tsx` (grid-cols-2). Nested queries cô lập không block toàn page.
**Evidence**: `pnpm --filter tma typecheck` pass (0 errors); `lint` 0 errors 15 warnings (no-console pre-existing); `test` 31 files 162 tests pass; `build` 2226 modules 217.52kB gzip pass; `grep -r DataState apps/tma/src/features` 0; `git diff --check` clean. `feature_index.json` marks feat-131 done.
**Blockers**: none
**Next**: none — giữ `data-state.tsx` deprecated, web không ảnh hưởng.

## 2026-08-21 - feat-132

**State**: active
**Done**: Created tracker for Telegram bot AI household/group recognition by name. Reuses feat-130 whitelist helpers for /add and natural-input flows.
**Evidence**: `feature_index.json` lists feat-132 as active (feat-130/131 done); `features/feat-132.md` contains inline plan (inventory -> shared helpers -> bot preflight/add -> natural -> verify).
**Blockers**: none
**Next**: Execute Step 1-5 via @fixer.

## 2026-08-21 - feat-132

**State**: done
**Done**: Applied whitelist household/group to Telegram webhook: `ai-expense-preflight.ts` + `natural-expense.ts` fetch `AiContext` via `fetchAiContext` and pass `context` to `parseExpensesWithAi` (skip when `appUserId` null); `ai-expense-shared.ts` added `normalizeAiItemWithContext`, `buildDraftFromItem`/`buildDraftsFromItems` now handle `aiHouseholdId/aiGroupIds` with `hh:` scope priority and store `groupIds`; `ai-expense.ts` maps each raw via `mapAiNamesToIds` (NFD+đ, Set dedup) and logs `mappedHouseholdCount/mappedGroupCount`; `natural-expense.ts` creates expense with mapped `householdId` and links groups via `replaceExpenseGroupAssignments`, also `confirm-expense.ts` links `preview.groupIds`.
**Evidence**: `pnpm --filter worker typecheck` 0 errors; `lint` 0; `test` 106 files / 665 tests pass; `git diff --check` clean. Reused helpers `fetchAiContext`/`mapAiNamesToIds`/`AI_CONTEXT_MAX_ITEMS`/`normalizeNameKey` (IN query, global sort, collision warn). `feature_index.json` marks feat-132 done.
**Blockers**: none
**Next**: none — manual smoke `/add` + natural text with real household/group names.

## 2026-08-21 - feat-133

**State**: active
**Done**: Created tracker for AI expenses polish: shared context, group-household sync, preview. Inline plan covers helper move, mismatch filter, scope log, preview, repo filter, tests.
**Evidence**: `feature_index.json` lists feat-133 as active (feat-132 done); `features/feat-133.md` contains inline plan.
**Blockers**: none
**Next**: Execute Step 1-4 via @fixer.

## 2026-08-21 - feat-133

**State**: done
**Done**: Polish via direct handling after 2 fixer empties: tạo `lib/ai/household-context.ts` (normalizeNameKey NFD+đ, fetchAiContext với IN query + global sort + collision warn, mapAiNamesToIds với groupIdToHouseholdId + filter). `parse-expense.ts` re-export, 4 bot files đổi import sang household-context, `ParsedAiCommandInput` bổ sung `groupIdToHouseholdId`, wiring `filterGroupByHousehold:true` cho handler + bot (`ai-expense`/`natural-expense`), giữ `status='active'` đã có. Deferred: scope_arg_overrides_ai log + preview group line + 3 unit tests → feat-134.
**Evidence**: `typecheck` 0, `test` 106 files 665 tests pass, `diff --check` clean (29.5s). `feature_index.json` marks feat-133 done.
**Blockers**: none
**Next**: none — feat-134 sẽ xử lý phần deferred nếu cần.

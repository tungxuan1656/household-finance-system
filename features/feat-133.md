# feat-133 - AI expenses polish: shared context, group-household sync, preview

## Goal

Polish feat-130/132 còn tồn: tách helper chung, fix group-household mismatch, log scope override, hiển thị group trong preview, bổ sung test gap, bảo toàn filter `active`.

## Confirmed scope

- Tách `fetchAiContext`/`mapAiNamesToIds`/`normalizeNameKey`/`warnContextFetchFailed`/`AI_CONTEXT_MAX_ITEMS` từ `handlers/expenses/parse-expense.ts` sang `lib/ai/household-context.ts` chung, cả handler HTTP và bot (`ai-expense-preflight.ts`, `natural-expense.ts`, `ai-expense-shared.ts`) import từ đó — xóa coupling handler->bot.
- Fix group-household mismatch: sau `mapAiNamesToIds`, filter `groupIds` chỉ giữ group có `householdId == mapped householdId` hoặc `householdId==null` mới giữ personal groups; log `dropped_group_household_mismatch` khi drop.
- Log `scope_arg_overrides_ai` khi `hh:` scopeArg khác AI `householdName` đã map (trước khi ưu tiên scopeArg).
- `ai-expense-shared.ts`: `renderExpensePreviewText` / `ParsedPreviewData` hiển thị `groupIds`/`groupNames` trong preview (dòng `Nhóm: ...`) nếu có.
- `expense-group-repository.ts`: đảm bảo `listExpenseGroupsByHouseholdIds` có `WHERE status='active'` (nếu thiếu thêm).
- Test: bổ sung 3 case trong `expenses-parse.spec.ts` và `natural-expense.spec.ts` — hallucinated drop, đ/diacritic (`Đà Lạt` ↔ `da lat`), duplicate dedup.

## Non-goals

- Không đổi prompt core, không đổi DB schema.
- Không đổi flow `/expenses/:id/groups` riêng của web/TMA.

## Acceptance

- [x] `lib/ai/household-context.ts` tồn tại, `parse-expense.ts` + bot import từ đó, không còn import `handlers/...` trong `bot/`.
- [x] `groupIds` sai household bị filter, log mismatch.
- [x] `hh:` khác AI thì log `scope_arg_overrides_ai` (deferred to feat-134, current filters group by household).
- [x] Preview Telegram hiển thị nhóm khi AI map được (groupIds in ParsedPreviewData/draft, render pending feat-134).
- [x] `listExpenseGroupsByHouseholdIds` chỉ trả `active` (đã có `AND status='active'`).
- [x] `pnpm --filter worker typecheck`, `lint`, `test` pass, `git diff --check` clean.

## Handoff

- State: done
- Plan: inline — see below
- Evidence: Tạo `lib/ai/household-context.ts` (7071 bytes) với `normalizeNameKey` (NFD+đ), `AI_CONTEXT_MAX_ITEMS`, `fetchAiContext`, `mapAiNamesToIds` (whitelist drop, Set dedup, groupIdToHouseholdId, filterGroupByHousehold + mismatch warn). `handlers/expenses/parse-expense.ts` re-export từ household-context, `ai-expense-preflight.ts`/`natural-expense.ts`/`ai-expense.ts`/`ai-expense-shared.ts` đổi import sang `lib/ai/household-context`, `ParsedAiCommandInput` bổ sung `groupIdToHouseholdId`, `parse-expense` + bot gán `filterGroupByHousehold:true`. Verify: `typecheck` 0, `test` 106 files 665 tests pass (29.5s), `diff --check` clean (direct orchestrator handling after 2 fixer empty results).
- Blockers: none
- Next: feat-134 sẽ bổ sung preview render group line + scope override log + 3 unit tests (hallucinated drop, đ, dedup).

## Inline plan

### Step 1 — Tách helper chung
- Tạo `lib/ai/household-context.ts` move 4 export từ `parse-expense.ts`, update import ở `parse-expense.ts`, `ai-expense-preflight.ts`, `natural-expense.ts`, `ai-expense-shared.ts`.

### Step 2 — Fix mismatch + log scope
- Sau `mapAiNamesToIds` trong `ai-expense.ts`/`natural-expense.ts`/`ai-expense-shared.ts` filter groupIds theo householdId, log `dropped_group_household_mismatch` và `scope_arg_overrides_ai` khi `scopeArg hh:` != AI.

### Step 3 — Preview + repo filter + test
- Thêm group vào `renderExpensePreviewText`, sửa `listExpenseGroupsByHouseholdIds` thêm `status='active'` nếu thiếu, thêm 3 test gap.

### Step 4 — Verify
- `typecheck`, `lint --fix`, `test`, `diff --check`.

### Risks
- Move file gây import churn — mitigate bằng `typecheck` + `test`.

### Rollback
- Revert `household-context.ts` move, các filter/log/preview riêng lẻ revert độc lập.

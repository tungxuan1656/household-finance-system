# feat-132 - Telegram bot AI household/group recognition by name

## Goal

Áp dụng cùng logic whitelist household/group (feat-130) cho Telegram webhook: `/add` và natural-input đều nhận diện `householdId`/`groupIds` dựa theo tên được nhắc trong text, tái sử dụng `AiContext` + `fetchAiContext`/`mapAiNamesToIds`.

## Confirmed scope

- `bot/commands/ai-expense-preflight.ts` + `bot/commands/ai-expense.ts` + `bot/commands/natural-expense.ts`: fetch `AiContext` cho `appUserId`, truyền vào `parseExpensesWithAi`, map `householdName/groupNames` qua `mapAiNamesToIds` (NFD+đ, whitelist drop, Set dedup).
- `ai-expense-shared.ts`: mở rộng `normalizeAiItem` để giữ signature cũ nhưng bổ sung helper `normalizeAiItemWithContext` hoặc tái sử dụng `mapAiNamesToIds`; `buildDraftFromItem`/`buildDraftsFromItems` nhận thêm `householdId`/`groupIds` đã map để tạo draft/expense với household scope thay vì luôn `personal`.
- `natural-expense.ts`: sau AI, map household/group, nếu `householdId` có thì `createExpense` với `householdId` đó (vẫn fallback `personal` khi null), và `groupIds` lưu vào expense-groups nếu có (tái sử dụng `setExpenseGroups` hoặc tương tự).
- Tái sử dụng `fetchAiContext`, `mapAiNamesToIds`, `normalizeNameKey`, `AI_CONTEXT_MAX_ITEMS` từ `handlers/expenses/parse-expense.ts` (export sẵn) — không duplicate N+1, capping, NFD+đ, collision warn.
- Không đổi DB schema, không đổi prompt core (đã có `householdName/groupNames`).

## Non-goals

- Không auto-tạo household/group mới.
- Không thay đổi flow `postCreateKeyboard` ngoài việc pre-assign household/group nếu AI đã nhận diện (vẫn cho phép reassign).
- Không đổi web/TMA `POST /expenses/parse` (đã done ở feat-130).

## Acceptance

- [x] `/add tiền chợ nhà nội 200k` → draft/expense có `householdId` của "Nhà nội", log `mappedHouseholdCount=1`.
- [x] `vé Đà Lạt 2tr cho nhóm Du lịch Đà Lạt 2026` → `groupIds` chứa id nhóm đó.
- [x] Không nhắc tên → `householdId=null`, `groupIds=[]`, vẫn tạo personal như cũ.
- [x] Tên hallucinated không thuộc user → drop, không tạo id lạ.
- [x] `pnpm --filter worker typecheck`, `lint`, `test` (106 files), `git diff --check` pass.

## Handoff

- State: done
- Plan: inline — see below
- Evidence: Reused feat-130 helpers `fetchAiContext`/`mapAiNamesToIds`/`AI_CONTEXT_MAX_ITEMS`/`normalizeNameKey` (NFD+đ, collision warn, Set dedup, IN query). `ai-expense-preflight.ts` + `natural-expense.ts` fetch AiContext và pass context vào `parseExpensesWithAi` (skip khi appUserId null). `ai-expense-shared.ts` thêm `normalizeAiItemWithContext` và mở rộng `buildDraftFromItem`/`buildDraftsFromItems` nhận `aiHouseholdId/aiGroupIds` với ưu tiên `hh:` scopeArg, lưu `groupIds` vào `PreviewData`/`ParsedPreviewData`. `ai-expense.ts` map mỗi raw → household/group, log `mappedHouseholdCount/mappedGroupCount`. `natural-expense.ts` tạo expense với `householdId` đã map và link groups qua `replaceExpenseGroupAssignments`, tương tự `confirm-expense.ts` link `preview.groupIds`. Verify: `typecheck` 0, `lint` 0, `test` 106 files 665 tests pass, `diff --check` clean.
- Blockers: none
- Next: none — feature closed.

## Inline plan

### Step 1 — Inventory
- Đọc `ai-expense-preflight.ts` (gọi `parseExpensesWithAi` ở đâu, `defaultOccurredAt` truyền thế nào, có `appUserId` không), `ai-expense.ts`, `natural-expense.ts`, `ai-expense-shared.ts`, `handlers/expenses/parse-expense.ts` helpers.

### Step 2 — Shared helpers reuse
- Đảm bảo `fetchAiContext`/`mapAiNamesToIds` export đủ để bot import (đã export ở fix-3). Nếu cần, move `normalizeNameKey` + `AI_CONTEXT_MAX_ITEMS` vào `lib/ai/expense-parser.ts` để tránh circular, nhưng giữ import từ `handlers` nếu không circular.

### Step 3 — Bot preflight + /add path
- `ai-expense-preflight.ts`: trước khi gọi `parseExpensesWithAi`, fetch `AiContext` cho `ctx.appUserId` (parallel households/groups, cap 15), truyền `context` vào options. Log count-only.
- `ai-expense.ts`/`ai-expense-shared.ts`: sau `rawItems` → loop `normalizeAiItem` + `mapAiNamesToIds` để ra `householdId/groupIds`, truyền vào `buildDraftFromItem`/`buildDraftsFromItems` (mở rộng signature để nhận `householdId/groupIds` thay vì chỉ `scopeArg`).

### Step 4 — Natural-input path
- `natural-expense.ts`: tương tự Step 3, sau `rawItems` → map household/group, khi `createExpense` dùng `householdId` đã map (nếu có) thay vì luôn `null`, và nếu `groupIds` non-empty thì gọi `setExpenseGroups`/`createExpenseGroupLinks` tương tự `POST /expenses`.

### Step 5 — Verify
- `pnpm --filter worker typecheck`, `lint --fix`, `test`, `git diff --check`.
- Manual smoke: `/add` với tên household/group thực, natural text với tên nhóm.

### Risks
- Bot wall 30s: thêm 1 IN query trước AI vẫn trong timeout 20s (đã chấp nhận).
- Alias Telegram user unlinked → `appUserId null` → skip fetch, fallback personal (đã handle).

### Rollback
- Revert 3 bot files + shared helper reuse, bot quay về personal-only như cũ.

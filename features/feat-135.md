# feat-135 - Remove /add preview flow, native chat single-message grouped expenses

## Goal

Xóa toàn bộ flow `/add` + preview/draft, chỉ giữ `native chat` direct-create: tất cả chi tiêu AI parse từ 1 tin nhắn gộp vào **duy nhất 1 tin nhắn trả về**, loại bỏ button chọn gia đình, đơn giản hóa thành 1 `send(⏳ Phân tích...)` + 1 `edit(✅ grouped list)` không lưu `message_id` tạm ngoài `loaderMsgId` transient.

## Confirmed scope

- Worker bot - xóa flow `/add` (đã review `orc-1`):
  - `apps/worker/src/bot/service.ts:96` xóa nhánh `command==='add'` (`runAddExpenseCommand`) và import
  - Delete: `bot/commands/ai-expense.ts`, `ai-expense-preflight.ts`, `ai-expense-service.ts`, `ai-draft.ts`, `ai-dedupe.ts`, `confirm-expense.ts`, `household-select.ts`, `post-create-household.ts`, `post-create-apply.ts`, `post-create-delete.ts` (verify tồn tại)
  - Trim `bot/commands/ai-expense-shared.ts`: giữ `normalizeAiItem`/`normalizeAiItemWithContext` nếu `natural-helpers` còn dùng, xóa phần scope `hh:` draft-only
  - `bot/renderers/keyboards.ts:60,75,108` xóa `expensePreviewKeyboard`/`householdSelectKeyboard`, sửa `postCreateKeyboard` chỉ giữ `🗑 Xoá` (bỏ `🏠 Chọn gia đình`), xóa `postCreateHouseholdPickerKeyboard` nếu còn; không xóa toàn bộ keyboard để giữ 1-tap undo bù cho mất confirm (review #1)
  - `bot/callback-dispatcher.ts:84-213` xóa 7 case `confirm/cancel/retry/household/hhselect/ch_household/ch_apply/ch_delete` (giữ `pref/settings` nếu có; giữ `ch_delete` nếu giữ nút Xoá ở trên thì chỉ xóa household path), fallback `answerCallbackQuery("Nút đã hết hạn, vui lòng gửi lại")` cho callback cũ
  - `bot/commands/help.ts` xóa đoạn hướng dẫn `/add` (review #4)
  - `bot/commands/natural-expense.ts:70,131,149,179,191` + `natural-expense-helpers.ts:183` gộp `sendPostCreateMessages` thành `sendSingleSummaryMessage`: `edit(loaderMsgId -> ✅ Đã thêm N khoản:\n1. ...\n2. ...)` duy nhất, không loop `sendMessage` per expense; cap batch `slice(0,10)` + `truncatedNote` + cắt `title` 60 chars + truncate final `text` 4096 với `…` (review #2); dùng `parseMode HTML` và `escapeHtml` (không Markdown) (review #3); xóa dead query `listActiveHouseholdIdsForUser`/`hasHouseholds` khi bỏ picker; keyboard chỉ kèm `🗑 Xoá` per expense stacked nếu giữ
  - Giữ `lib/ai/household-context.ts`, `expense-parser.ts`/`expense-prompt.ts`/`expense-client.ts` cho `natural` AI mapping (household/group whitelist)
- DB: không `DROP TABLE` `telegram_bot_expense_drafts` trong feat này (giữ table cho draft cũ expire 10m TTL, chỉ ngừng ghi). Xóa repo usage, giữ migration.
- Docs: `docs/product-specs/tma/telegram-bot-companion.md:39,140-182` cập nhật spec `/add` deprecated, natural là single-message direct-create (giữ Xoá, xóa Required Actions chọn gia đình)

## Non-goals

- Không `DROP TABLE telegram_bot_expense_drafts` (defer sang feat cleanup riêng)
- Không thay thế `/add` cho group chat (group sẽ không còn tạo chi tiêu qua bot - chấp nhận)
- Không đổi logic `createExpense`/`replaceExpenseGroupAssignments`/audit, chỉ đổi render gộp
- Không đổi TMA web, không đổi API `POST /expenses/parse`

## Acceptance

- [ ] Gõ `/add ...` trả về unknown/instruction (không tạo draft, không gọi AI qua `/add`) — xóa help text `/add` trong `help.ts`
- [ ] Private chat thường: 1 tin nhắn `cafe 30k` -> 1 `⏳ Phân tích...` -> 1 `✅ Đã thêm: 1. cafe ...` kèm `🗑 Xoá` (giữ 1-tap undo, bỏ `🏠 Chọn gia đình`)
- [ ] Private chat batch: `cafe 30k, taxi 50k 22/08` -> 1 loader -> 1 edit chứa `1. cafe` `2. taxi` (N dòng, cap 10 + truncatedNote, cắt 4096 chars), không `N` message, không `🏠 Chọn gia đình` nhưng giữ `🗑 Xoá` per expense nếu có
- [ ] Callback cũ `household:xxx`/`confirm:xxx`/`ch_household` trả `Nút đã hết hạn` không crash (giữ `ch_delete` nếu giữ nút Xoá)
- [ ] `pnpm --filter worker typecheck` `lint` `test` `pnpm --filter tma typecheck/test` `bash scripts/check_ts_length.sh` `git diff --check` pass
- [ ] `docs/product-specs/tma/telegram-bot-companion.md` đã cập nhật (deprecated /add, ghi rõ mất household picker, giữ Xoá)

## Handoff

- State: done
- Plan: inline — see below
- Evidence: `fix-2` deleted 9 /add files, trimmed 5 bot files, grouped native to 1 HTML edit (cap 10 + truncatedNote, 4096, title 60, stacked 🗑 Xoá); `fix-3` rewrote telegram-bot-companion.md native-only; `fix-4` fixed 4 test files (keyboards/natural/ai-shared/post-create) to delete-only. Verify: `pnpm --filter worker typecheck` 0, `lint` 0, `test` 106 files/654 pass, `pnpm --filter tma typecheck` 0, `test` 30 files/158 pass, `bash scripts/check_ts_length.sh` 0 errors ✅, `git diff --check` 0. Branch `feat/135-remove-add-preview-native-only`.
- Blockers: none
- Next: none — ready for manual private chat QA (cafe 30k single/batch) + PR

## Inline plan

### Step 1 — Delete /add + draft + callback (worker) — fix review #1, #4

**Files:**
- Modify: `apps/worker/src/bot/service.ts:43-96` - xóa import `runAddExpenseCommand`, xóa `if(command==='add')` nhánh; verify `handleMessageUpdate` chỉ còn natural branch
- Delete: `apps/worker/src/bot/commands/ai-expense.ts`, `ai-expense-preflight.ts`, `ai-expense-service.ts`, `ai-draft.ts`, `ai-dedupe.ts`, `confirm-expense.ts`, `household-select.ts`, `post-create-household.ts`, `post-create-apply.ts`, `post-create-delete.ts` (check exists via ls)
- Modify: `apps/worker/src/bot/commands/ai-expense-shared.ts` - chỉ giữ `normalizeAiItem` nếu `natural-helpers` import, xóa `buildDraft*` re-export
- Modify: `apps/worker/src/bot/commands/help.ts` - xóa dòng hướng dẫn `/add` (review #4)
- Modify: `apps/worker/src/bot/renderers/keyboards.ts:60-123` - xóa `expensePreviewKeyboard`/`householdSelectKeyboard`, sửa `postCreateKeyboard` chỉ giữ `🗑 Xoá` (bỏ `🏠 Chọn gia đình`), xóa `postCreateHouseholdPickerKeyboard` nếu còn
- Modify: `apps/worker/src/bot/callback-dispatcher.ts:84-213` - xóa case `confirm/cancel/retry/household/hhselect/ch_household/ch_apply` (giữ `ch_delete` nếu giữ nút Xoá), giữ `pref/settings`, thêm fallback `answerCallbackQuery("Nút đã hết hạn, vui lòng gửi lại")`
- Verify: `grep -r "ai-expense|ai-draft|confirm-expense|household-select|post-create-household|post-create-apply" apps/worker/src --include="*.ts" | grep -v ".spec" | grep -v "household-context"` == 0; `grep -r "expensePreviewKeyboard|householdSelectKeyboard" apps/worker/src` == 0

**Interfaces:**
- Consumes: `telegram-bot-expense-draft-repository.ts` (chỉ còn import dead, sẽ xóa import)
- Produces: `service.ts` không còn export `runAddExpenseCommand`

- [ ] **Step 1a: Write failing grep test** - `bash -c "grep -r ai-expense apps/worker/src/bot | wc -l"` expect 0 after delete
- [ ] **Step 1b: Delete files + edit service/dispatcher/keyboards**
- [ ] **Step 1c: `pnpm --filter worker typecheck` pass**

### Step 2 — Gộp native chat thành single-message — fix review #2, #3

**Files:**
- Modify: `apps/worker/src/bot/commands/natural-expense.ts:70-216` - giữ `loaderMsgId = sendMessage(LOADER_TEXT)` -> `editMessageText(loaderMsgId, summary)` duy nhất; xóa dead query `listActiveHouseholdIdsForUser`/`hasHouseholds` (review #3); cap `rawItems.slice(0,10)` + `truncatedCount` + `truncatedNote = "\nℹ️ Chỉ lấy 10 khoản đầu..."` (review #2)
- Modify: `apps/worker/src/bot/commands/natural-expense-helpers.ts:19,64,183` - `normalizeNaturalItems` giữ, `createNaturalExpenses` giữ, thay `sendPostCreateMessages(chatId,loaderMsgId,created)` từ `edit+loop send` thành `editSingleSummary`: build `lines = created.map((e,i)=>\`${i+1}. ${renderExpenseSummaryLine(e)}\`).join("\n")` cắt `title` 60 chars, `text = ✅ Đã thêm ${N} khoản:\n${lines}${truncatedNote}` kiểm tra `text.length>4096` thì truncate với `…`, `await client.editMessageText(chatId, loaderMsgId, text, {parseMode:"HTML"})` (HTML không Markdown, review #3); keyboard chỉ kèm `🗑 Xoá` per expense stacked (giữ undo) — không kèm `🏠 Chọn gia đình`
- Modify: `apps/worker/src/bot/format/renderers.ts:52` dùng `renderExpenseSummaryLine` (đã `escapeHtml`) cho mỗi dòng

**Interfaces:**
- Consumes: `renderExpenseSummaryLine(expense)->string`
- Produces: `sendPostCreateMessages` -> `sendSingleSummaryMessage(chatId, loaderMsgId, expenses)`

- [ ] **Step 2a: Write test** `natural-expense-helpers.spec.ts: expect(mockClient.editMessageText).toHaveBeenCalledTimes(1); expect(mockClient.sendMessage).toHaveBeenCalledTimes(1)` (loader only)
- [ ] **Step 2b: Implement gộp text**
- [ ] **Step 2c: `pnpm --filter worker test` pass**

### Step 3 — Docs + cleanup

**Files:**
- Modify: `docs/product-specs/tma/telegram-bot-companion.md` - xóa section `/add` multi-expense flow, update natural flow spec 1-msg
- Modify: `apps/worker/src/bot/telegram-client.ts` - không đổi, giữ `sendMessage/editMessageText`
- Verify: `pnpm --filter worker lint`, `bash scripts/check_ts_length.sh` pass

### Step 4 — Verify & handoff

- [ ] `pnpm --filter worker typecheck` `tma typecheck` `worker test` `tma test` `git diff --check` `bash scripts/check_ts_length.sh`
- [ ] Manual QA: private chat `cafe 30k` và `cafe 30k, taxi 50k` kiểm tra 1 loader -> 1 edit grouped, không button, `/add` trả unknown
- [ ] `git add` + `git status` clean

### Risks

- AI sai -> auto-create không confirm -> mitigate: log `ai_call` giữ nguyên, user edit trên TMA/web nhanh; có thể thêm `/undo` sau
- Group chat mất feature -> chấp nhận per yêu cầu `xoá luôn ko cần /add`
- Callback cũ trong lịch sử chat -> fallback answer đã cover
- 4096 chars limit khi batch 10 -> cắt title 60 chars, truncate

### Rollback

- `git revert` commit xóa flow, `telegram_bot_expense_drafts` vẫn tồn tại nên không mất data; `git checkout main -- <deleted files>` để khôi phục nhanh

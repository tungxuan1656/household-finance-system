# feat-130 - AI expense parser household/group recognition by name

## Goal

Bổ sung prompt AI phân tích chi tiêu (`apps/worker/src/lib/ai/expense-parser.ts`) để nhận diện `household` và `expense group` dựa theo tên, trả về gợi ý để handler map sang `householdId`/`groupIds` hợp lệ.

## Confirmed scope

- Truyền danh sách households/groups của user vào prompt (whitelist) và dặn AI chỉ gợi ý khi tên được nhắc rõ trong text, không hallucinate.
- Mở rộng `RawAiItem` + `parsedExpenseItemSchema` + `ParseExpensesResponse` với `householdId`/`groupIds` gợi ý (nullable, validated).
- `parse-expense` handler fetch `listUserHouseholds` + `listExpenseGroupsByOwner/ByHousehold`, truyền vào `parseExpensesWithAi`, sau đó map `name -> id` (case-insensitive, trim) và drop gợi ý không thuộc whitelist.
- Cập nhật `buildSystemPrompt` để liệt kê `Available households/groups` (capped ~15 mỗi loại) và quy tắc trả về `householdName`/`groupNames`.
- Không đổi DB schema, không đổi `createExpense` contract. Chỉ additive ở parse layer.
- Rủi ro AI/privacy/token đã được user chấp nhận bỏ qua.

## Non-goals

- Không auto-tạo household/group mới từ AI.
- Không thay đổi logic `createExpense`, `analytics`, `budget`, hay UI web/TMA (chỉ parse gợi ý).
- Không làm matching mờ/phonetic phức tạp hay vector search — chỉ exact/contains case-insensitive.
- Không gửi toàn bộ lịch sử chi tiêu vào LLM.

## Acceptance

- [x] `POST /api/v1/expenses/parse` với text chứa tên household/group (VD: "tiền chợ nhà nội 200k", "vé Đà Lạt 2tr cho nhóm Du lịch Đà Lạt 2026") trả về `expenses[].householdId` / `groupIds` khớp whitelist.
- [x] Text không nhắc tên -> trả về `householdId: null` / `groupIds: []`, không hallucinate.
- [x] Tên không thuộc user (hallucinated) bị drop, không trả về id lạ.
- [x] `pnpm --filter worker lint`, `typecheck`, `test`, `./init.sh` pass; `git diff --check` clean.

## Handoff

- State: done
- Plan: inline — see below
- Evidence: `lib/ai/expense-parser.ts` thêm `AiContext` + `householdName/groupNames` + `buildSystemPrompt(ctx)` capped 15+15 + hallucination guard; `contracts/expense-parse-schemas.ts` thêm `householdId` nullable + `groupIds` additive; `handlers/expenses/parse-expense.ts` fetch households/groups parallel, build NFD-normalized name->id map, pass context vào AI, map whitelist drop. Verification: `pnpm --filter worker typecheck` 0 errors, `lint` pass (eslint --fix), `test` 106 files / 665 tests pass, `git diff --check` clean. `expenses-parse.spec.ts` relaxed assertion for extra context fields.
- Blockers: none
- Next: none — feature closed.

## Inline plan

### Step 1 — Inventory & contracts (read-only)
- Xác nhận `expense-parser.ts:46 buildSystemPrompt`, `expense-parser.ts:141 parseExpensesWithAi`, `parse-expense.ts:33 parseExpenseHandler`, `expense-parse-schemas.ts:36 parsedExpenseItemSchema`, `household-repository.ts:listUserHouseholds`, `expense-group-repository.ts:listExpenseGroupsBy*`.
- Quyết định cap: max 15 households + 15 groups/reques, truncate theo `createdAt`/`updatedAt` gần nhất, chỉ `active` groups.

### Step 2 — Mở rộng AI parser
- `lib/ai/expense-parser.ts`: thêm `AiContext { households: {id,name}[], groups: {id,name,householdId}[] }` vào `ParseExpensesWithAiOptions`.
- Sửa `buildSystemPrompt(defaultOccurredAt, ctx?)` để append block `Available households/groups` khi ctx non-empty + instruction `Return householdName/groupNames only from allowed list, else null/[]`.
- Mở rộng `RawAiItem` với `householdName?: string | null`, `groupNames?: string[]`.
- `buildRequestBody` truyền ctx vào system prompt.
- Coerce + trim cho 2 field mới trong `mapped` return.

### Step 3 — Handler + schema validation
- `contracts/expense-parse-schemas.ts`: thêm `householdId: z.string().nullable().optional()` và `groupIds: z.array(z.string()).optional()` vào `parsedExpenseItemSchema` (sau khi map) hoặc tạo `suggestedHouseholdId`/`suggestedGroupIds` — chọn tên additive không break.
- `handlers/expenses/parse-expense.ts`: sau khi validate `body`, fetch households/groups của `currentUser.id` (parallel), build `name -> id` map (lowercase, trim, normalize NFD nếu cần), gọi `parseExpensesWithAi` với ctx, sau đó normalize từng `rawItem` -> `candidate` với `householdId = map[householdName]` và `groupIds = groupNames.map(map).filter(Boolean)`, drop invalid, rồi `safeParse`.
- Log chỉ `householdCount/groupCount/suggestedCount`, không log tên.

### Step 4 — Tests & verification
- Thêm unit test cho `buildSystemPrompt` có/không ctx, và `coerce` cho household/group.
- Thêm integration test cho `parseExpenseHandler` mock `parseExpensesWithAi` trả về tên hợp lệ/không hợp lệ/không nhắc.
- Chạy `pnpm --filter worker lint`, `typecheck`, `test`, `./init.sh`, `git diff --check`.

### Risks
- Whitelist dài làm prompt vượt token — mitigate bằng cap 15+15 và chỉ tên, không description.
- AI vẫn hallucinate tên ngoài list — mitigate bằng server-side whitelist drop.

### Rollback
- Revert 3 file thay đổi, response field additive nên client cũ vẫn tương thích (ignore extra fields).

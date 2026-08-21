# feat-134 - Unblock push: split long files to satisfy check_ts_length

## Goal

Giảm độ dài 8 file vượt ngưỡng `check_ts_length.sh` để push `feat/128` không bị pre-push hook chặn (DEFAULT 300, COMPONENT 300).

## Confirmed scope

- Worker DEFAULT (>300): `apps/worker/src/lib/ai/expense-parser.ts` (404), `apps/worker/src/bot/commands/natural-expense.ts` (375), `apps/worker/src/bot/commands/ai-expense-shared.ts` (348)
  - Tách theo responsibility, không đổi behavior: prompt builder / parser client / sanitizer riêng, bot draft helpers riêng
- TMA COMPONENT (>300): `apps/tma/src/features/budgets/pages/budget-detail-page.tsx` (401), `budget-list-page.tsx` (361), `apps/tma/src/features/expenses/pages/add-expense-context-page.tsx` (324), `apps/tma/src/features/groups/pages/group-detail-page.tsx` (348), `group-list-page.tsx` (338)
  - Tách thành components con / hooks, page giữ orchestration

## Non-goals

- Không đổi logic AI, không đổi DB, không đổi API
- Không refactor các file khác vượt ngưỡng TEST/REPOSITORY

## Acceptance

- [x] `bash scripts/check_ts_length.sh` → `✅ All good` (0 errors)
- [x] `pnpm --filter worker typecheck`, `pnpm --filter tma typecheck`, `pnpm --filter worker test`, `pnpm --filter tma test`, `git diff --check` pass
- [x] `git push origin feat/128` succeeds (pre-push hook pass)
- [x] PR description cập nhật với feat-130/132/133 + feat-134

## Handoff

- State: done
- Plan: inline — see below
- Evidence: Worker: `expense-parser.ts` 404→12 (barrel) + 3 new modules <274, `natural-expense.ts` 375→240 + helpers 203, `ai-expense-shared.ts` 348→79 + `ai-draft.ts` 261 + `ai-dedupe.ts` 15. TMA: 5 pages 324-401→87-143 + 10 new components/hooks 17-153 (<300). `check_ts_length.sh` 8→0 errors, `typecheck` worker+tma pass, `test` worker 665 + tma 158 pass.
- Blockers: none
- Next: none — ready for push.

## Inline plan

### Step 1 — Worker
- `expense-parser.ts`: tách `buildSystemPrompt`+sanitizer, `coerceAmount`, `parseExpensesWithAi` client vào `lib/ai/expense-parser/` submodules, barrel re-export
- `natural-expense.ts` + `ai-expense-shared.ts`: tách `buildDraftFromItem`/`computeDedupeKey`/preview helpers thành `bot/commands/ai-draft.ts` riêng

### Step 2 — TMA
- Mỗi page >300 tách 1-2 components con vào `features/*/components/` tương ứng (giữ page <300, component <200)

### Step 3 — Verify & push
- `check_ts_length.sh`, `typecheck`, `test`, `diff --check` pass → `git push` → `gh pr edit` body

### Risks
- Tách sai import → typecheck fail — mitigate bằng `typecheck` sau mỗi split

### Rollback
- `git revert` từng split commit, push lại sẽ lại chặn nên cần fix trước khi push

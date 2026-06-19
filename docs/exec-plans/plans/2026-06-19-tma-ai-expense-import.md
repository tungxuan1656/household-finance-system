# TMA AI Expense Import

## Purpose / Big Picture

Let TMA users paste or type free-form Vietnamese expense text, ask the Worker to parse it with an OpenAI-compatible chat API, preview all valid expenses, choose personal/household/group context per item, and create the selected items through the existing expense-create endpoint. The parse endpoint never writes D1; it only returns validated preview data. The existing `POST /api/v1/expenses` path remains the only write path.

## Scope

- Worker:
  - Add AI parse contracts under `apps/worker/src/contracts/*`.
  - Add OpenAI-compatible client/parser under `apps/worker/src/lib/ai/*`.
  - Add protected parse handler and route registration for `POST /api/v1/expenses/parse`.
  - Add focused Worker tests for valid multi-expense parse, default source/date, invalid-item filtering, auth, and no-write behavior.
- TMA:
  - Add parse API hook and short-lived import draft state under `apps/tma/src/features/expenses/*`.
  - Add a text entry route and an import preview route under `apps/tma/src/routes/*`, wired into the router/route constants.
  - Preview each parsed item with category, title, money, source, date, include checkbox, and per-item personal/household/group selectors.
  - Confirm selected items sequentially through existing `createExpense` mutation. Successful items stay created if later items fail; failed items show inline errors. No rollback.
- Harness/docs:
  - Track as `feat-109` in harness and plan index.

Out of scope:
- Web UI.
- Direct AI writes to D1.
- Editing parsed category/title/money/source/date inside preview. Users go back and re-enter text.
- Household or group auto-detection by AI.
- Multi-provider UI or persisted provider config.
- Raw prompt logging, parse-history storage, caching, or feedback loops.

## Non-negotiable Requirements

- The parse endpoint is authenticated and treats all AI output as untrusted.
- The Worker reads OpenAI-compatible config only from environment variables: `OPENAI_COMPAT_BASE_URL`, `OPENAI_COMPAT_API_KEY`, `OPENAI_COMPAT_MODEL`.
- The parse endpoint accepts text and a client-provided local default date. The client supplies “today” in TMA-local date form.
- The parse endpoint returns an array of valid expenses only. Invalid AI items are dropped.
- Default `sourceKey` is `bank-transfer`; default `occurredAt` is the client date.
- Parsed categories must be valid `expense` category keys from the existing reference catalog.
- No raw user text is logged.
- Confirm uses existing `POST /api/v1/expenses` validation/permissions. Household and group ownership remain enforced there.
- TMA state is short-lived. Do not persist parsed items or raw text.

## Progress

- [x] 2026-06-19: Clarified MVP decisions with user.
- [x] 2026-06-19: Created ExecPlan and harness feature shell.
- [ ] Add failing Worker/TMA tests.
- [ ] Implement Worker parse contracts, OpenAI-compatible parser, handler, and route.
- [ ] Implement TMA text input and preview import flow.
- [ ] Run review gates and final verification.
- [ ] Record harness evidence and close plan.

## Surprises & Discoveries

- Existing `POST /api/v1/expenses` already has the correct permission and group validation boundary, so AI import should reuse it instead of adding a batch write path.

## Decision Log

- Decision: Use a two-endpoint split: `POST /api/v1/expenses/parse` for AI parsing, existing `POST /api/v1/expenses` for writes.
  Rationale: Keeps AI output outside the write trust boundary and preserves existing create validation, permissions, and group rules.
  Date/Author: 2026-06-19 / orchestrator + user.
- Decision: Return only valid parsed expense items; drop invalid AI items.
  Rationale: The preview screen should be actionable and avoid asking users to repair AI data manually in MVP.
  Date/Author: 2026-06-19 / user.
- Decision: Preview supports include/exclude and context selection per item, but no direct editing of parsed fields.
  Rationale: Keeps MVP simple; users can go back and re-enter text for corrections.
  Date/Author: 2026-06-19 / user.
- Decision: Confirm creates selected items sequentially; partial success is allowed and not rolled back.
  Rationale: Existing single-create endpoint is the source of truth; rollback would require new write semantics and failure complexity.
  Date/Author: 2026-06-19 / user accepted.
- Decision: Use TMA client local date for “today”.
  Rationale: Avoid Worker UTC date drift for Vietnamese users and Telegram clients.
  Date/Author: 2026-06-19 / user accepted.

## Outcomes & Retrospective

- Pending implementation.

## Context and Orientation

- Worker route entry: `apps/worker/src/routes/expenses.ts` currently registers expense endpoints under `/api/v1/expenses`.
- Worker create handler: `apps/worker/src/handlers/expenses/create-expense.ts` validates `CreateExpenseRequest`, enforces household membership and group ownership, and writes D1.
- Worker expense contract: `apps/worker/src/contracts/expense-schemas.ts` requires `amount`, `categoryKey`, `sourceKey`, `title`, `occurredAt`, and optional `householdId`/`groupIds`.
- Reference data: `apps/worker/src/contracts/reference-data.ts` and `apps/worker/src/lib/reference-data/catalog.ts` define valid category/source keys.
- TMA add-expense wizard: `apps/tma/src/routes/add-expense-category.tsx`, `apps/tma/src/routes/add-expense-details.tsx`, `apps/tma/src/routes/add-expense-context.tsx`.
- TMA expense API: `apps/tma/src/features/expenses/api.ts` has `createExpense` and `useCreateExpenseMutation`.
- TMA router: `apps/tma/src/app/router/app-router.tsx` and route constants under `apps/tma/src/app/router/*` / `apps/tma/src/routes/*` wire screens.

## Plan of Work (Narrative)

1. Write red tests first.
   - Worker tests should mock or inject the AI fetch call and prove `POST /api/v1/expenses/parse` returns valid multi-expense previews, defaults missing `sourceKey`/`occurredAt`, filters invalid category/source/amount items, requires auth, and does not write expenses.
   - TMA tests should cover import store behavior, parse API payload shape, sequential confirm partial success behavior, and reset/back behavior where practical.
2. Implement Worker parser.
   - Add strict Zod schemas for parse request, raw AI item, normalized parsed item, and parse response.
   - Add an OpenAI-compatible chat completions client using env config and `fetch`, with timeout and concise JSON-only prompt.
   - Normalize AI response by parsing JSON, applying defaults, validating category/source, enforcing `expense` category kind, and returning only valid items.
   - Add a protected handler and route at `/expenses/parse` before parameterized expense routes if route order matters.
3. Implement TMA import flow.
   - Add API function/hook for `POST /expenses/parse`.
   - Add short-lived Zustand store for raw text, parsed items, include flags, per-item household/group context, item status, and reset.
   - Add text entry route with a textarea and parse action.
   - Add preview route with item cards, include checkbox, context selectors populated from existing household/group queries, and a confirm action that sequentially calls existing `createExpense`.
   - Wire Home or existing add-expense entry to expose the AI import route without disrupting the manual wizard.
4. Review and verify.
   - Run targeted tests while iterating.
   - Run `./init.sh typecheck`, `./init.sh test`, and final full `./init.sh` if scope/time permits.
   - Run code review for TypeScript/Worker security concerns and UI/UX review for the TMA preview.
   - Update harness evidence and plan status.

## Concrete Steps (Commands)

Run from repo root unless noted:

```bash
# targeted worker tests while developing
pnpm --filter worker test -- expenses

# targeted TMA tests while developing
pnpm --filter tma test

# final repo verification path
./init.sh typecheck
./init.sh test
./init.sh
```

Expected final evidence:

```text
./init.sh typecheck -> Done!/OK, exit 0
./init.sh test -> Done!/OK, exit 0
./init.sh -> Done!, exit 0
```

## Validation and Acceptance

- Worker:
  - Authenticated `POST /api/v1/expenses/parse` with text containing multiple expenses returns `expenses` with multiple valid items.
  - Missing source defaults to `bank-transfer`.
  - Missing date defaults to the client-provided local date.
  - Invalid AI items are omitted.
  - The endpoint does not create D1 expense rows.
  - Missing/invalid auth returns the existing protected-endpoint error.
- TMA:
  - User can open AI import, enter text, parse, and see preview cards.
  - Each preview card shows category, title, money, source, and date.
  - Each item can be included/excluded.
  - Each item can choose personal/household/group context.
  - Confirm creates selected items sequentially through existing create mutation.
  - If one item fails, already-created items remain successful and the failed item shows an error.
  - Back from preview returns to text input for re-entry; no inline parsed-field editing exists.

## Idempotence & Recovery

- Parse is read-only and safe to retry; repeated parse calls may incur AI cost but do not write D1.
- Confirm is not idempotent; pressing confirm twice may create duplicate expenses unless UI disables already-successful items. The implementation must mark successful items and avoid re-submitting them on retry.
- No D1 migration is planned.
- Provider config is deploy-time env only; missing config should return a clear server error and not crash the Worker.

## Artifacts and Notes

- Feature harness: `harness/features/feat-109.json`.
- No commit unless explicitly requested by user.

## Interfaces & Dependencies

Worker parse request:

```ts
type ParseExpensesRequest = {
  text: string
  defaultOccurredAt: string // YYYY-MM-DD from TMA local date
}
```

Worker parse response:

```ts
type ParseExpensesResponse = {
  expenses: Array<{
    amount: number
    categoryKey: string
    sourceKey: string // defaults to bank-transfer
    title: string
    occurredAt: string // YYYY-MM-DD
  }>
  message?: string
}
```

OpenAI-compatible dependency:

- Endpoint: `${OPENAI_COMPAT_BASE_URL}/chat/completions` or compatible equivalent after trimming trailing slash.
- Auth: `Authorization: Bearer ${OPENAI_COMPAT_API_KEY}`.
- Model: `OPENAI_COMPAT_MODEL`.
- Response mode: JSON-only content. The Worker must still parse defensively because model output is untrusted.

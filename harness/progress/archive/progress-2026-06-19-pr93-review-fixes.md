# Session: 2026-06-19 — PR #93 review fixes (N2–N7)

## Scope

Apply requested non-blocking fixes from PR #93 code review (oracle session).
B1 (missing `/chat/completions` path), N1 (rate limit), N8 (group picker scope)
left untouched — user did not include them.

## Done

- Worker:
  - `apps/worker/src/lib/ai/expense-parser.ts`: introduce `AiUpstreamError` thrown
    on non-2xx / network / abort (parse-empty still returns `[]`). New
    `coerceAmount` helper accepts numeric strings, rejects NaN / non-finite /
    non-positive (returns `undefined`, schema then drops the item).
  - `apps/worker/src/lib/errors.ts`: add `BAD_GATEWAY` code + `badGateway()`
    factory returning a 502 `AppError`.
  - `apps/worker/src/lib/i18n/messages.vi.ts`: add `errors.aiUpstreamFailure`
    Vietnamese message.
  - `apps/worker/src/contracts/expense-parse-schemas.ts`: add
    `MAX_PARSE_TEXT_LENGTH = 4000` and `.max()` constraint on `text`; extend
    `parseExpensesResponseSchema` with optional `droppedCount`; derive
    `ParseExpensesResponse` from `z.output` instead of hand-written interface.
  - `apps/worker/src/handlers/expenses/parse-expense.ts`: catch
    `AiUpstreamError` -> `badGateway(...)`; count schema-rejected items into
    `droppedCount` (omitted when zero); validate response shape with
    `parseExpensesResponseSchema.parse()`.
  - New unit tests `apps/worker/test/unit/expense-parser.spec.ts` (14 cases:
    upstream-error paths, parse-empty paths, amount coercion).
  - Extended `apps/worker/test/integration/expenses-parse.spec.ts` (502
    BAD_GATEWAY on upstream failure, 200 on parse-empty, 400 over 4000 chars,
    200 at exactly 4000 chars, droppedCount assertions, numeric-amount
    normalisation).
- TMA:
  - `apps/tma/src/features/expenses/import-api.ts`: export
    `MAX_PARSE_TEXT_LENGTH = 4000`; add `droppedCount?: number` to
    `ParseExpensesResponse`.
  - `apps/tma/src/routes/add-expense-chat.tsx`: pass `maxLength` to the
    Textarea.
  - `apps/tma/src/features/expenses/import-confirm.ts`: introduce
    `toUtcDateOnly(YYYY-MM-DD)` using `Date.UTC(year, month-1, day)` so
    browser-tz drift no longer shifts the day.
  - `apps/tma/src/test/expense-import-confirm.test.ts`: assert UTC-midnight
    timestamp directly.

## Verification

- `./init.sh` -> Done! (install + harness + lint + typecheck + test all green)
- Worker test run: 452 passed (83 files), including 14 new unit + 10 parse
  integration tests.
- TMA test run: 104 passed (21 files), including 7 import-confirm tests.
- Typecheck clean for both packages.

## Decision log

- N2: distinguish upstream failure from parse-empty by throwing a typed error
  and surfacing 502 BAD_GATEWAY. Raw upstream body and user text never leak.
- N4: surface dropped count via optional `droppedCount` field. Reasons
  intentionally omitted (avoid leaking prompt/data shape to client).
- N5: kept `parseExpensesResponseSchema` and used it as the output gate;
  removed hand-written interface in favour of `z.output`.
- N6: UTC-midnight construction chosen over local-time parsing; VN (+07:00)
  behaviour preserved while removing browser-tz fragility.
- N7: coerce string amounts, but non-positive / non-finite become
  `undefined` so the schema's `z.number().positive()` does the explicit
  rejection.

## Out of scope / deferred

- B1 missing `/chat/completions` URL suffix — user stated this is their
  intent; left as-is.
- N1 per-user rate limit on `/expenses/parse` — not requested.
- N8 group picker scope by selected household — not requested.

## Commit

Pending user confirmation at end of session.

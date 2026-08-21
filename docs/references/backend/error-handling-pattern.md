# Error Handling Pattern

## Principles

- Use explicit error codes and meaningful messages.
- Never swallow exceptions silently.
- Never return `200` for failed operations.

## Baseline Status Mapping

- `400` bad input
- `401` unauthenticated/invalid token
- `403` authenticated but forbidden
- `404` resource not found
- `409` conflict
- `429` rate limited
- `500` unexpected internal failure

## Logging Rules

- Log enough context for debugging.
- Do not log tokens, secrets, or sensitive personal content.
- Use `lib/logger.ts` for all logging; it emits JSON-line output.
- Sanitize fields and truncate long strings; `apiKey` is always `[REDACTED]`.
- Never log raw user text; log `textChars` / `promptChars` counts instead.
- Propagate `requestId` / `correlationId` as first arg to `logger.info|warn|error`.
- Redact upstream host via `getBaseUrlHost`; never log full URLs.
- Include `durationMs`, `status`, and truncated `errorMessage` (max 500).
- Use `middlewares/request-logger.ts` with try/finally to log duration and echo `x-request-id`.
- See also `lib/logger.ts` and `middlewares/request-logger.ts` as canonical.

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

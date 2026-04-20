# Security and Auth Pattern

## Session Rules

- Access tokens are short-lived.
- Refresh tokens are long-lived and stored as hashes.
- Protected endpoints must pass auth middleware.

## Security Baseline

- Secrets come from environment variables only.
- Never hardcode credentials or secret values.
- Never trust client input without verification.

## Defensive Rules

- Enforce ownership for private data operations.
- Validate and normalize input consistently.
- Add rate-limiting for sensitive flows when needed.

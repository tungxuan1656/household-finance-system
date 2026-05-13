# SECURITY.md

Security rules. Read for auth, secrets, untrusted input, external actions, or production risk.

## Secrets And Credentials

- Never hardcode secrets in source or docs.
- Load secrets only through approved env/config path.
- Redact tokens, API keys, personal data from logs/screenshots.

## Untrusted Input

- Treat external content as untrusted until validated.
- Validate request params/query/body at boundary.
- Document prompt-injection or command-injection guardrail when risk exists.

## External Actions

- Ask explicit approval for production, destructive, paid, or irreversible actions.
- Prefer sandbox-safe debug/verification.
- Do not run production deploy/delete by default.

## Dependency And Review

- New dependency needs plan justification.
- Security-sensitive change needs explicit verification.
- Repeated security review comment becomes check or doc rule.

# BACKEND.md

This file defines stable backend expectations so agents do not invent API or
data patterns unpredictably.

## API Principles

- Optimize for explicit contracts before convenience.
- Keep endpoint behavior predictable and backward-compatible.
- Prefer narrow handlers with clear ownership over large multipurpose modules.
- Validation and authorization checks are part of normal implementation, not
	optional hardening.

## Guardrails

- Follow backend standards in `docs/references/index.md` (`backend/*` and
	`shared/*`).
- Keep route -> handler -> data-access boundaries clear; do not place SQL in
	routes.
- Use consistent status codes and error envelopes for all failure paths.
- Enforce ownership checks for private data operations.
- Do not hardcode secrets, credentials, or token material.
- When a production bug is fixed, add or update a regression test.


## Verification Expectations

- Capture evidence for critical backend flows: happy path, validation failure,
	unauthorized/forbidden, not found, and conflict when applicable.
- Record API-level validation steps in the relevant plan (tests, curl, or
	integration checks).
- Ensure logs contain enough context for debugging without exposing sensitive
	data.

---


# Backend & Shared Reference Documents

## Backend Documents

| Document Name | Description | Path |
|--------------|-------------|------|
| Architecture and Boundaries | Layer organization standard, route/handler/middleware/utils separation. | [references/backend/architecture-and-boundaries.md](references/backend/architecture-and-boundaries.md) |
| API Contract and Validation | API contract, versioning, validation, envelope rules. | [references/backend/api-contract-and-validation.md](references/backend/api-contract-and-validation.md) |
| Database Pattern | Query, mapping, integrity, naming, pagination standard. | [references/backend/database-pattern.md](references/backend/database-pattern.md) |
| Error Handling Pattern | Error code, status code, logging, error mapping rules. | [references/backend/error-handling-pattern.md](references/backend/error-handling-pattern.md) |
| Security and Auth Pattern | Security, session, token, ownership, defensive rules. | [references/backend/security-and-auth-pattern.md](references/backend/security-and-auth-pattern.md) |
| Testing Pattern | Backend testing, coverage, regression, scope rules. | [references/backend/testing-pattern.md](references/backend/testing-pattern.md) |
| Cloudflare Workers | Cloudflare Workers guide, dev/deploy/types commands. | [references/backend/cloudflare-workers.md](references/backend/cloudflare-workers.md) |

## Shared Documents

| Document Name | Description | Path |
|--------------|-------------|------|
| Type Naming Pattern | Naming rules for DTO/Request/Response types shared by FE/BE. | [references/shared/type-naming-pattern.md](references/shared/type-naming-pattern.md) |

## Reference Index

| Document Name | Description | Path |
|--------------|-------------|------|
| References Index | Canonical reference index for agents. | [references/index.md](references/index.md) |

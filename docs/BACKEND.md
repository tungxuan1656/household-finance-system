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

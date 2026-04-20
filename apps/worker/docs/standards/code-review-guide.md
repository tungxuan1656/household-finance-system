# Backend Code Review Guide

## Review Priorities

1. Correctness and domain behavior
2. Security and auth/session safety
3. API contract consistency
4. Data integrity and ownership safety
5. Test coverage for risky changes
6. Maintainability and readability

## Mandatory Checklist

- [ ] Status codes are correct for all outcomes.
- [ ] No accidental API contract break.
- [ ] Queries bind parameters and enforce ownership.
- [ ] No sensitive data leakage in logs.
- [ ] No swallowed errors.
- [ ] Tests added for new logic/bugfix.
- [ ] Related docs updated.

## Finding Severity

- Critical: security/data leak/auth or data-loss risk
- Major: business logic or contract correctness risk
- Minor: maintainability/readability improvement

## Review Comment Standard

Each finding should include:

- precise location (`file:line`)
- current behavior and risk
- practical fix direction

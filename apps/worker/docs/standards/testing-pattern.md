# Testing Pattern

## Goal

Protect core business behavior and prevent regressions.

## Priority Scope

- complex business handlers
- auth/session flows
- critical data writes
- previously fixed bugs (regression tests)

## Minimum Endpoint Coverage

- happy path
- validation failure
- unauthorized/forbidden
- not found
- conflict (when applicable)

## Principles

- test behavior, not implementation details
- use meaningful test data
- every bugfix should include a regression test

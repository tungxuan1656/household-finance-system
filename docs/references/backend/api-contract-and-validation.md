# API Contract and Validation

## Required Contract Rules

- Base path: `/api/v1`
- JSON-only API
- Consistent success/error response envelope
- API fields use `camelCase`

## Validation Rules

- Validate `params`, `query`, and `body` explicitly.
- Validation failures must return correct 4xx status.
- Do not silently coerce values when meaning can change.

## Versioning and Compatibility

- Do not change existing field meaning in-place.
- Introduce new endpoint/version for breaking changes.
- Mark deprecations and provide transition notes.

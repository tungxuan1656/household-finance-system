# Architecture and Boundaries

## Goal

Keep backend code maintainable and prevent layer mixing.

## Structure

- `src/routes/*`: route definitions and middleware composition
- `src/handlers/*`: business orchestration per use case
- `src/middlewares/*`: auth/guard/request checks
- `src/utils/*`: reusable pure helpers

## Boundary Rules

- Routes must not contain SQL.
- Handlers must not break response contracts.
- Utils must not depend on Hono context.
- Avoid “god helpers” that hide multiple responsibilities.

## Quick Checklist

- [ ] New endpoint lives in the proper route module.
- [ ] Business logic is in handlers.
- [ ] No duplicated business logic across handlers.
- [ ] Split files when complexity grows too high.

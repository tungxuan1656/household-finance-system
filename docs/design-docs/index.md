# Design Docs Index

Durable design decision map. Read only when task changes lasting UI/product/architecture direction.

## Current Project Direction

- No custom visual design system.
- Web UI uses shadcn primitives and project-owned component references.
- Product UI decisions live here only when they outlast one feature plan.

## Accepted

- `core-beliefs.md`: agent-first operating beliefs.
- `shadcn-card-composition-architecture-guide.md`: shadcn card composition and primitive-first UI guidance.
- `backend-api-scenario-testing-design.md`: backend API scenario testing design.

## Proposed

- `2026-05-15-add-expense-dialog-domain-and-ui-design.md`: canonical add-expense dialog, dialog-only VND amount input semantics, nested category-picker fix, independent group vs household domain model, and add-expense page removal.

## Deprecated

- Removed custom design-system/V2/glassmorphism docs.
- Removed stale shadcn-first guide path. Use accepted shadcn card composition guide plus frontend references.

## Maintenance Rules

- Every design doc needs owner/update trigger.
- Remove stale docs or mark deprecated.
- Link active plans to exact design docs they depend on.
- Do not duplicate frontend/backend reference rules here.

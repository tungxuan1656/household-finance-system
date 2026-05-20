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

- `2026-05-20-web-shim-cleanup-and-ownership-normalization-design.md`: remove leftover frontend compatibility shims after feat-062, normalize canonical feature ownership, and eliminate duplicate old import paths.
- `2026-05-19-web-feature-first-folder-architecture-design.md`: move `apps/web` to feature-first ownership, keep App Router thin, remove `views/`, and standardize feature naming/placement rules.
- `2026-05-15-add-expense-dialog-domain-and-ui-design.md`: canonical add-expense dialog, dialog-only VND amount input semantics, nested category-picker fix, independent group vs household domain model, and add-expense page removal.
- `2026-05-19-expense-entry-form-unification-design.md`: shared create/edit expense entry form, code-only UI normalization, and symmetric VND edit/create amount semantics.

## Deprecated

- Removed custom design-system/V2/glassmorphism docs.
- Removed stale shadcn-first guide path. Use accepted shadcn card composition guide plus frontend references.

## Maintenance Rules

- Every design doc needs owner/update trigger.
- Remove stale docs or mark deprecated.
- Link active plans to exact design docs they depend on.
- Do not duplicate frontend/backend reference rules here.

# FRONTEND.md

Stable frontend expectations so agents do not invent UI patterns unpredictably.

## UI Principles

- Optimize for clarity before novelty.
- Keep interaction flows discoverable and restartable.
- Prefer small number of reusable components over one-off variants.
- Accessibility checks are part of normal verification, not polish work.

## Guardrails

- Document design system or component library in `docs/references/index.md` (`frontend/*` and `shared/*`).
- Record key user-facing states: empty, loading, success, error, retry.
- Keep copy, keyboard behavior, and visual hierarchy consistent across flows.
- When a UI bug is fixed, add or update matching validation step.

## Mandatory Component Decomposition Policy (Frontend)

- Build pages with **orchestrator-first** pattern from the start:
  - Page-level file owns route params, store/query wiring, and high-level flow only.
  - Feature-level **smart components** own bounded UI + local feature logic (form submit, dialog state, mutation handlers) for one concern.
  - Reusable **shared components** are promoted only when the same shape is used across multiple features.
- Prefer early split over late refactor:
  - If a page/component is trending beyond ~200 lines or mixes 3+ concerns (data wiring, form, dialog, table, danger zone), split immediately.
  - Do not wait until the component becomes hard to review.
- Shared extraction rule:
  - Put cross-feature reusable UI/controller components in `src/components/shared/*`.
  - Keep feature-only components in `src/components/<feature>/*`.
  - Do not move feature-specific business logic into shared components.
- Smart vs dumb boundary:
  - **Smart component**: feature-scoped state + API/mutation handlers + composed UI.
  - **Dumb component**: presentational-only, controlled by props, no feature API calls.
- Keep decomposition pragmatic:
  - Avoid over-generic abstractions.
  - Extract only the prop contracts that are actually reused.
  - Re-check naming/export conventions in `docs/references/frontend/component-structure-pattern.md` and `docs/references/frontend/naming-and-conventions-pattern.md`.

## Mandatory Pre-Read for UI Work

- UI work in `apps/web` must follow `docs/design-docs/shadcn-first-ui-web-guide.md`.
- Before any UI task (design/implement/review), contributors must read:
  - `.agents/skills/shadcn/SKILL.md`
  - `.agents/skills/shadcn/rules/styling.md`
  - `.agents/skills/shadcn/rules/forms.md`
  - `.agents/skills/shadcn/rules/composition.md`
- Skipping this pre-read is non-compliant.

## Mandatory Shadcn Governance

- Base UI primitives must be imported from `@/components/ui/*` and used directly.
- Do not create wrapper replacements for base primitives (`Button`, `Input`, `Card`, `Dialog`, etc.).
- Shared feature components are allowed, but they must compose shadcn primitives internally.
- Prefer `variant`/`size` contracts and semantic tokens over ad-hoc visual utility classes.
- `className` on primitives is for layout-level concerns only, not for restyling primitive internals.
- Non-compliant UI must be revised before merge.

## Verification Expectations

- Capture evidence for critical user journeys.
- Record browser or runtime validation steps in relevant plan.
- If visual regressions are common, standardize screenshot or DOM checks.

---

# Frontend & Shared Reference Documents

## Frontend Documents

| Document Name | Description | Path |
|--------------|-------------|------|
| Form Pattern | Standard for writing forms with shadcn, react-hook-form, zod. | [references/frontend/form-pattern.md](references/frontend/form-pattern.md) |
| API + React Query Pattern | API, hook, mock, cache, React Query organization standard. | [references/frontend/api-react-query-pattern.md](references/frontend/api-react-query-pattern.md) |
| Component Structure Pattern | Rules for distinguishing page/child components, export, template. | [references/frontend/component-structure-pattern.md](references/frontend/component-structure-pattern.md) |
| Project Folder Structure | Standard folder structure for large projects. | [references/frontend/project-folder-structure.md](references/frontend/project-folder-structure.md) |
| I18n Label Pattern | i18n rules, text/label management, key naming. | [references/frontend/i18n-label-pattern.md](references/frontend/i18n-label-pattern.md) |
| Dialog & Form Field Pattern | Dialog, field, ref pattern, layout organization. | [references/frontend/dialog-and-form-pattern.md](references/frontend/dialog-and-form-pattern.md) |
| Naming & Conventions Pattern | File, export, import, constant, query key naming rules. | [references/frontend/naming-and-conventions-pattern.md](references/frontend/naming-and-conventions-pattern.md) |
| Zustand Store Pattern | Zustand store template, persist, devtools, selector. | [references/frontend/zustand-store-pattern.md](references/frontend/zustand-store-pattern.md) |

## Shared Documents

| Document Name | Description | Path |
|--------------|-------------|------|
| Type Naming Pattern | Naming rules for DTO/Request/Response types shared by FE/BE. | [references/shared/type-naming-pattern.md](references/shared/type-naming-pattern.md) |

## Reference Index

| Document Name | Description | Path |
|--------------|-------------|------|
| References Index | Canonical reference index for agents. | [references/index.md](references/index.md) |
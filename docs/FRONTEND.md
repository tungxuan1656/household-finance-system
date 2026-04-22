# FRONTEND.md

This file defines stable frontend expectations so agents do not invent UI
patterns unpredictably.

## UI Principles

- Optimize for clarity before novelty.
- Keep interaction flows discoverable and restartable.
- Prefer a small number of reusable components over one-off variants.
- Accessibility checks are part of normal verification, not polish work.

## Guardrails

- Document the design system or component library in `docs/references/index.md` (`frontend/*` and
	`shared/*`).
- Record key user-facing states: empty, loading, success, error, retry.
- Keep copy, keyboard behavior, and visual hierarchy consistent across flows.
- When a UI bug is fixed, add or update the matching validation step.


## Verification Expectations

- Capture evidence for critical user journeys.
- Record browser or runtime validation steps in the relevant plan.
- If visual regressions are common, standardize screenshot or DOM checks.

---

# Frontend & Shared Reference Documents

## Frontend Documents

| Tên tài liệu | Mô tả | Đường dẫn |
|-------------|-------|-----------|
| Form Pattern | Chuẩn viết form với shadcn, react-hook-form, zod. | [references/frontend/form-pattern.md](references/frontend/form-pattern.md) |
| API + React Query Pattern | Chuẩn tổ chức API, hook, mock, cache, React Query. | [references/frontend/api-react-query-pattern.md](references/frontend/api-react-query-pattern.md) |
| Component Structure Pattern | Quy tắc phân biệt page/child component, export, template. | [references/frontend/component-structure-pattern.md](references/frontend/component-structure-pattern.md) |
| Project Folder Structure | Cấu trúc thư mục chuẩn cho dự án lớn. | [references/frontend/project-folder-structure.md](references/frontend/project-folder-structure.md) |
| I18n Label Pattern | Quy tắc i18n, quản lý text/label, key đặt tên. | [references/frontend/i18n-label-pattern.md](references/frontend/i18n-label-pattern.md) |
| Dialog & Form Field Pattern | Chuẩn tổ chức dialog, field, ref pattern, layout. | [references/frontend/dialog-and-form-pattern.md](references/frontend/dialog-and-form-pattern.md) |
| Naming & Conventions Pattern | Quy tắc đặt tên file, export, import, constant, query key. | [references/frontend/naming-and-conventions-pattern.md](references/frontend/naming-and-conventions-pattern.md) |
| Zustand Store Pattern | Mẫu store Zustand, persist, devtools, selector. | [references/frontend/zustand-store-pattern.md](references/frontend/zustand-store-pattern.md) |

## Shared Documents

| Tên tài liệu | Mô tả | Đường dẫn |
|-------------|-------|-----------|
| Type Naming Pattern | Quy tắc đặt tên kiểu dữ liệu DTO/Request/Response dùng chung FE/BE. | [references/shared/type-naming-pattern.md](references/shared/type-naming-pattern.md) |

## Reference Index

| Tên tài liệu | Mô tả | Đường dẫn |
|-------------|-------|-----------|
| References Index | Mục lục tài liệu chuẩn, canonical cho agent. | [references/index.md](references/index.md) |

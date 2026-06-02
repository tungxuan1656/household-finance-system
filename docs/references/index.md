# References Index

Canonical leaf standards map. Use this index to choose exact rule doc. Do not read every file by default.

## Priority

1. Shared cross-cutting rules.
2. Frontend/backend domain rules.
3. Templates/examples. Examples never override rules.

## Shared

| Need | Doc |
|------|-----|
| DTO / Request / Response names | `shared/type-naming-pattern.md` |

## Frontend

| Need | Doc |
|------|-----|
| Folder/file placement | `frontend/project-folder-structure.md` |
| Page/child split, exports | `frontend/component-structure-pattern.md` |
| Component layers and extraction | `frontend/frontend-component-architecture-guide.md` |
| Naming/imports/constants | `frontend/naming-and-conventions-pattern.md` |
| API client + React Query | `frontend/api-react-query-pattern.md` |
| Zustand store | `frontend/zustand-store-pattern.md` |
| Forms | `frontend/form-pattern.md` |
| Dialog + field layout | `frontend/dialog-and-form-pattern.md` |
| i18n labels/copy | `frontend/i18n-label-pattern.md` |
| Responsive shell/navigation | `frontend/responsive-navigation-shell-pattern.md` |
| Test placement/scope | `../testing/test-placement-and-sharding-convention.md` |

## TWA

| Need | Doc |
|------|-----|
| TWA app placement, routing, native bridge, storage, performance | `twa/app-structure-and-client-rules.md` |
| TWA auth, deep-link, and bot boundary | `twa/auth-and-bot-pattern.md` |

## Backend

| Need | Doc |
|------|-----|
| Folder/file placement | `backend/project-folder-structure.md` |
| Route/handler/repo boundaries | `backend/architecture-and-boundaries.md` |
| API contract + validation | `backend/api-contract-and-validation.md` |
| D1 queries + mapping | `backend/database-pattern.md` |
| Error envelope/status/logging | `backend/error-handling-pattern.md` |
| Security/auth/ownership | `backend/security-and-auth-pattern.md` |
| Backend tests | `backend/testing-pattern.md` |
| Workers/D1/Wrangler | `backend/cloudflare-workers.md` |

## Maintenance Rules

- One rule area = one canonical doc.
- Parent/index docs link. Leaf docs hold rules.
- Remove stale paths same session they are discovered.
- If two docs overlap, keep rule in leaf doc and make parent route only.

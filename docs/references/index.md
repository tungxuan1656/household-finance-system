# References Index

Canonical leaf standards map. Use this index to choose exact rule doc. Do not read every file by default.

## Shared

| Need | Doc |
|------|-----|
| DTO / Request / Response names | `shared/type-naming-pattern.md` |

## Architecture

| Need | Doc |
|------|-----|
| Mono-repo layout, shared packages, tooling, CI, convention drift | `architecture/mono-repo-issues.md` |

## Frontend

| Need | Doc |
|------|-----|
| Frontend surface router | `frontend/index.md` |
| Web implementation rules | `frontend/web/project-folder-structure.md` and neighboring web leaves |
| TMA implementation rules | `frontend/tma/app-structure-and-client-rules.md` and neighboring TMA leaves |
| Future mobile-app implementation rules | `frontend/mobile-app/index.md` |

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

## Operations

| Need | Doc |
|------|-----|
| Deploy worker + TMA flow | `../operations/index.md` |

## Rules

- One rule area = one canonical doc.
- Parent/index docs route. Leaf docs hold rules.
- Shared frontend implementation rules should be lifted explicitly only when more than one surface truly needs them.

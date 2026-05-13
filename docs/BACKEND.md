# BACKEND.md

Backend router. Read this for `apps/worker` work, then read only exact reference docs needed.

## Defaults

- Explicit contracts before convenience.
- Predictable, backward-compatible endpoint behavior.
- Narrow handlers. One use case per handler when practical.
- Validation + authorization are normal implementation, not hardening.
- No secrets in code/docs/logs.

## Flow

Default backend path:

`route -> middleware -> handler -> repository -> D1`

Rules:
- Routes declare endpoints and middleware. No SQL.
- Handlers orchestrate business flow. No ad hoc response shapes.
- Repositories own D1 queries and row mapping.
- Contracts own request/response schemas and transport DTOs.
- Utils stay pure and framework-light.

## Read Next By Task

| Task | Read |
|------|------|
| Folder/file placement | `docs/references/backend/project-folder-structure.md` |
| Route/handler/repo boundary | `docs/references/backend/architecture-and-boundaries.md` |
| API contract/validation | `docs/references/backend/api-contract-and-validation.md` |
| D1/query/data mapping | `docs/references/backend/database-pattern.md` |
| Error envelope/status/logging | `docs/references/backend/error-handling-pattern.md` |
| Auth/security/ownership | `docs/references/backend/security-and-auth-pattern.md` |
| Backend tests | `docs/references/backend/testing-pattern.md` |
| Workers/D1/Wrangler specifics | `docs/references/backend/cloudflare-workers.md` |
| Shared type names | `docs/references/shared/type-naming-pattern.md` |

## Verification

- Cover happy path, validation failure, unauthorized/forbidden, not found, conflict when relevant.
- Record API evidence in plan/harness.
- Logs must help debug without exposing secrets/personal data.
- Run `pnpm lint:fix` after edits.
- Prefer `./init.sh` before done.

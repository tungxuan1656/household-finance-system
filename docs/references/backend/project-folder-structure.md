# Backend Project Folder Structure

## 1) Standard Structure

```text
src/
  index.ts

  routes/
    feature*.ts
    ...

  handlers/
    feature*/
    ...

  middlewares/
    auth.ts
    request-context.ts
    ...

  db/
    repositories/
      feature*-repository.ts
      ...

  contracts/
    feature*.ts
    index.ts

  types/
    app.ts
    feature*.ts
    index.ts

  lib/
    auth/
    response.ts
    validation.ts
    env.ts
    ...

  utils/
    id.ts
    ...
```

> `feature*` (replace with the real domain name such as `auth`, `profile`, `expenses`, `households`).

## 2) Strict Boundaries by Folder

- `routes/`: declare HTTP endpoints, attach middleware, parse request inputs, and return response envelopes.
- `handlers/`: orchestrate one use case at a time; business flow lives here.
- `middlewares/`: reusable request guards and request-context setup.
- `db/repositories/`: D1 access only, including SQL, row mapping, and persistence helpers.
- `contracts/`: API-facing request/response schemas and transport contracts.
- `types/`: runtime-only internal types that are not API transport contracts.
- `lib/auth/`: auth/security infrastructure such as Firebase verification, JWT issuing/verification, token hashing.
- `lib/`: cross-cutting runtime helpers that do not fit a single feature folder.
- `utils/`: small pure helpers with no framework or request-context dependency.

## 3) Placement Rules

- Keep `route -> handler -> repository` as the default backend flow.
- Routes must not contain SQL.
- Handlers must not construct ad hoc response shapes outside the shared contract/envelope pattern.
- Repositories must not depend on Hono context.
- `contracts/` should hold `Request`, `Response`, and transport-facing `DTO` shapes only.
- `types/` should hold bindings, token payloads, and internal app/runtime types.
- Put provider-specific auth code in `lib/auth`, not in `utils`.
- Only promote code to `lib/` when it is shared across multiple features or is truly cross-cutting.

## 4) What Not To Do

- Do not use `dto/` as a mixed bucket for API contracts, app bindings, env config, and auth token payloads.
- Do not use `utils/` as a dumping ground for security-sensitive infrastructure.
- Do not put feature-specific SQL helpers in `lib/`.
- Do not collapse multiple domains into one large repository file when separate repositories would keep ownership clearer.
- Do not hide business orchestration inside route files.

## 5) Naming Guidance

- Route files: `routes/auth.ts`, `routes/profile.ts`
- Handler files: `handlers/auth/exchange-provider-token.ts`
- Repository files: `db/repositories/session-repository.ts`
- Contract files: `contracts/auth.ts`, `contracts/profile.ts`
- Type files: `types/app.ts`, `types/auth.ts`
- Auth infrastructure files: `lib/auth/firebase.ts`, `lib/auth/jwt.ts`

## 6) Import Rules

- Feature code should first look within its own route/handler/repository area.
- Import from `contracts` when the type is part of the HTTP contract.
- Import from `types` when the type is runtime-only/internal.
- Repositories may be used by handlers and middlewares, but not by routes for direct SQL execution.
- `utils` must stay dependency-light and framework-agnostic.

## 7) Backend Checklist

- [ ] `src/routes`, `src/handlers`, and `src/db/repositories` are clearly separated
- [ ] API request/response schemas live in `src/contracts`
- [ ] Runtime-only types live in `src/types`
- [ ] Auth/security infrastructure lives in `src/lib/auth`
- [ ] `src/lib` is not used as a feature-specific dumping ground
- [ ] `src/utils` only contains small pure helpers
- [ ] Imports use the repo alias consistently (`@/...`)
- [ ] New features extend the structure instead of inventing new mixed folders

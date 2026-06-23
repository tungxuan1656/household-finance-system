# Backend Project Folder Structure

## Canonical `src/` layout

```text
src/
  index.ts
  routes/
    feature*.ts
  handlers/
    feature*/
  middlewares/
    auth.ts
    request-context.ts
  db/
    repositories/
      feature*-repository.ts
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
  utils/
    id.ts
  bot/
    service.ts          # webhook entry, command dispatch, callback routing
    telegram-client.ts  # Telegram Bot API adapter
    webhook-security.ts
    account-linking.ts
    types.ts
    commands/           # one file per command: start, help, settings, stats, top, budget, ai-expense, confirm-expense, household-select, read-scope
    renderers/          # Vietnamese text + Telegram keyboard builders
    lib/                # pure helpers used by commands/renderers (e.g. amount detector, patterns)
    notifications/      # scheduled sends: budget alerts, household activity, weekly digest
```

`feature*` means the real domain name, such as `auth`, `profile`, `expenses`, or `households`.

## Folder rules

- `routes/`: HTTP endpoints, middleware wiring, input parsing, response envelopes.
- `handlers/`: one use case per file or folder; business flow lives here.
- `middlewares/`: reusable request guards and request-context setup.
- `db/repositories/`: D1 access only; SQL, row mapping, persistence helpers.
- `contracts/`: API request/response schemas and transport contracts.
- `types/`: runtime-only internal types, not HTTP transport contracts.
- `lib/auth/`: auth/security infrastructure, including Firebase verification, JWT issue/verify, token hashing.
- `lib/`: cross-cutting runtime helpers shared by multiple features.
- `utils/`: small pure helpers with no framework or request-context dependency.
- `bot/`: Telegram bot companion surface. `service.ts` is the only webhook entry; `telegram-client.ts` is the only module allowed to call Telegram Bot API. `commands/` and `renderers/` only consume contracts and shared services — they never talk to Telegram directly and never write to D1 directly. Pure helpers under `bot/lib/` may not depend on Hono context or fetch globals.

## Placement rules

- Default flow is `route -> handler -> repository`.
- Routes do not hold SQL.
- Handlers do not build ad hoc response shapes outside the shared contract/envelope pattern.
- Repositories do not depend on Hono context.
- `contracts/` holds `Request`, `Response`, and transport-facing `DTO` shapes only.
- `types/` holds bindings, token payloads, and internal app/runtime types.
- Provider-specific auth code goes in `lib/auth`, not `utils`.
- Move code into `lib/` only when it is shared across features or truly cross-cutting.

## Do not

- Do not use `dto/` as a mixed bucket for API contracts, app bindings, env config, and auth token payloads.
- Do not use `utils/` for security-sensitive infrastructure.
- Do not put feature-specific SQL helpers in `lib/`.
- Do not collapse separate domains into one large repository file when separate repositories keep ownership clearer.
- Do not hide business orchestration inside route files.

## Naming rules

- Route files: `routes/auth.ts`, `routes/profile.ts`
- Handler files: `handlers/auth/exchange-provider-token.ts`
- Repository files: `db/repositories/session-repository.ts`
- Contract files: `contracts/auth.ts`, `contracts/profile.ts`
- Type files: `types/app.ts`, `types/auth.ts`
- Auth files: `lib/auth/firebase.ts`, `lib/auth/jwt.ts`

## Import rules

- First look inside the feature’s own route, handler, and repository area.
- Import from `contracts` for HTTP contract types.
- Import from `types` for runtime-only internal types.
- Handlers and middlewares may use repositories; routes do not run direct SQL.
- Keep `utils` dependency-light and framework-agnostic.

# feat-031: Build the backend internationalization foundation

## Objective

Add a backend internationalization foundation for `apps/worker` so human-readable validation and error messages no longer come from scattered hard-coded English strings. The observable result is that worker-side error/validation copy resolves through one Vietnamese locale catalog, unsupported or missing locale input still falls back to `vi`, and downstream features such as `feat-008` can reuse the same message surface instead of inventing ad hoc strings.

## Purpose / Big Picture

The worker currently returns English error and validation messages from `lib/errors.ts`, `lib/validation.ts`, auth helpers, route fallbacks, and a few `zod` schemas. That makes future localization expensive because every feature would need to retrofit its own message handling. `feat-031` creates the backend primitives first: locale resolution, request-scoped locale context, a translation catalog with `vi` as the only supported locale for now, and a disciplined way for handlers/middleware/helpers to request translated copy without changing error codes or API field names.

The implementation should also preserve a future migration seam for a real i18n library. We are not adding a dependency now, but the local design should isolate locale parsing, catalog lookup, and translation calls behind small internal interfaces so a later library adoption mainly swaps adapter internals instead of rewriting every handler, middleware, and validator.

## Scope and Out-of-Scope

### In Scope

- `apps/worker/src/index.ts`
- `apps/worker/src/lib/errors.ts`
- `apps/worker/src/lib/validation.ts`
- `apps/worker/src/middlewares/request-context.ts`
- `apps/worker/src/middlewares/auth.ts`
- `apps/worker/src/lib/auth/firebase.ts`
- `apps/worker/src/lib/auth/jwt.ts`
- `apps/worker/src/contracts/profile.ts`
- `apps/worker/src/types/app.ts`
- `apps/worker/src/types/index.ts`
- New backend i18n support files under `apps/worker/src/lib/i18n/*`
- `apps/worker/test/index.spec.ts`
- `apps/worker/test/unit/*` where direct message/locale helpers need regression coverage
- `apps/worker/README.md` if backend locale behavior needs documentation
- `harness/features/feat-031.json`
- `harness/feature_index.json`
- `harness/progress.md`
- `docs/exec-plans/active/2026-04-22-feat-031-backend-internationalization-foundation.md`
- `docs/exec-plans/active/index.md`

### Out of Scope

- Frontend locale catalogs, UI copy translation, client language switchers, or browser-side i18n plumbing (`feat-032`).
- Adding any language other than Vietnamese.
- Persisting language preference in the database or user profile.
- Translating API field names, error codes, route paths, or response envelope structure.
- Product-copy rewrites beyond the backend messages already emitted by worker validation and error handling.
- Auth/logout business changes from `feat-008`; this feature only prepares the backend localization surface that auth will consume.

## Non-negotiable Requirements

- Keep backend layering aligned with `ARCHITECTURE.md`: `Types -> Config -> Repo -> Service -> Runtime`, expressed here as `types/config -> lib/i18n + lib/errors -> middleware/helpers/runtime`.
- Keep route -> handler -> repository boundaries intact. i18n must remain a shared runtime concern and must not drag SQL or Hono context into repositories.
- Keep the API contract stable: base path stays `/api/v1`, payload fields stay `camelCase`, error `code` values stay unchanged, and only human-readable message strings become locale-driven.
- Default and fallback locale must be hard-coded to `vi` for this feature. Unsupported locale requests must degrade safely to Vietnamese without throwing.
- No new third-party dependencies unless a concrete implementation blocker proves the existing stack cannot support the feature. Default assumption: build the foundation with local TypeScript utilities and catalogs only.
- Tests must prove both normal `vi` behavior and unsupported-locale fallback behavior.
- The local i18n layer must be shaped as an adapter boundary so a future i18n library can replace internals with minimal call-site churn.

## Progress

- [ ] (2026-04-22, owner: Codex, status: current) Finalize the backend i18n scope around request-scoped locale resolution, translated error/validation messages, and `vi` fallback only.
- [ ] Add a small worker i18n runtime under `apps/worker/src/lib/i18n/` for locale constants, translation keys, message catalog, and translation lookup.
- [ ] Extend request context so each request has a resolved locale value, derived from headers but normalized to `vi`.
- [ ] Refactor shared error and validation helpers to use translation keys/catalog lookup rather than hard-coded English strings.
- [ ] Migrate existing auth/middleware/route-level message call sites that currently emit user-facing English strings.
- [ ] Add or update tests proving translated messages and fallback semantics.
- [ ] Update worker docs and harness state, then move this plan to `completed/` once the feature is verified.

## Surprises & Discoveries

- Current worker localization surface is concentrated in a manageable set of shared files: `lib/errors.ts`, `lib/validation.ts`, `middlewares/auth.ts`, `lib/auth/firebase.ts`, `lib/auth/jwt.ts`, `contracts/profile.ts`, and the app-level `notFound` handler in `index.ts`.
- The current worker already has a request-context middleware and typed `AppBindings.Variables`, so locale can be added there without inventing a new cross-cutting pattern.
- There is no backend i18n reference doc yet; this feature should keep the implementation minimal and explicit so a future reference can be extracted from the code if needed.
- Repository-wide `./init.sh` has previously been blocked by an unrelated web test failure (`localStorage.getItem is not a function` in `apps/web/src/app.test.tsx`), so worker-local verification must remain first-class evidence during implementation.

## Decision Log

- Decision: Implement backend i18n with a local catalog and helper functions rather than adding an external i18n library.
  Rationale: The repo forbids new dependencies without explicit request, and the current scope only needs one locale plus deterministic fallback.
  Date/Author: 2026-04-22 / Codex

- Decision: Keep backend locale negotiation intentionally narrow for now: inspect request language hints, normalize them, and always resolve to `vi`.
  Rationale: This preserves a future-friendly seam without pretending multi-language behavior already exists.
  Date/Author: 2026-04-22 / Codex

- Decision: Do not change error `code` values or envelope shape while localizing messages.
  Rationale: Frontend and tests should continue to depend on stable machine-readable error codes.
  Date/Author: 2026-04-22 / Codex

- Decision: Put locale resolution behind middleware and translation behind a small internal adapter instead of calling catalog objects directly throughout the codebase.
  Rationale: This keeps the first implementation small while making later library adoption mostly an internal refactor of `lib/i18n/*`.
  Date/Author: 2026-04-22 / Codex

## Outcomes & Retrospective

Fill in after implementation:

- Outcome:
- Gaps:
- Lessons:

## Context and Orientation

- Worker entry and app-wide error/not-found handling: `apps/worker/src/index.ts`
- Shared request context: `apps/worker/src/middlewares/request-context.ts`
- Shared error construction: `apps/worker/src/lib/errors.ts`
- Shared JSON parsing/validation: `apps/worker/src/lib/validation.ts`
- Auth/user-facing backend messages: `apps/worker/src/middlewares/auth.ts`, `apps/worker/src/lib/auth/firebase.ts`, `apps/worker/src/lib/auth/jwt.ts`
- Zod schema message currently hard-coded: `apps/worker/src/contracts/profile.ts`
- Runtime request variables/types: `apps/worker/src/types/app.ts`, `apps/worker/src/types/index.ts`
- Worker tests: `apps/worker/test/index.spec.ts`, `apps/worker/test/unit/*`

## Scope Map

### Expected File and Module Impact

- New files likely needed:
  - `apps/worker/src/lib/i18n/locales.ts`
  - `apps/worker/src/lib/i18n/messages.vi.ts`
  - `apps/worker/src/lib/i18n/catalog.ts`
  - `apps/worker/src/lib/i18n/resolve-locale.ts`
  - `apps/worker/src/lib/i18n/translate.ts`
  - `apps/worker/src/lib/i18n/create-translator.ts` or equivalent adapter entrypoint if needed to keep future library swap localized
- Existing files likely edited:
  - `apps/worker/src/types/app.ts`
  - `apps/worker/src/middlewares/request-context.ts`
  - `apps/worker/src/lib/errors.ts`
  - `apps/worker/src/lib/validation.ts`
  - `apps/worker/src/index.ts`
  - `apps/worker/src/middlewares/auth.ts`
  - `apps/worker/src/lib/auth/firebase.ts`
  - `apps/worker/src/lib/auth/jwt.ts`
  - `apps/worker/src/contracts/profile.ts`
  - worker test files and README/harness artifacts

### Layer Impact

- `Types`: add a request-scoped locale type and possibly translation-key types.
- `Config`: no env-level locale config is planned; fallback remains code-defined as `vi`.
- `Repo`: no repository changes expected.
- `Service`: not applicable as a separate layer in current worker structure.
- `Runtime`: request context, error helpers, validation helpers, auth helpers, route fallback handler.
- `UI`: out of scope for `feat-031`.

### Hard Dependency Checks

- Lower layers must not depend on higher layers:
  - repositories remain untouched by locale logic
  - translation lookup stays in `lib/i18n`, not in routes/tests only
- UI must not bypass runtime/service contracts:
  - backend messages remain an API runtime concern
- Data access enters through repositories:
  - no DB or repository localization logic is introduced
- New dependencies:
  - none planned; if one is proposed during implementation, the plan must be amended with explicit justification first

### Future Library Swap Constraints

- Call sites outside `lib/i18n/*` should depend on a narrow function/helper contract such as `t(locale, key, params?)` or a request-scoped translator, not on raw locale maps.
- Locale parsing must stay isolated in one resolver function plus middleware glue so swapping to a library-provided negotiator does not require route-level edits.
- Translation keys should remain stable internal identifiers even if the backing implementation later moves to a third-party library/catalog format.
- `AppError`, validation helpers, and auth helpers should consume translated strings or a translator function, not import message catalogs directly.

## Standards Enforcement

### Required References

- `docs/references/backend/project-folder-structure.md`
- `docs/references/backend/architecture-and-boundaries.md`
- `docs/references/backend/api-contract-and-validation.md`
- `docs/references/backend/error-handling-pattern.md`
- `docs/references/backend/security-and-auth-pattern.md`
- `docs/references/backend/testing-pattern.md`
- `docs/references/backend/cloudflare-workers.md`
- `docs/references/shared/type-naming-pattern.md`

### Concrete Coding Constraints

- Put shared locale/catalog code under `apps/worker/src/lib/i18n/`, not in `utils/` and not mixed into contracts.
- Keep one adapter entrypoint in `apps/worker/src/lib/i18n/` so future library migration stays localized to that folder.
- Keep `contracts/*` as API transport surfaces only. If schema factories or helper functions are introduced for localized messages, they must not blur contract types with runtime context.
- Preserve consistent JSON envelopes from `lib/response.ts`; localization may change `message` content, not envelope shape.
- Continue using explicit status codes and stable `ErrorCode` values from `lib/errors.ts`.
- Avoid Hono context in generic translation helpers. Middleware may resolve locale from the request, then pass plain locale values to helpers.
- Do not log request language headers or locale hints in a way that adds noise or leaks sensitive state.
- If worker bindings/config need to change, fetch current Cloudflare Workers docs before editing `wrangler.jsonc`; default assumption is that no binding change is needed for this feature.

## Implementation Notes

- Mandatory patterns:
  - Resolve locale once in request context and reuse it across handlers/helpers through typed request variables or explicit parameters.
  - Keep unsupported locale handling deterministic: normalize to `vi`, do not attempt partial-language fallback trees yet.
  - Use translation keys or helper wrappers for reusable backend messages rather than duplicating Vietnamese text in multiple files.
  - Route all translation through a thin internal adapter so a future library can replace implementation internals without changing most call sites.
- Companion skills for implementation:
  - `tdd-workflow`
  - `security-review`
  - `documentation-lookup`
  - `backend-patterns`
  - `verification-loop`
- Common pitfalls to avoid:
  - Translating machine-readable fields such as `error.code` or response keys.
  - Leaving `zod` schema messages hard-coded while localizing only `AppError` messages.
  - Coupling translation lookup directly to Hono `Context`, which would make unit testing harder and leak framework concerns downward.

## Interfaces & Dependencies

- Existing worker runtime:
  - `Hono` request pipeline
  - request-scoped variables in `AppBindings`
  - `zod` schema validation
- Planned internal interfaces:
  - locale type such as `SupportedLocale = 'vi'`
  - request locale variable such as `locale: SupportedLocale`
  - translation key/value map for reusable backend messages
  - one adapter surface such as `translate(locale, key, params?)` or `createTranslator(locale)`
- External dependencies:
  - none new by default

Potential helper shape for implementation:

```ts
type SupportedLocale = 'vi'

type MessageKey =
  | 'errors.invalidJsonBody'
  | 'errors.invalidRequestBody'
  | 'errors.missingBearerToken'
  | 'errors.sessionExpired'
  | 'errors.routeNotFound'

const translate = (locale: SupportedLocale, key: MessageKey): string => { ... }
```

Preferred call-site shape for future-proofing:

```ts
type TranslateParams = Record<string, string | number>

type Translator = (
  key: MessageKey,
  params?: TranslateParams,
) => string

const createTranslator = (locale: SupportedLocale): Translator => { ... }
```

With this shape, later adopting a library should mostly change `createTranslator()` and `resolve-locale.ts`, while `errors.ts`, `validation.ts`, middleware, and handlers continue to call the same internal API.

## Plan of Work (Narrative)

1. Create a minimal backend i18n module under `apps/worker/src/lib/i18n/` that defines the supported locale set (`vi` only), the fallback locale (`vi`), a Vietnamese message catalog, a locale resolver, and one adapter entrypoint such as `translate()` or `createTranslator()`. Keep raw catalogs private to this folder as much as possible.
2. Extend `apps/worker/src/types/app.ts` so request context can carry the resolved locale and, if useful, a request-scoped translator function. Update `request-context.ts` to inspect request language hints such as `Accept-Language`, normalize any input to the only supported locale, and store the result in request variables. The first version should always resolve to `vi`, but the negotiation seam must be explicit for future locales or a future library.
3. Refactor `apps/worker/src/lib/errors.ts` so callers can construct `AppError` values from translation keys or locale-aware helpers without changing status codes or envelope shape. `errors.ts` should depend on the adapter contract, not raw message objects.
4. Refactor `apps/worker/src/lib/validation.ts` so JSON parse failures and schema-validation failures use translated Vietnamese copy. Preserve structured `details` for validation errors and avoid baking raw catalog access into validation call sites.
5. Migrate current user-visible worker messages to the shared i18n path:
   - missing bearer token / expired session / deleted user in `middlewares/auth.ts`
   - invalid Firebase token cases in `lib/auth/firebase.ts`
   - invalid session token cases in `lib/auth/jwt.ts`
   - route not found in `src/index.ts`
   - profile schema message in `contracts/profile.ts`, likely via a schema factory or shared constant so the message is not hard-coded English
6. Ensure middleware remains the only request-lifecycle place that reads language hints directly. Downstream code should consume `locale` or a translator from context/parameters so replacing internals later does not require broad route/handler changes.
7. Add or update tests:
   - integration coverage in `apps/worker/test/index.spec.ts` for malformed JSON, malformed auth exchange payload, missing auth header, unknown route, and unsupported locale header fallback
   - unit coverage for locale resolution and translation helper behavior if extracted into pure functions
8. Update `apps/worker/README.md` with a short section on backend locale behavior if the runtime contract now depends on `Accept-Language` normalization.
9. Reconcile harness artifacts, mark `feat-031` done only after verification passes, and keep `feat-032`/`feat-008` aligned as downstream consumers of the new backend i18n foundation.

## Concrete Steps (Commands)

Run from repo root unless noted otherwise.

```bash
# Baseline repo verification before editing
./init.sh

# Focused worker test loop during implementation
pnpm --filter worker exec vitest run apps/worker/test/index.spec.ts
pnpm --filter worker exec vitest run apps/worker/test/unit/*.spec.ts

# Worker package verification after the i18n foundation lands
pnpm --filter worker lint
pnpm --filter worker typecheck
pnpm --filter worker test

# Final repo verification before closing the feature
./init.sh
```

Expected short outputs:

```text
Test Files ... passed
All files pass linting
Found 0 errors
=== Init complete ===
```

Optional manual spot-check during implementation:

```bash
pnpm --filter worker dev
curl -s -H 'accept-language: en-US,en;q=0.9' http://127.0.0.1:8787/api/v1/missing-route
```

Expected behavior:

- HTTP `404`
- error code still `NOT_FOUND`
- human-readable message comes back in Vietnamese because fallback locale is `vi`

## Validation and Acceptance

### Happy Path

- Requests that currently succeed continue to succeed unchanged.
- Worker requests that produce user-facing errors now return Vietnamese messages.
- Requests with no language header still resolve messages in Vietnamese.

### Validation / Error Paths

- Invalid JSON body returns `400` with Vietnamese parse-error copy.
- Invalid request body returns `400` with Vietnamese validation-failure copy and preserved structured details.
- Missing bearer token returns `401` with Vietnamese message.
- Unknown route returns `404` with Vietnamese message.

### Fallback Behavior

- A request with `Accept-Language: en-US` still returns Vietnamese messages because unsupported locales fall back to `vi`.
- A request with malformed or empty locale hints also returns Vietnamese messages without crashing.
- The same unsupported-locale tests should still pass if the internal translator implementation is swapped later, proving the adapter seam is stable.

### Regression Checks

- Existing tests that depend on stable `error.code` values continue to pass.
- Existing auth/profile flows continue to behave the same apart from localized message strings.
- `feat-008` prerequisites are improved without changing auth token/session semantics.

### Acceptance Artifacts

- `apps/worker/test/index.spec.ts`
- any new unit test for locale resolution / translation helpers
- final `pnpm --filter worker test` transcript
- final `./init.sh` transcript, or a clearly documented unrelated blocker if only the web baseline fails
- updated `harness/features/feat-031.json`

## Idempotence & Recovery

- All planned test/lint/typecheck commands are safe to re-run.
- No D1 migration or irreversible data change is planned.
- The feature should be recoverable with a normal git revert because it introduces only code-level message plumbing.
- If implementation starts to widen into frontend or database preference storage, stop and split that work into `feat-032` or a new feature instead of expanding `feat-031`.

## Risks and Blockers

- The biggest risk is partial localization, where some shared helpers move to Vietnamese but schema-level or auth-level messages remain English. The implementation must inventory and migrate the current hard-coded messages deliberately.
- A second risk is leaking raw catalog access across the codebase, which would make future library adoption expensive. Keep adapter usage disciplined from the start.
- If tests assert exact English message strings today, they will need careful updates so they still validate behavior without over-coupling to future copy changes.
- Full-repo verification may still be affected by the unrelated web test baseline issue noted in `harness/progress.md`.
- Backend i18n could accidentally become over-engineered for a single-language phase. Keep the foundation intentionally small and explicit.

## Open Decisions

- None currently blocking `feat-031`.

Resolved planning decisions for implementation:

- Backend responses do not need to expose the resolved locale explicitly through a new contract surface such as `Content-Language`.
- Request processing should accept a client-provided locale and use it to resolve the human-readable message language, with unsupported values still falling back safely.
- Localized `zod` messages may use the lightest implementation approach that avoids per-file hard-coded English strings.
- API-visible human messages should follow the resolved request locale, while internal/operator-facing logs can remain implementation-focused.

## Harness Integration

- Update `harness/features/feat-031.json` with final implementation evidence and `updated_at`.
- Keep `harness/feature_index.json` as `pending` until verification is complete, then mark `feat-031` as `done`.
- Add a new newest-first entry to `harness/progress.md` describing the i18n foundation work, verification, and any residual blockers.
- When the feature is complete:
  - move this ExecPlan to `docs/exec-plans/completed/`
  - add it to `docs/exec-plans/completed/index.md`
  - remove it from `docs/exec-plans/active/index.md`

## Artifacts and Notes

- Current English message sources identified during planning:
  - `apps/worker/src/lib/errors.ts`
  - `apps/worker/src/lib/validation.ts`
  - `apps/worker/src/middlewares/auth.ts`
  - `apps/worker/src/lib/auth/firebase.ts`
  - `apps/worker/src/lib/auth/jwt.ts`
  - `apps/worker/src/index.ts`
  - `apps/worker/src/contracts/profile.ts`
- Downstream features that benefit immediately from this foundation:
  - `feat-032` frontend i18n alignment
  - `feat-008` auth backend completion

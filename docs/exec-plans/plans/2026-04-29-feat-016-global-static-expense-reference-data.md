# feat-016: Global static expense reference data (categories + sources)

## Purpose / Big Picture

Implement the first production-ready reference-data layer for expense input so future expense forms stop depending on household-owned category records or hardcoded dropdowns. After this feature, the worker exposes public/cacheable `GET /api/v1/categories` and `GET /api/v1/sources` endpoints backed by a checked-in catalog, while the web app gains typed API hooks plus reusable `category-picker` and `source-picker` components ready to be embedded in later Add Expense and Quick-add work. Users will not see a full expense-entry screen yet; the observable outcome is stable reference-data endpoints and tested reusable UI primitives.

## Objective

Deliver `feat-016` as a fullstack reference-data foundation that:
- serves immutable categories and sources from checked-in code rather than household data,
- returns stable machine-readable metadata only (`key`, `kind`, `iconUrl`, `color` for categories; stable keys for sources),
- ships web transport/hooks/reusable picker components with tests,
- leaves Add Expense UI, Quick-add UI, and schema migration away from legacy `expense_categories` table out of scope.

## Scope

### In Scope

- Worker public reference-data endpoints:
  - `GET /api/v1/categories`
  - `GET /api/v1/sources`
- Worker checked-in catalog source of truth for categories and sources.
- Worker contracts, handlers, routes, and tests for the new endpoints.
- Web typed transport layer for reference data:
  - endpoint constants
  - API functions
  - React Query hooks
  - reference-data DTO/types
- Web reusable expense-domain picker components:
  - `category-picker`
  - `source-picker`
- Web i18n keys for category/source labels and picker copy.
- Harness/progress/index updates for activating and tracking `feat-016`.
- Tech-debt tracking for the deferred schema realignment away from legacy household-scoped `expense_categories`.

### Out of Scope

- Add Expense page or any route-level integration in `/expenses`.
- Quick-add modal or keyboard shortcut work.
- Category CRUD, user customization, recent/default/last-used behavior.
- Offline/no-internet capture behavior and related resilience work.
- DB migration that removes or rewires the existing `expense_categories` table.
- Budget, analytics, or expense-write schema migrations to replace legacy `category_id` persistence.
- New shared workspace/package extraction for catalog types.

## Non-negotiable Requirements

- Source of truth for categories/sources lives in checked-in code, not DB reads.
- Endpoints are public `GET` endpoints with explicit strong cache headers and no auth requirement.
- API contract stays under `/api/v1` and uses the existing success/error envelope.
- Category payload items must expose only:
  - `key`
  - `kind`
  - `iconUrl`
  - `color`
- Source payload items must expose only stable source keys; no user-facing labels in API contract.
- Web must map labels from i18n using stable keys; display names are not a source of truth.
- Expense-facing UI may only offer categories whose catalog `kind` is `expense`.
- Worker architecture must remain `route -> handler -> catalog/lib` with no SQL in routes.
- Web picker work must follow shadcn-first composition and existing frontend folder conventions.
- No page-level `/expenses` integration is allowed in this feature.

## Progress

- [x] (2026-04-29) Create and register active ExecPlan for `feat-016`.
- [x] (2026-04-29) Implement worker-side checked-in catalog module and public reference-data contracts.
- [x] (2026-04-29) Add worker handlers/routes/cache headers and integration coverage for `/categories` and `/sources`.
- [x] (2026-04-29) Add web reference-data types, API functions, and React Query hooks.
- [x] (2026-04-29) Add expense-domain `category-picker` and `source-picker` components with component/API tests.
- [x] (2026-04-29) Run worker/web/full-repo verification and capture evidence in harness artifacts.
- [x] (2026-04-29) Mark plan `Completed` in `docs/exec-plans/index.md` after implementation finishes.

Current owned step: completed.

## Surprises & Discoveries

- Product docs and harness state were aligned on 2026-04-29 to treat categories/sources as immutable global reference data; the remaining mismatch is implementation/schema only.
- The current web component set already includes `Combobox` and `NativeSelect`, but does not include `ToggleGroup`; using the existing installed primitives keeps `feat-016` narrower.
- The current worker schema still contains `expense_categories` as a household-scoped table. This feature should not expand into cross-feature migration work.

## Decision Log

- Decision: Keep the runtime source of truth in worker code (`apps/worker`) rather than introducing a new shared workspace package.
  Rationale: `feat-016` needs one authoritative catalog that the API can serve immediately; adding package-level sharing would broaden scope without changing user-visible behavior.
  Date/Author: 2026-04-29 / user + Codex

- Decision: Public contract uses semantic string keys and no numeric ids.
  Rationale: keys are stable across locales and align with i18n-driven display labels; numeric ids from the original sample are not part of the new contract.
  Date/Author: 2026-04-29 / user + Codex

- Decision: Keep the full mixed category sample in the catalog and tag each entry with `kind`.
  Rationale: preserves the approved sample, avoids future redefinition of product truth, and lets expense flows filter to `kind = expense`.
  Date/Author: 2026-04-29 / user + Codex

- Decision: Use existing installed shadcn primitives: `Combobox` for `category-picker` and `NativeSelect` for `source-picker`.
  Rationale: `category-picker` needs search; `source-picker` has only five static options and can stay lightweight without adding new UI primitives.
  Date/Author: 2026-04-29 / Codex

- Decision: Return categories in the canonical checked-in catalog order and treat array order as presentation order.
  Rationale: preserves the supplied sample ordering and avoids locale-dependent client sorting.
  Date/Author: 2026-04-29 / Codex

- Decision: Set `Cache-Control: public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800` on both reference-data endpoints.
  Rationale: these endpoints are low-churn static reference data and should be safe to cache aggressively without blocking updates for too long.
  Date/Author: 2026-04-29 / Codex

- Decision: Catalog colors are implementation-owned but mandatory metadata.
  Rationale: product truth requires the field, but exact palette values were intentionally left out of docs; implementation should centralize one stable color per category in the catalog module.
  Date/Author: 2026-04-29 / user + Codex

## Open Decisions

- None blocking implementation.

## Risks and Blockers

- The current worker schema and downstream feature docs still imply future migration from legacy `category_id` storage to key-based storage; this feature must not accidentally start a half-migration.
- Public cache headers are straightforward, but tests must assert them so later auth/caching regressions are caught early.
- Label ownership is split intentionally (API keys vs web i18n labels); careless implementation could reintroduce duplicated display names into API payloads or component props.
- Component scope must stay bounded: no `/expenses` page integration, no quick-add modal, and no last-used/default logic sneaking in under UI polish.

## Outcomes & Retrospective

- Worker now serves public/cacheable static reference-data endpoints:
  - `GET /api/v1/categories`
  - `GET /api/v1/sources`
- Worker catalog source of truth is checked-in code with canonical order, semantic keys, and required metadata (`key`, `kind`, `iconUrl`, `color`).
- Web now has typed reference-data DTOs, API transport, React Query hooks, and reusable `category-picker`/`source-picker` components with API/component tests.
- Full verification completed via `./init.sh` (`pnpm install`, harness checks, lint, typecheck, tests).
- Legacy schema mismatch (`expense_categories` household-scoped model) remains intentionally deferred and tracked as tech debt.

## Context and Orientation

- Worker entry and route registration:
  - `apps/worker/src/index.ts`
  - existing route modules live under `apps/worker/src/routes/*`
- Worker response contract and patterns:
  - `apps/worker/src/lib/response.ts`
  - `apps/worker/src/contracts/index.ts`
- Worker test structure:
  - integration: `apps/worker/test/integration/*`
  - contract/unit tests: `apps/worker/test/unit/*`
  - shared setup: `apps/worker/test/helpers/test-context.ts`
- Web transport patterns:
  - `apps/web/src/api/endpoints.ts`
  - `apps/web/src/api/*`
  - `apps/web/src/hooks/api/use-profile.ts`
- Web reusable primitives and form patterns:
  - `apps/web/src/components/ui/combobox.tsx`
  - `apps/web/src/components/ui/native-select.tsx`
  - `apps/web/src/components/shared/form/*`
- Current expenses route status:
  - `apps/web/src/app/(protected)/expenses/page.tsx` is still a placeholder and must remain untouched by this feature.

## Implementation Notes

- Required backend standards:
  - `docs/references/backend/architecture-and-boundaries.md`
  - `docs/references/backend/api-contract-and-validation.md`
  - `docs/references/backend/error-handling-pattern.md`
  - `docs/references/backend/security-and-auth-pattern.md`
  - `docs/references/backend/testing-pattern.md`
  - `docs/references/backend/cloudflare-workers.md`
- Required frontend standards:
  - `docs/references/frontend/web/project-folder-structure.md`
  - `docs/references/frontend/web/component-structure-pattern.md`
  - `docs/references/frontend/web/naming-and-conventions-pattern.md`
  - `docs/references/frontend/web/api-react-query-pattern.md`
  - `docs/references/frontend/web/i18n-label-pattern.md`
  - `docs/design-docs/shadcn-card-composition-architecture-guide.md`
  - `.agents/skills/shadcn/SKILL.md`
  - `.agents/skills/shadcn/rules/styling.md`
  - `.agents/skills/shadcn/rules/forms.md`
  - `.agents/skills/shadcn/rules/composition.md`
- Required shared standards:
  - `docs/references/shared/type-naming-pattern.md`
- Companion skills for implementation:
  - `test-driven-development`
  - `backend-patterns`
  - `frontend-patterns`
  - `security-reviewer`
  - `typescript-reviewer`
  - `verification-before-completion`
- Pitfalls to avoid:
  - do not read categories/sources from D1 in this feature,
  - do not add labels or numeric ids to the public response,
  - do not create page-level state stores for reference data if the API hook already owns the fetch/cache lifecycle,
  - do not add mock data because the backend is in scope.

## Canonical Catalog Contract

Implement one checked-in worker catalog containing these exact category keys, kinds, Vietnamese labels for internal mapping reference only, and icon URLs. API responses expose `key`, `kind`, `iconUrl`, and `color`; labels stay in web i18n.

| Order | Key | Kind | Vi label | Icon URL |
|---|---|---|---|---|
| 1 | `food` | `expense` | Ăn uống | `https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263087/ico_antiem_rtdkab.png` |
| 2 | `transport` | `expense` | Xe cộ | `https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263090/ico_xeco_zlusxx.png` |
| 3 | `dating` | `expense` | Tình yêu | `https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263089/ico_tinhyeu_n9maa9.png` |
| 4 | `living-costs` | `expense` | Sinh hoạt phí | `https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263091/ico_sinhhoatphi_cdm3tg.png` |
| 5 | `family` | `expense` | Gia đình | `https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263088/ico_giadinh_immyso.png` |
| 6 | `children` | `expense` | Con cái | `https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263091/ico_concai_gkf6ox.png` |
| 7 | `relatives` | `expense` | Họ hàng | `https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263090/ico_hohang_az6gl2.png` |
| 8 | `shopping` | `expense` | Mua sắm | `https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263090/ico_muasam_vcfac4.png` |
| 9 | `beauty` | `expense` | Làm đẹp | `https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263091/ico_mypham_lbvuzk.png` |
| 10 | `health` | `expense` | Sức khoẻ | `https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263088/ico_suckhoe_lcqns7.png` |
| 11 | `social` | `expense` | Xã giao | `https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263090/ico_xagiao_jjlevz.png` |
| 12 | `repairs` | `expense` | Sửa chữa | `https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263087/ico_suachua_cjb4ml.png` |
| 13 | `work` | `expense` | Công việc | `https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263087/ico_congviec_zcnqxo.png` |
| 14 | `education` | `expense` | Học tập | `https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263089/ico_hoctap_pmeofo.png` |
| 15 | `investment` | `expense` | Đầu tư | `https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263088/ico_dautu_wuq3xk.png` |
| 16 | `self-development` | `expense` | Phát triển | `https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263091/ico_phattrien_ezxf5t.png` |
| 17 | `sports` | `expense` | Thể thao | `https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263088/ico_thethao_sboru6.png` |
| 18 | `travel` | `expense` | Du lịch | `https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263088/ico_dulich_frrimr.png` |
| 19 | `hobbies` | `expense` | Sở thích | `https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263087/ico_sothich_bwstwh.png` |
| 20 | `pets` | `expense` | Vật nuôi | `https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263091/ico_pet_ejgwee.png` |
| 21 | `money-in` | `income` | Nhận tiền | `https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263091/ico_nhantien_bzjpqv.png` |
| 22 | `lending` | `transfer` | Cho vay | `https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263087/ico_chovaytrano_voimcv.png` |
| 23 | `charity` | `expense` | Từ thiện | `https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263089/ico_tuthien_hnfhwl.png` |
| 24 | `other` | `expense` | Khác | `https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263090/ico_khac_jb5mal.png` |

Canonical source keys, in order:
- `cash`
- `bank-transfer`
- `card`
- `e-wallet`
- `other`

## Plan of Work (Narrative)

1. Add worker-side checked-in catalog and public contracts.
   - Create `apps/worker/src/lib/reference-data/catalog.ts` as the single runtime source of truth.
   - Keep categories and sources in one module so cache policy, order, keys, and metadata stay centralized.
   - Create `apps/worker/src/contracts/reference-data.ts` with DTOs and response types:
     - `ReferenceCategoryDTO`
     - `ReferenceSourceDTO`
     - `ListCategoriesResponse`
     - `ListSourcesResponse`
   - Export the new contract file from `apps/worker/src/contracts/index.ts`.

2. Add worker handlers and route module.
   - Create:
     - `apps/worker/src/handlers/reference-data/list-categories.ts`
     - `apps/worker/src/handlers/reference-data/list-sources.ts`
     - `apps/worker/src/routes/reference-data.ts`
   - Use the existing response envelope helper and set the cache header directly in the route before returning `success(...)`.
   - Mount the new route module from `apps/worker/src/index.ts` under `/api/v1`.
   - Do not attach auth middleware to these endpoints.

3. Add worker test coverage.
   - Add `apps/worker/test/unit/dto-reference-data.spec.ts` to validate any contract schemas and enum handling.
   - Add `apps/worker/test/integration/reference-data.spec.ts` to assert:
     - unauthenticated `GET /categories` returns `200`,
     - unauthenticated `GET /sources` returns `200`,
     - response envelope shape is correct,
     - category items contain `key`, `kind`, `iconUrl`, `color` and do not expose `name` or `id`,
     - sources expose only stable keys,
     - cache header matches the exact value,
     - category order matches the canonical catalog declaration.

4. Add web-side reference-data transport/types/hooks.
   - Create `apps/web/src/types/reference-data.ts` with:
     - `CategoryKey`
     - `CategoryKind`
     - `ReferenceCategory`
     - `SourceKey`
     - `ReferenceSource`
     - `ListCategoriesResponse`
     - `ListSourcesResponse`
   - Update `apps/web/src/api/endpoints.ts` with a `referenceData` branch:
     - `categories: '/categories'`
     - `sources: '/sources'`
   - Create `apps/web/src/api/reference-data.ts`.
   - Create `apps/web/src/hooks/api/use-reference-data.ts` with one query-key namespace and two hooks:
     - `useCategoriesQuery()`
     - `useSourcesQuery()`
   - Keep API functions HTTP-only and keep hooks responsible for caching/query keys.

5. Add web i18n keys and reusable picker components.
   - Extend `apps/web/src/lib/i18n/locales/vi.json` with:
     - picker labels/placeholders/empty states,
     - category label map keyed by the canonical category keys,
     - source label map keyed by the canonical source keys.
   - Create `apps/web/src/components/expense/index.ts`.
   - Create `apps/web/src/components/expense/category-picker.tsx`:
     - controlled component,
     - accepts `items`, `value`, `onValueChange`, `disabled`,
     - uses existing `Combobox`,
     - filters on translated label,
     - renders icon + translated label,
     - emits the stable category key.
   - Create `apps/web/src/components/expense/source-picker.tsx`:
     - controlled component,
     - accepts `items`, `value`, `onValueChange`, `disabled`,
     - uses existing `NativeSelect`,
     - renders translated labels,
     - emits the stable source key.
   - Keep both components feature-bounded under `components/expense/` and do not wire them into `/expenses` or quick-add routes yet.

6. Add frontend tests.
   - Add `apps/web/src/api/reference-data.test.ts` for endpoint usage and client mapping.
   - Add `apps/web/src/components/expense/category-picker.test.tsx` to assert:
     - translated category labels render,
     - filtering/search narrows the list,
     - selecting an item emits the stable key,
     - icons render from `iconUrl`.
   - Add `apps/web/src/components/expense/source-picker.test.tsx` to assert:
     - five source options render in canonical order,
     - labels come from i18n,
     - change events emit the stable source key.

7. Update harness and deferred-work tracking during implementation completion.
   - On implementation finish:
     - update `harness/features/feat-016.json` with evidence and final `done` status,
     - sync `harness/feature_index.json`,
     - move this plan entry from `Active` to `Completed`,
     - append implementation evidence to `harness/progress.md`.
   - Add a tech-debt row now for the deferred schema realignment from legacy `expense_categories`/`category_id` to key-based storage.

## Concrete Steps (Commands)

Run from repository root unless noted otherwise:

```bash
# Baseline/full verification
./init.sh

# Worker-focused iteration checks
pnpm typecheck:worker
pnpm test:worker

# Web-focused iteration checks
pnpm typecheck:web
pnpm test:web
pnpm build:web

# Optional targeted test runs while iterating
pnpm --filter worker exec vitest run test/unit/dto-reference-data.spec.ts test/integration/reference-data.spec.ts
pnpm --filter web exec vitest run src/api/reference-data.test.ts src/components/expense/category-picker.test.tsx src/components/expense/source-picker.test.tsx
```

Expected short outputs:

```text
Type checking: OK
Running tests: OK
Init Done
```

```text
... dto-reference-data.spec.ts ... passed
... reference-data.spec.ts ... passed
... category-picker.test.tsx ... passed
... source-picker.test.tsx ... passed
```

## Validation and Acceptance

### Worker happy path

- `GET /api/v1/categories` returns HTTP `200` with the standard envelope and `data.items.length === 24`.
- `GET /api/v1/sources` returns HTTP `200` with the standard envelope and `data.items.length === 5`.
- Both responses include `Cache-Control: public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800`.

### Worker contract assertions

- Category items expose `key`, `kind`, `iconUrl`, and `color`.
- Category items do not expose `name` or `id`.
- Source items expose stable keys only.
- Category order matches the canonical declaration above.

### Web behavior

- `useCategoriesQuery()` and `useSourcesQuery()` fetch from the new endpoints through `src/api/reference-data.ts`.
- `CategoryPicker` displays translated labels, supports search, and returns category keys.
- `SourcePicker` displays translated labels in canonical order and returns source keys.
- No `/expenses` route behavior changes in this feature.

### Acceptance artifacts

- `apps/worker/test/integration/reference-data.spec.ts`
- `apps/worker/test/unit/dto-reference-data.spec.ts`
- `apps/web/src/api/reference-data.test.ts`
- `apps/web/src/components/expense/category-picker.test.tsx`
- `apps/web/src/components/expense/source-picker.test.tsx`
- successful final `./init.sh` transcript

## Idempotence & Recovery

- All verification commands are safe to rerun.
- This feature introduces no DB migration or destructive data step.
- The checked-in catalog module is pure code; if a category metadata edit goes wrong, revert the catalog file and rerun tests.
- Legacy `expense_categories` table remains untouched in this feature, so there is no partial schema migration to recover from.

## Artifacts and Notes

- This feature intentionally leaves the current `/expenses` page as a placeholder.
- This feature intentionally does not add a web mock file because the worker endpoints are in scope and should be exercised for real.
- The catalog module should centralize category colors and icon URLs so tests and downstream features never duplicate that metadata.
- Frontend i18n should use key-based paths such as:
  - `referenceData.categories.food`
  - `referenceData.sources.cash`
  - `expenseReferenceData.categoryPicker.placeholder`

## Interfaces & Dependencies

### New worker/public interfaces

- `GET /api/v1/categories`
  - response data: `{ items: ReferenceCategoryDTO[] }`
- `GET /api/v1/sources`
  - response data: `{ items: ReferenceSourceDTO[] }`

### Proposed type contracts

- `ReferenceCategoryDTO`
  - `key: string`
  - `kind: 'expense' | 'income' | 'transfer'`
  - `iconUrl: string`
  - `color: string`
- `ReferenceSourceDTO`
  - `key: 'cash' | 'bank-transfer' | 'card' | 'e-wallet' | 'other'`

### Internal dependencies

- Worker:
  - `apps/worker/src/lib/response.ts`
  - `apps/worker/src/index.ts`
  - new `apps/worker/src/lib/reference-data/catalog.ts`
- Web:
  - `apps/web/src/api/client.ts`
  - `apps/web/src/api/endpoints.ts`
  - `apps/web/src/components/ui/combobox.tsx`
  - `apps/web/src/components/ui/native-select.tsx`
  - `apps/web/src/lib/i18n/locales/vi.json`

### External dependencies

- No new runtime dependencies are expected.
- If implementation chooses to add a new shadcn primitive anyway, it must be justified in the diff and reviewed against existing installed components first.

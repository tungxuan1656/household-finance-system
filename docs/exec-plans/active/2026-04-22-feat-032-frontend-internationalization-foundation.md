# feat-032: Build the frontend internationalization foundation

## Objective

Add a frontend internationalization foundation for `apps/web` so user-facing UI labels resolve through a Vietnamese locale catalog instead of scattered hard-coded English strings. The observable result is that the current auth and shell surfaces render from one `vi` catalog, unsupported or missing locale input still falls back to `vi`, and later feature screens can plug into the same translation surface without reworking app architecture.

## Purpose / Big Picture

The current web app shell, auth pages, onboarding placeholder, and route scaffolding all embed display copy directly inside React components. That is fine for early scaffolding, but it makes future locale expansion expensive because every new feature would keep inventing its own copy storage pattern. `feat-032` establishes the frontend seams now: one locale catalog in `apps/web/src/lib/i18n/`, one provider/hook boundary for React consumers, one deterministic fallback locale (`vi`), and a staged migration of the existing shell copy to translated keys.

This feature is frontend-only and intentionally narrow. It will use `i18next`, `react-i18next`, and `i18next-browser-languagedetector` as the canonical frontend i18n surface, with language detection coming from persisted app choice first and browser language second. The goal is to make future locale work cheap and consistent, not to solve every language product requirement up front.

## Scope and Out-of-Scope

### In Scope

- `apps/web/src/app.tsx`
- `apps/web/package.json`
- `apps/web/src/router.tsx`
- New shared frontend constants under `apps/web/src/lib/constants/*` if needed for locale keys/storage keys
- New frontend i18n support files under `apps/web/src/lib/i18n/*`
- `apps/web/src/pages/auth/sign-in-page.tsx`
- `apps/web/src/pages/auth/sign-up-page.tsx`
- `apps/web/src/pages/app/overview-page.tsx`
- `apps/web/src/pages/app/onboarding-page.tsx`
- `apps/web/src/pages/app/placeholder-page.tsx`
- `apps/web/src/components/auth/auth-panel.tsx`
- `apps/web/src/components/layouts/public-shell.tsx`
- `apps/web/src/components/layouts/protected-shell.tsx`
- `apps/web/src/app.test.tsx`
- New focused web i18n tests if needed under `apps/web/src/lib/i18n/*` or `apps/web/src/components/*`
- `docs/exec-plans/active/2026-04-22-feat-032-frontend-internationalization-foundation.md`
- `docs/exec-plans/active/index.md`
- `harness/progress.md`
- `harness/features/feat-032.json`
- `harness/feature_index.json`

### Out of Scope

- Backend locale logic or worker response translation changes from `feat-031`.
- Adding any locale other than Vietnamese.
- A locale switcher UI or URL-based locale routing.
- Translating API payload field names, route paths, or machine-readable store values.
- Rewriting shell UX or auth behavior beyond replacing hard-coded copy with translated keys.
- Adding a new frontend state store unless implementation shows a provider-only approach cannot cover current needs.
- Introducing a third-party i18n library by default.

## Non-negotiable Requirements

- Keep frontend layering aligned with `ARCHITECTURE.md`: shared locale definitions stay in `lib/i18n`, React consumption happens through a provider/hook boundary, and page/components do not reach into raw locale JSON directly.
- All new user-facing labels on the touched screens must resolve via translation keys. Do not leave mixed hard-coded JSX copy behind in the migrated surfaces.
- Default and fallback locale must be hard-coded to `vi` for this feature. Unsupported or absent locale hints must degrade safely to Vietnamese without rendering blanks.
- Preserve current route structure and feature behavior. This feature changes copy plumbing, not auth flow, route guards, or navigation logic.
- Use `i18next`, `react-i18next`, and `i18next-browser-languagedetector` for the frontend i18n runtime. This dependency addition is explicitly approved for this feature.
- Resolve browser or persisted language hints to the supported locale set before passing them into the runtime configuration. Unsupported input must normalize to `vi`.
- Tests must prove both normal `vi` rendering and unsupported-locale fallback behavior.
- The i18n implementation must leave a clean migration seam for future locale expansion without forcing another round of component-by-component plumbing changes.
- Persist the chosen app language in `localStorage` under one shared key so browser detection and future manual language changes use the same storage contract.

## Progress

- [ ] (2026-04-22, owner: Codex, status: in-progress) Finalize the frontend i18n plan and keep one owned current step for implementation readiness.
- [ ] Add the approved `i18next` dependencies and a minimal web i18n module in `apps/web/src/lib/i18n/` with locale constants, `vi` catalog JSON, browser-language resolution, and the exported `t(...)` / `changeLanguage(...)` entrypoint.
- [ ] Initialize `i18next` in `apps/web/src/lib/i18n/index.ts`, then ensure the app bootstrap loads it before routed screens render.
- [ ] Refactor current shell/auth/onboarding/placeholder copy to use translation keys instead of inline strings.
- [ ] Add or update tests proving translated rendering, accessible labels, and fallback-to-`vi` behavior for unsupported locale hints.
- [ ] Update harness state and move this plan forward with implementation evidence once the feature lands.

## Surprises & Discoveries

- The current web shell keeps nearly all user-facing text in a compact set of page/layout files, so the first migration can stay focused and low-risk.
- `apps/web/src/app.test.tsx` already covers the routed shell and accessible labels, making it a strong acceptance surface for i18n migration without inventing a new test harness.
- `./init.sh` passes on 2026-04-22, so the implementation can treat the current repo as a clean baseline rather than working around a standing frontend failure.
- The frontend reference doc explicitly requires locale labels to live in JSON files under `src/lib/i18n/`, so the implementation should keep the catalog there even though runtime setup will use `i18next`.
- `apps/web/package.json` currently does not include `i18next`, `react-i18next`, or `i18next-browser-languagedetector`, so dependency installation must be a deliberate part of the implementation rather than an implicit assumption.

## Decision Log

- Decision: Use `i18next`, `react-i18next`, and `i18next-browser-languagedetector` as the frontend i18n runtime, with `vi.json` as the first locale catalog.
  Rationale: The implementation direction is now explicitly chosen, and the provided bootstrap pattern already matches the desired browser-language plus `localStorage` behavior.
  Date/Author: 2026-04-22 / Codex

- Decision: Migrate the current auth and shell surfaces in the same feature instead of only adding unused i18n plumbing.
  Rationale: The feature description says the app should resolve UI labels through the locale catalog, so at least the current visible screens must prove the foundation is real.
  Date/Author: 2026-04-22 / Codex

- Decision: Keep fallback pinned to `vi` even if browser language or future app settings suggest another locale.
  Rationale: This matches the feature record and keeps the first implementation deterministic while leaving future expansion seams intact.
  Date/Author: 2026-04-22 / Codex

- Decision: Resolve locale before passing it into `i18next.init(...)`, instead of relying on unsupported values to fall through implicitly at render time.
  Rationale: This keeps fallback behavior deterministic and makes tests simpler because unsupported browser hints always normalize to one supported app locale.
  Date/Author: 2026-04-22 / Codex

- Decision: Keep locale storage and locale identifiers in `src/lib/constants/` while runtime wiring lives in `src/lib/i18n/`.
  Rationale: This follows the project folder reference more closely and gives the app one reusable place for storage keys and locale constants outside the runtime bootstrap file.
  Date/Author: 2026-04-22 / Codex

## Outcomes & Retrospective

- Outcome target: the routed web shell renders its visible labels from a shared Vietnamese catalog through one frontend i18n boundary.
- Expected gap after completion: only `vi` exists, and locale choice remains non-persistent.
- Follow-on value: later features can add keys and optionally another locale file without re-plumbing the app root or rewriting existing screens.

## Context and Orientation

- App root and router mount: `apps/web/src/app.tsx`, `apps/web/src/router.tsx`
- Public auth entry surfaces: `apps/web/src/pages/auth/sign-in-page.tsx`, `apps/web/src/pages/auth/sign-up-page.tsx`
- Protected placeholder shell: `apps/web/src/components/layouts/protected-shell.tsx`, `apps/web/src/pages/app/overview-page.tsx`, `apps/web/src/pages/app/onboarding-page.tsx`, `apps/web/src/pages/app/placeholder-page.tsx`
- Public shell framing: `apps/web/src/components/layouts/public-shell.tsx`, `apps/web/src/components/auth/auth-panel.tsx`
- Existing auth state: `apps/web/src/stores/auth.store.ts`
- Existing route acceptance tests: `apps/web/src/app.test.tsx`
- Backend locale dependency already completed: `harness/features/feat-031.json`, `docs/exec-plans/completed/2026-04-22-feat-031-backend-internationalization-foundation.md`

## Scope Map

### Expected File and Module Impact

- New files likely needed:
  - `apps/web/src/lib/constants/i18n.ts`
  - `apps/web/src/lib/i18n/index.ts`
  - `apps/web/src/lib/i18n/locales/vi.json`
  - `apps/web/src/lib/i18n/types.ts`
  - `apps/web/src/lib/i18n/resolve-locale.ts`
  - `apps/web/src/lib/i18n/translate.ts`
- Existing files likely edited:
  - `apps/web/package.json`
  - `apps/web/src/app.tsx`
  - `apps/web/src/router.tsx`
  - migrated page/layout/component files listed above
  - `apps/web/src/app.test.tsx`
  - harness and active-plan index artifacts

### Layer Impact

- `Types`: locale types, translation key typing, optional `i18next` module augmentation types.
- `Config`: fallback locale constant, supported locale list, and storage key in `lib/constants` plus i18n bootstrap config in `lib/i18n`.
- `Repo`: not applicable for frontend scope.
- `Service`: not applicable as a separate frontend layer in the current app.
- `Runtime`: provider, locale resolver, translator hook, router bootstrap.
- `UI`: auth pages, public/protected shells, onboarding placeholder, route placeholder titles.

### Hard Dependency Checks

- Lower layers must not depend on higher layers:
  - JSON catalogs and translation helpers stay in `lib/i18n`, not in pages/components.
- UI must not bypass runtime/service contracts:
  - components/pages consume `t(...)` or an i18n hook, not raw locale files.
- Data access enters through repositories or adapters:
  - not directly relevant here, but this feature must not add UI-side locale assumptions into API clients or stores.
- New dependencies:
  - `i18next`
  - `react-i18next`
  - `i18next-browser-languagedetector`
  - These are in scope because the user explicitly selected this implementation direction.

### Compatibility and Future Expansion Constraints

- Key names must remain semantic and nested by screen/domain so future locale files can be added without renaming components again.
- Placeholder pages that currently receive English `title` strings from the router should be switched to key-based titles or a route metadata object that resolves through i18n.
- Locale detection must be isolated behind one resolver function so `localStorage`, navigator language, and HTML tag hints all normalize to the supported app locales before runtime init.
- Copy interpolation must go through the translation adapter, not through manual string concatenation in JSX.

## Standards Enforcement

### Required References

- `docs/references/frontend/project-folder-structure.md`
- `docs/references/frontend/component-structure-pattern.md`
- `docs/references/frontend/naming-and-conventions-pattern.md`
- `docs/references/frontend/i18n-label-pattern.md`
- `docs/references/shared/type-naming-pattern.md`

### Concrete Coding Constraints

- Put all shared i18n plumbing under `apps/web/src/lib/i18n/`; do not scatter locale helpers into `utils/`, `stores/`, or page folders.
- Put shared locale/storage constants under `apps/web/src/lib/constants/` when they are reused outside the i18n bootstrap file.
- Store locale strings in JSON locale files, starting with `apps/web/src/lib/i18n/locales/vi.json`.
- Use semantic nested keys such as `auth.signIn.title`, `shell.navigation.overview`, and `onboarding.householdName.label`.
- Keep files in `kebab-case` and exports named, following the repo naming rules.
- Do not hard-code user-facing JSX copy in any file migrated by this feature.
- Preserve accessible labels in the rendered DOM; tests should continue to target visible translated labels through roles/label text.
- Expose the canonical frontend translate helper from `apps/web/src/lib/i18n/index.ts`, matching the approved shorthand pattern.

## Implementation Notes

- Mandatory patterns:
  - One canonical i18n bootstrap at `apps/web/src/lib/i18n/index.ts`.
  - One exported shorthand `t(key, params?)` helper for component usage.
  - One `changeLanguage(lang)` helper that persists the chosen locale and reloads the page.
  - One locale resolver with hard fallback to `vi` before `i18next.init(...)`.
  - One shared source for route/navigation labels so router definitions do not keep English strings inline.
- Companion skills for implementation:
  - `tdd-workflow`
  - `documentation-lookup`
  - `frontend-patterns`
  - `verification-loop`
  - `security-review` because user-facing auth entry surfaces and validation copy are involved, even though the change is low-risk
- Common pitfalls to avoid:
  - Leaving mixed hard-coded English copy inside `AuthPanel`, shell nav items, or placeholder routes.
  - Importing raw JSON locale files directly into page components instead of going through the `i18next` adapter.
  - Relying on `LanguageDetector` output without normalizing unsupported values back to `vi`.
  - Forgetting placeholder titles passed from `router.tsx`, which would leave untranslated text even if pages are migrated.

## Interfaces & Dependencies

- Existing dependencies:
  - React 19
  - React Router
  - Vitest + Testing Library
  - Zustand auth store (unrelated to locale state but present in the routed shell)
- New dependencies to add:
  - `i18next`
  - `react-i18next`
  - `i18next-browser-languagedetector`
- Planned internal interfaces:
  - `SupportedLocale = 'vi'`
  - `DEFAULT_LOCALE = 'vi'`
  - `APP_LANGUAGE_STORAGE_KEY`
  - `resolveLocale(input?: string | null): SupportedLocale`
  - `t(key: TranslationKey, params?: TranslationParams): string`
  - `changeLanguage(lang: string): void`

Potential internal shape:

```ts
export type SupportedLocale = 'vi'

export type TranslationParams = Record<string, string | number>

export type TranslationKey =
  | 'auth.signIn.title'
  | 'auth.signUp.title'
  | 'shell.navigation.overview'
  | 'onboarding.title'

export type I18nValue = {
  locale: SupportedLocale
  t: (key: TranslationKey, params?: TranslationParams) => string
}
```

Approved bootstrap direction:

```ts
import type { ParseKeys } from 'i18next'
import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import translationVI from './locales/vi.json'
```

The implementation may keep type derivation or module augmentation details slightly different if needed for repo typing constraints, but it should stay close to the approved shape: one bootstrap file, one shorthand `t(...)`, one `changeLanguage(...)`, and one deterministic fallback to `vi`.

## Plan of Work (Narrative)

1. Add `i18next`, `react-i18next`, and `i18next-browser-languagedetector` to `apps/web/package.json`, then create `apps/web/src/lib/constants/i18n.ts` for the app-language storage key, supported locales, and fallback locale.
2. Create `apps/web/src/lib/i18n/index.ts` as the canonical bootstrap file using the approved pattern: load `vi.json`, register `LanguageDetector`, initialize `react-i18next`, resolve persisted/browser language hints down to the supported locale set, and export `t(...)` plus `changeLanguage(...)`.
3. Ensure the app bootstrap imports `src/lib/i18n/index.ts` before routed screens render so translated labels are ready from first paint.
4. Refactor route metadata in `apps/web/src/router.tsx` so placeholder titles and navigation labels no longer live as hard-coded English strings in the route tree. Prefer route keys or pre-resolved labels that still come from `t(...)`.
5. Migrate current public-shell and auth-page copy to translation keys:
   - `apps/web/src/components/layouts/public-shell.tsx`
   - `apps/web/src/components/auth/auth-panel.tsx`
   - `apps/web/src/pages/auth/sign-in-page.tsx`
   - `apps/web/src/pages/auth/sign-up-page.tsx`
   Include inline validation error messages and field descriptions/placeholders where they are user-visible.
6. Migrate protected-shell and placeholder app copy:
   - `apps/web/src/components/layouts/protected-shell.tsx`
   - `apps/web/src/pages/app/overview-page.tsx`
   - `apps/web/src/pages/app/onboarding-page.tsx`
   - `apps/web/src/pages/app/placeholder-page.tsx`
   Ensure headings, helper text, CTA labels, badge text, list items, and placeholder titles all resolve through the catalog.
7. Add or update tests in `apps/web/src/app.test.tsx` and any focused i18n helper tests so they prove:
   - default `vi` rendering works
   - persisted `appLanguage` is respected when valid
   - unsupported locale input falls back to `vi`
   - accessible labels/roles still work after the copy migration
8. Update harness state and progress notes with the final verification evidence after implementation completes.

## Concrete Steps (Commands)

Run from repo root unless noted otherwise.

```bash
# Baseline full-repo verification before implementation
./init.sh

# Install the approved frontend i18n dependencies
pnpm --filter web add i18next react-i18next i18next-browser-languagedetector

# Focused frontend unit/integration loop while implementing
pnpm --filter web test

# Frontend type + lint loop after code changes
pnpm --filter web lint
pnpm --filter web typecheck

# Production bundle smoke check for the migrated shell copy
pnpm --filter web build
```

Expected short outputs:

- `./init.sh` ends with `=== Init complete ===`
- `pnpm --filter web add ...` updates `apps/web/package.json` and the lockfile without installation errors
- `pnpm --filter web test` shows all web test files passing
- `pnpm --filter web lint` exits cleanly with no ESLint errors
- `pnpm --filter web typecheck` exits cleanly with no TypeScript errors
- `pnpm --filter web build` finishes with Vite `built in ...`

## Validation and Acceptance

### Happy Path

- Visiting `/sign-in` renders Vietnamese labels for heading, action button, email/password fields, and footer link text through the i18n layer.
- Visiting `/sign-up` renders Vietnamese title, field labels, descriptions, and CTA text through the same i18n layer.
- Signing in through the existing test flow still reaches `/app`, and the overview/protected navigation labels render from the locale catalog.
- Visiting `/app/onboarding` renders Vietnamese heading, field labels, checklist items, and action buttons from the catalog.

### Validation and Error Path

- Invalid sign-in or sign-up form submission renders translated validation feedback instead of hard-coded English strings.
- Placeholder routes such as `/app/expenses` render their title and helper text through translation keys rather than raw router strings.

### Unsupported Locale / Fallback Path

- When the provider receives an unsupported locale hint (for example browser language like `en-US`), the rendered copy still resolves to Vietnamese.
- Missing locale input also resolves to the same Vietnamese catalog without throwing.
- When `localStorage.appLanguage` contains an unsupported value, the resolver still normalizes to `vi`.

### Persisted Locale Path

- When `localStorage.appLanguage` is already set to `vi`, the app boots directly into the Vietnamese catalog without waiting for browser detection order to choose another source.

### Regression Checks

- Existing auth redirect behavior and route guards remain unchanged.
- Accessible queries in `apps/web/src/app.test.tsx` still find labels/buttons/headings after the i18n migration.
- No page in the migrated scope keeps leftover hard-coded user-facing copy except values explicitly marked out of scope.

### Acceptance Artifacts

- Updated `apps/web/src/app.test.tsx` or focused i18n tests proving Vietnamese rendering and fallback.
- Clean `./init.sh` transcript ending in `=== Init complete ===`.
- Final `pnpm --filter web build` transcript proving the frontend bundle still builds.

## Verification Path

1. Run `./init.sh` from the repo root to confirm baseline and final repo health.
2. During implementation, run `pnpm --filter web test` after each i18n slice lands.
3. Run `pnpm --filter web lint`, `pnpm --filter web typecheck`, and `pnpm --filter web build` before closing the feature.
4. Capture the specific test assertions or transcript snippets that prove fallback-to-`vi` behavior.
5. Capture at least one assertion proving the persisted `appLanguage` path and one proving unsupported browser language fallback.

## Risks and Blockers

- Risk: Placeholder route titles are currently passed as literal strings from `router.tsx`; missing that seam would leave partial hard-coded copy behind.
  Mitigation: Convert route titles to translation keys or a route metadata object during the first router edit.

- Risk: Over-typing translation keys could create unnecessary friction if the first implementation becomes verbose.
  Mitigation: Keep typing strict enough to avoid arbitrary strings, but prefer derived key typing from the catalog if the handwritten union becomes noisy.

- Risk: Browser-locale detection can accidentally create hydration or test brittleness if implemented too dynamically.
  Mitigation: Keep locale resolution deterministic and injectable; tests should explicitly control the input and assert fallback behavior.

- Risk: Introducing `i18next` dependencies adds one more moving piece to app bootstrap and tests.
  Mitigation: Keep the runtime surface thin, initialize in one file, and avoid spreading i18n setup across multiple React wrappers.

- Blocker policy: if the approved `i18next` bootstrap shape causes typing or test harness issues that require a materially different integration pattern, amend this plan before widening scope.

## Idempotence & Recovery

- The plan is safe to re-run: file edits, tests, lint, typecheck, and build are all repeatable.
- No database or external service migration is involved.
- If the provider wiring causes broad test failures, rollback is straightforward because the change is isolated to `apps/web/src/lib/i18n/`, `app.tsx`, router labels, and migrated components.
- Recovery path:
  - revert the i18n provider mount and leave the catalog folder in place if needed
  - re-run `pnpm --filter web test` to confirm the pre-migration shell behavior returns

## Harness Integration

- Update `harness/features/feat-032.json` with final status, evidence, and `updated_at` once implementation is done.
- Update `harness/feature_index.json` to mark `feat-032` done only after verification passes.
- Add a new top entry to `harness/progress.md` summarizing the implementation, files changed, blockers, and next steps.
- Move this plan from `docs/exec-plans/active/` to `docs/exec-plans/completed/` when the feature is verified, and update the active/completed plan indexes accordingly.

## Artifacts and Notes

- Baseline verification on 2026-04-22:
  - `./init.sh` passed end-to-end
  - web tests: 3 files / 13 tests passed
  - worker tests: 10 files / 56 tests passed
  - frontend build completed successfully
- Evidence to capture during implementation:
  - translated test assertions from `apps/web/src/app.test.tsx`
  - one fallback test proving unsupported locale input still renders Vietnamese
  - final build transcript

## Open Decisions

- Decide whether route-level placeholder titles should be translated by passing a key into `PlaceholderPage` or by resolving the string in `router.tsx` before render.
- Decide whether translation-key typing should be derived from the JSON catalog or kept as a manually maintained type in the first iteration.

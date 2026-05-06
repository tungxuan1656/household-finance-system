# feat-030 — New user onboarding flow

## Title

Add first-run onboarding for authenticated users with no household.

## Purpose / Big Picture

Implement frontend onboarding flow for authenticated users who finish auth but do not belong to any household yet. Users will observe guided first-run path at `/onboarding` that lets them create household or join existing household via invite token, then land on clear next-step completion state with actions to invite members, set monthly budget, or add first expense.

This plan stays aligned to `harness/features/feat-030.json` and `docs/product-specs/new-user-onboarding.md` while reusing existing backend contracts from `feat-011`, `feat-013`, and `feat-024`. Scope stays frontend-first: no new worker routes, no onboarding-only household fields, and no optional product-tour work.

## Scope

- Planned frontend areas:
  - `apps/web/src/app/(protected)/onboarding/page.tsx`
  - `apps/web/src/views/app/onboarding-page.tsx`
  - `apps/web/src/components/onboarding/*` (new feature-bounded onboarding components)
  - `apps/web/src/components/onboarding/index.ts` (new barrel)
  - `apps/web/src/lib/auth/post-auth-redirect.ts` or current auth redirect seam if onboarding gating logic must change
  - `apps/web/src/lib/constants/paths.ts` (reuse only unless missing onboarding/completion targets)
  - `apps/web/src/stores/household.store.ts` (only if smallest safe path for create-household and auto-skip household state sync)
  - `apps/web/src/views/invitations/accept-invitation-page.tsx` (reuse/reference; only touch if token-preview logic must be extracted without behavior drift)
  - `apps/web/src/components/household/household-invite-dialog.tsx` (reuse only for completion CTA target)
  - `apps/web/src/components/expense/quick-add-expense-trigger.tsx` and related quick-add surface only if completion CTA needs existing open hook/context
  - `apps/web/src/views/app/budgets-page.tsx` (reuse only; no budget feature changes planned)
  - `apps/web/src/lib/i18n/locales/vi.json`
  - web test files covering onboarding flow states, validation, skip/resume, and CTA behaviors.
- Shared/runtime integration scope:
  - Reuse `POST /api/v1/households` from `feat-011`.
  - Reuse invitation preview + accept contracts from `feat-013` (`GET /api/v1/invitations/:token`, `POST /api/v1/invitations/:token/accept`).
  - Reuse quick-add entry surface from `feat-024` for completion CTA.
  - Reuse auth redirect seam from `feat-009` so first-run users reach onboarding and existing-household users skip it.
- Harness/documentation continuity scope:
  - `docs/exec-plans/index.md`
  - `harness/feature_index.json`
  - `harness/features/feat-030.json`
  - `harness/progress.md`

Out of scope for this plan:

- New backend routes, contract changes, D1 schema changes, or invitation/household API redesign.
- Household currency/timezone inputs during onboarding. Create flow stays name-only and relies on existing MVP defaults.
- Optional short product tour mentioned in `docs/product-specs/new-user-onboarding.md`.
- Hidden global active-household state or broad household-store refactors unrelated to onboarding.
- New account-settings IA beyond smallest required resumable entry point; if no existing settings affordance can host resume action cleanly, record follow-up instead of expanding silently.
- Rebuilding existing invitation accept page unless extraction is clearly smallest safe reuse path.
- Quick-add feature expansion, budget feature expansion, or post-onboarding analytics/education surfaces.

## Non-negotiable Requirements

- Plan must stay self-contained and executable without hidden assumptions.
- Implementation must produce observable proof through automated tests plus feature verification commands.
- Onboarding must trigger only for authenticated users who belong to no household and must auto-skip for users who already do.
- Create-household path stays name-only; no onboarding-only currency field may be added.
- Join path must support both deep-link token prefill and manual token entry, preserve token/input on retry, and show clear invalid/expired/already-member failure states.
- Users must be able to skip invite-member follow-up and still reach usable app state.
- UI must preserve frontend decomposition rules: route/view files orchestrate only, onboarding stateful flow lives in feature-bounded components, and raw API calls stay behind existing runtime boundaries.
- New user-facing copy, validation text, and error messages must use i18n keys, not hardcoded strings.
- Any resume-safe local persistence must stay minimal, explicit, and frontend-scoped; do not invent durable preference/state systems.

## Progress

- [x] 2026-05-06 00:00 UTC — Reviewed planning docs, harness records, frontend standards, and related feature plans for auth, invitations, households, and quick-add. Owner: Orchestrator.
- [x] 2026-05-06 00:00 UTC — Locked scope decision that onboarding household creation remains name-only, matching MVP household defaults rather than introducing onboarding-only currency input. Owner: Orchestrator.
- [ ] 2026-05-06 00:00 UTC — Register active ExecPlan, update harness continuity files, and leave implementation-ready current step for feat-030. Owner: Orchestrator. **Current step**.
- [ ] Implement auth-to-onboarding gating and onboarding flow decomposition under `apps/web/src/components/onboarding/`.
- [ ] Implement create path, join-via-invite path, skip/resume behavior, and completion CTA wiring with focused web tests.
- [ ] Run full verification via `./init.sh`, update harness evidence, and move plan/index entry to completed state when implementation finishes.

## Surprises & Discoveries

- `harness/features/feat-030.json` says create path includes default currency, but `docs/product-specs/household-management.md` and current onboarding UI both support name-only MVP creation. User explicitly chose name-only for this plan.
- Existing `apps/web/src/views/app/onboarding-page.tsx` already implements minimal create-household form and redirect, so feat-030 should evolve this surface instead of creating parallel onboarding route behavior.
- Existing invitation deep-link page already contains preview/accept/error/auth-return logic that should be reused or extracted carefully instead of rebuilt from scratch.
- Spec asks abandoned onboarding to be resumable from account settings, but current exploration has not yet confirmed exact settings entry point. Plan must treat this as scoped smallest-safe integration or explicit follow-up if missing.

## Decision Log

- Decision: Treat `feat-030` as `frontend` domain work with runtime integration dependencies.
  Rationale: Feature behavior is primarily onboarding UI/orchestration and reuses existing household create, invitation preview/accept, auth redirect, and quick-add capabilities.
  Date/Author: 2026-05-06 / Orchestrator.

- Decision: Onboarding household creation stays name-only.
  Rationale: User selected recommended option, and MVP household-management spec already hides currency/timezone behind defaults.
  Date/Author: 2026-05-06 / Orchestrator.

- Decision: Prefer extracting/reusing existing invitation preview/accept logic over duplicating token-handling behavior.
  Rationale: `feat-013` already solved deep-link auth return, preview, and accept states; duplicating flow risks drift in token validation and retry UX.
  Date/Author: 2026-05-06 / Orchestrator.

- Decision: Resume-safe state should be minimal and explicit.
  Rationale: Product spec requires abandoned onboarding to be safe and resumable, but scope does not justify broad persisted wizard infrastructure. Persist only smallest data needed to avoid input loss or deep-link token loss.
  Date/Author: 2026-05-06 / Orchestrator.

## Outcomes & Retrospective

- Target outcome: first-run authenticated users without households see guided onboarding instead of landing in dead-end app state, can create or join household, and finish with at least one clear next action.
- Verification target: focused onboarding tests pass, relevant auth/invitation/household regressions remain green, and `./init.sh` completes successfully.
- Follow-up note to confirm during implementation: whether “resume from account settings” can be satisfied through existing profile/settings navigation or should be logged as narrow follow-up IA work.

## Context and Orientation

- Feature and product source of truth:
  - `harness/features/feat-030.json` — authoritative feature scope, dependencies, and current status.
  - `docs/product-specs/new-user-onboarding.md` — onboarding goals, user flow, acceptance, and failure states.
  - `docs/product-specs/household-management.md` — MVP household-creation behavior and no-hidden-active-household constraint.
  - `docs/product-specs/household-invitation.md` — invite-token preview/accept expectations and invalid/expired token handling.
  - `docs/product-specs/quick-add-experience.md` — completion CTA behavior for “add first expense”.
- Dependency features already implemented:
  - `harness/features/feat-009.json` — auth session flow and onboarding redirect seam.
  - `harness/features/feat-011.json` — household create/list/detail flow and `POST /api/v1/households`.
  - `harness/features/feat-013.json` — invitation preview and accept flow.
  - `harness/features/feat-024.json` — quick-add expense CTA target.
- Existing web baseline:
  - `apps/web/src/app/(protected)/onboarding/page.tsx` — protected route entry for onboarding.
  - `apps/web/src/views/app/onboarding-page.tsx` — current name-only create-household screen.
  - `apps/web/src/stores/household.store.ts` — household create/list state and current-household sync.
  - `apps/web/src/views/invitations/accept-invitation-page.tsx` — preview/accept deep-link UI and auth return handling.
  - `apps/web/src/lib/auth/post-auth-redirect.ts` — likely seam for post-auth onboarding routing.
  - `apps/web/src/components/household/household-invite-dialog.tsx` — possible completion CTA reuse for invite members.
  - `apps/web/src/components/expense/quick-add-expense-trigger.tsx` — existing quick-add launch surface for completion CTA.
  - `apps/web/src/views/app/budgets-page.tsx` — existing budget setup destination.
  - `apps/web/src/lib/constants/paths.ts` — route constants.
- Related prior ExecPlans for pattern reference:
  - `docs/exec-plans/plans/2026-04-23-feat-009-authentication-frontend-session-flow.md`
  - `docs/exec-plans/plans/2026-04-29-feat-013-household-invitations.md`
  - `docs/exec-plans/plans/2026-05-04-feat-024-quick-add-expense-basic-flow.md`

## Standards and Implementation Notes

### Required references for implementation

- Frontend mandatory docs:
  - `docs/FRONTEND.md`
  - `docs/references/frontend/project-folder-structure.md`
  - `docs/references/frontend/component-structure-pattern.md`
  - `docs/references/frontend/naming-and-conventions-pattern.md`
  - `docs/references/frontend/form-pattern.md`
  - `docs/references/frontend/dialog-and-form-pattern.md`
  - `docs/references/frontend/api-react-query-pattern.md`
  - `docs/references/frontend/zustand-store-pattern.md`
  - `docs/references/frontend/i18n-label-pattern.md`
  - `docs/design-docs/shadcn-first-ui-web-guide.md`
  - `.agents/skills/shadcn/SKILL.md`
  - `.agents/skills/shadcn/rules/styling.md`
  - `.agents/skills/shadcn/rules/forms.md`
  - `.agents/skills/shadcn/rules/composition.md`
- Shared mandatory docs:
  - `docs/references/shared/type-naming-pattern.md`

### Concrete coding constraints derived from standards matrix

- Keep onboarding-specific UI and local orchestration under `apps/web/src/components/onboarding/`; do not grow `views/app/onboarding-page.tsx` into monolith.
- Route/page files stay orchestration-only. Wizard step rendering, token persistence, completion CTA handling, and create/join submit logic belong in feature components or focused hooks.
- Prefer named exports, kebab-case file names, and folder `index.ts` exports for onboarding public components.
- Use existing hooks/stores/runtime wrappers; UI must not call raw HTTP functions directly.
- Form flows must use `react-hook-form` + Zod + shadcn field primitives with complete defaults, `aria-invalid`, `data-invalid`, and inline `FieldError` handling.
- New local persistence, if needed, must store only smallest safe onboarding draft/token data and include explicit reset path after success/skip.
- Add all onboarding labels, branch-copy, CTA text, validation strings, and retry/failure states to locale files.
- Reuse existing shadcn primitives and semantic tokens; avoid bespoke wizard framework or speculative design system additions.

### Implementation Notes

- Mandatory patterns for this scope:
  - Welcome, choice, create/join, and completion states should be decomposed into small feature components, with `onboarding-page.tsx` acting as top-level route orchestrator only.
  - Auto-skip decision should occur early and deterministically based on authenticated household membership state; avoid flash of onboarding for already-member users where existing auth/store data can answer immediately.
  - Join flow should accept token from deep link or user input, preserve token across retry, and prefer sharing preview/accept logic with existing invitation flow.
  - Completion CTAs should reuse existing destinations/surfaces instead of adding new onboarding-only implementations.
  - Skip path must still land user in usable app state even if they defer invite/budget/expense next steps.
- Companion skills for implementation:
  - `test-driven-development`
  - `frontend-patterns`
  - `security-reviewer`
  - `shadcn`
  - `verification-before-completion`
  - `requesting-code-review`
  - `typescript-reviewer`
- Common pitfalls to avoid:
  - Do not silently add onboarding-only household fields or backend dependencies.
  - Do not duplicate invitation token parsing/accept logic in multiple screens.
  - Do not trap skipped users in unusable route loop.
  - Do not hardcode copy or leave plain-English store fallback errors exposed in new UI without i18n mapping.

## Interfaces & Dependencies

- Internal runtime/API dependencies:
  - `createHousehold(payload)` in `apps/web/src/stores/household.store.ts` backed by `POST /api/v1/households` — existing create boundary for onboarding create path.
  - invitation preview/accept functions and current consumer in `apps/web/src/views/invitations/accept-invitation-page.tsx` backed by `GET /api/v1/invitations/:token` and `POST /api/v1/invitations/:token/accept` — reused for join flow.
  - auth redirect seam in `apps/web/src/lib/auth/post-auth-redirect.ts` — determines whether new user lands on onboarding or existing app route.
  - quick-add trigger/dialog surface in `apps/web/src/components/expense/*` — reused from completion CTA.
- UI/component dependencies:
  - shadcn form, button, card, dialog/sheet, and alert primitives already present in web app.
  - `sonner` toast infrastructure for success/retry feedback if current onboarding flow keeps toast usage.
- Layer impact check using `Types -> Config -> Repo -> Service -> Runtime -> UI`:
  - `Types`: possible small frontend helper types for onboarding step state and CTA action state.
  - `Config`: likely unchanged aside from route constant reuse.
  - `Repo`: no direct repository/database changes planned.
  - `Service`: existing worker household/invitation services reused only.
  - `Runtime`: auth redirect logic, state orchestration, invitation preview/accept runtime reuse, household create store integration.
  - `UI`: onboarding route, step components, validation/error states, completion actions.
- Hard dependency rule checks from `ARCHITECTURE.md`:
  - Lower layers stay untouched unless implementation discovers missing reusable contract; if so, stop and amend plan.
  - UI must use runtime/service contracts through existing store/hooks/helpers, never bypassing transport boundaries.
  - No new dependency should be introduced unless existing shadcn/web stack cannot deliver required onboarding flow; if needed, justify before proceeding.

## Plan of Work (Narrative)

1. **Stabilize onboarding entry and skip gating.** Confirm current protected onboarding route and post-auth redirect seam. Update auth/onboarding entry logic so authenticated users with no household reach `/onboarding`, while users with at least one household skip onboarding and land in normal app route without redirect loops or stale empty-state flashes.

2. **Decompose onboarding UI into focused feature components.** Replace current single-form `apps/web/src/views/app/onboarding-page.tsx` implementation with route orchestration plus new `apps/web/src/components/onboarding/*` building blocks for welcome/choice, create form, join form or invite preview state, and completion state. Keep each file bounded by concern and reuse shared shadcn primitives directly.

3. **Implement name-only create-household branch on existing contract.** Reuse current create schema and existing household create/store path so users can create household with only name, preserve input on network failure, and transition to completion state or usable destination without introducing onboarding-only data model drift.

4. **Implement join-via-invite branch with token prefill and retry safety.** Support token passed through deep link or entered manually, show preview/validation using existing invitation contract, preserve token on failure, and handle invalid, expired, unauthorized, and already-member states with explicit user-facing messaging. Reuse current invitation accept patterns wherever possible.

5. **Implement completion and skip behavior using existing product surfaces.** After create or join succeeds, show completion state with CTA set for invite members, set monthly budget, and add first expense via quick-add. Provide skip/defer path that still lands users in usable app state. If product spec requires resume from account settings and existing settings page can host entry cleanly, add smallest discoverable resume affordance; otherwise log exact follow-up gap.

6. **Add localized validation and regression coverage.** Add i18n keys for onboarding copy and failure states, plus focused tests for route gating, name-only create success/failure retry, token prefill/manual join, invalid-token state, skip behavior, and completion CTA rendering/activation. Finish with full verification and harness evidence updates.

## Concrete Steps (Commands)

Run from repo root unless noted otherwise.

```bash
# Baseline verification before implementation
./init.sh

# Focused web loop during onboarding implementation
pnpm --filter web lint
pnpm --filter web typecheck
pnpm --filter web test -- onboarding

# Broader targeted web regressions if auth/invitation/household tests exist
pnpm --filter web test -- auth invitation household

# Final full verification
./init.sh
```

Expected short outputs to compare against:

- `./init.sh` completes with harness checks, lint, type-check, tests, and web build succeeding.
- `pnpm --filter web lint` and `pnpm --filter web typecheck` exit successfully with no errors.
- `pnpm --filter web test -- onboarding` ends with `0 failed` and includes new onboarding coverage.

## Validation and Acceptance

- Happy path — create branch:
  - Authenticated user with no households lands on `/onboarding`.
  - User chooses create path, enters household name only, submits successfully, and reaches completion state with invite/budget/quick-add CTAs.
- Happy path — join branch:
  - Authenticated user opens onboarding with deep-link token or enters token manually, sees valid preview, accepts invite, and lands in joined household usable state or completion state according to scoped UX decision.
- Skip/defer path:
  - User can defer invite-member/budget/quick-add follow-up and still reach usable protected app route.
- Auto-skip path:
  - Authenticated user who already belongs to household does not remain on onboarding and is redirected away cleanly.
- Failure and retry paths:
  - Create-household network/server failure keeps entered name and allows retry.
  - Invalid/expired invite token shows clear error state and preserves token for correction/retry.
  - Join accept unauthorized/auth-required path preserves return target through existing auth return handling.
- Acceptance evidence:
  - Focused onboarding test file(s) pass.
  - Any touched auth/invitation/household regression suites pass.
  - `./init.sh` succeeds.

## Idempotence & Recovery

- Planning/documentation steps are safe to re-run.
- Frontend implementation should be safe to iterate repeatedly with `lint`, `typecheck`, and focused tests.
- Any minimal persisted onboarding draft/token state must include explicit clear/reset behavior after success, skip, or cancel so stale data does not loop future sessions.
- No destructive data migration or irreversible backend step is planned.
- If implementation uncovers missing backend contract or unavoidable IA gap for settings-based resume, stop, record discovery in plan, and amend scope instead of improvising broad changes.

## Artifacts and Notes

- Expected implementation evidence artifacts:
  - Onboarding-focused web tests in `apps/web/src/**/__tests__` or adjacent `*.test.tsx` files.
  - Updated locale keys in `apps/web/src/lib/i18n/locales/vi.json`.
  - Harness evidence in `harness/features/feat-030.json` after verification.
- Plan-registration evidence target:
  - `docs/exec-plans/plans/2026-05-06-feat-030-new-user-onboarding-flow.md` added.
  - `docs/exec-plans/index.md` Active section updated.
  - `harness/features/feat-030.json`, `harness/feature_index.json`, and `harness/progress.md` updated for continuity.

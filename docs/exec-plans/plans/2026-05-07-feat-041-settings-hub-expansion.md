# feat-041 — Profile/settings hub expansion for membership overview and user preferences

## Title

Expand `/settings` into a frontend-first settings hub that combines profile controls, membership overview, and actionable shortcuts using existing APIs.

## Purpose / Big Picture

Implement a frontend-first upgrade of the current `/settings` route so it behaves like a real user control center instead of a narrow profile form. After this feature lands, authenticated users should be able to open Settings and immediately understand their personal account state, household membership context, and the next actions available to them without hunting across unrelated screens.

This feature intentionally reuses the existing profile and household contracts rather than introducing a new backend settings platform. Users should observe a clearer settings information architecture: the current avatar/display-name path remains intact, household membership context becomes visible inside Settings, and the page exposes direct paths to household-specific management tasks already supported elsewhere in the product.

## Scope

- Planned frontend areas:
  - `apps/web/src/app/(protected)/settings/page.tsx`
  - `apps/web/src/views/app/profile-settings-page.tsx` or a renamed/restructured replacement view under `apps/web/src/views/app/`
  - `apps/web/src/components/profile/*`
  - New settings-hub feature components under `apps/web/src/components/settings/*`
  - `apps/web/src/lib/constants/paths.ts`
  - `apps/web/src/lib/constants/navigation.ts` only if labels or shortcut targets must change
  - `apps/web/src/hooks/api/use-profile.ts` only if current query wiring needs additive settings-hub composition support
  - `apps/web/src/stores/household.store.ts` only if the existing household store needs small additive selector/flow support for Settings composition
  - `apps/web/src/lib/i18n/locales/vi.json`
  - New or updated tests near `apps/web/src/views/app/` and `apps/web/src/components/settings/` / `apps/web/src/components/profile/`
- Existing reusable surfaces the implementation may compose but should not redesign broadly:
  - `apps/web/src/components/profile/profile-avatar-section.tsx`
  - `apps/web/src/components/profile/profile-avatar-dialog.tsx`
  - `apps/web/src/components/profile/profile-display-name-form.tsx`
  - `apps/web/src/views/app/household-detail-page.tsx`
  - `apps/web/src/components/household/household-settings-card.tsx`
  - `apps/web/src/components/household/household-members-card.tsx`
  - `apps/web/src/components/household/household-danger-zone-card.tsx`
  - `apps/web/src/components/household/household-invite-dialog.tsx`
- Continuity and planning artifacts:
  - `docs/exec-plans/index.md`
  - `harness/features/feat-041.json`
  - `harness/feature_index.json`
  - `harness/progress.md`

Out of scope for this plan:

- New backend endpoints, database fields, or profile preference persistence beyond the already-supported `/api/v1/users/me` fields.
- A generalized cross-product settings platform, settings search, or multi-route settings IA redesign.
- Moving full household settings management into `/settings` if that requires duplicating complex forms or broad route changes; this feature should prefer overview + shortcuts over cloning screens.
- New auth/security semantics, role models, invitation contracts, or household membership APIs.
- Theme switching, notification channels, language switching, or other speculative preference categories not already supported by current product scope.
- Refactoring unrelated profile, household, or navigation code that does not directly serve the new settings-hub behavior.

## Non-negotiable Requirements

- The plan must stay self-contained and implementation-ready for a human or coding agent.
- `feat-041` is locked to a `frontend` domain outcome with frontend-first reuse of existing backend contracts.
- The current avatar and display-name edit path must remain intact and verifiably functional after the hub expansion.
- The Settings page must surface household membership context using existing household data and must not imply capabilities the current APIs do not support.
- User-facing text must remain fully i18n-backed; no hardcoded labels may be introduced.
- Settings UI must follow the repository’s orchestrator-first view/component split and shadcn composition rules.
- The implementation must add or update automated tests for the new settings-hub behavior because the current `/settings` surface has weak direct coverage.
- No new dependencies may be introduced unless implementation proves an existing project dependency cannot satisfy the UI composition need; any new dependency must be justified in the plan before adoption.

## Progress

- [x] 2026-05-07 00:00 UTC — Reviewed planning requirements, architecture rules, harness state, and the next pending feature record (`feat-041`). Owner: Orchestrator.
- [x] 2026-05-07 00:00 UTC — Mapped the current settings/profile surface, reusable household/member flows, and likely touched files. Owner: Orchestrator.
- [x] 2026-05-07 00:00 UTC — Locked scope to a frontend-first settings hub that reuses existing profile and household APIs rather than adding new backend preference fields. Owner: Orchestrator.
- [x] 2026-05-07 00:00 UTC — Created and registered the active ExecPlan for `feat-041`. Owner: Orchestrator.
- [x] 2026-05-07 00:00 UTC — Lock the Settings information architecture to a single long-form page composed of stacked sections/cards: account summary, household membership summary, household action shortcuts, and the existing profile edit section. Owner: Orchestrator.
- [ ] 2026-05-07 00:00 UTC — Implement the new `/settings` orchestrator and feature-bounded settings-hub components while preserving existing profile edit behavior. Owner: Implementation agent. Status: current step.
- [ ] 2026-05-07 00:00 UTC — Add or update focused tests for settings happy paths, membership-empty states, role-sensitive shortcuts, and error/retry handling. Owner: Implementation agent.
- [ ] 2026-05-07 00:00 UTC — Run frontend verification plus `./init.sh`, then update harness evidence and move the plan to Completed. Owner: Implementation agent.

## Surprises & Discoveries

- `/settings` currently renders only `ProfileSettingsPage`, so the visible navigation promise already exceeds the delivered scope.
- Household management capabilities already exist, but they live primarily under household detail rather than under Settings; this creates a discoverability gap that `feat-041` can close without backend work.
- Profile data and household data currently use different client-state patterns (`React Query` for profile, Zustand async actions for households), so the settings hub must compose both carefully rather than forcing a broad state-management rewrite.
- Direct test coverage for the current profile/settings view appears minimal, so this feature should include first-class regression coverage instead of relying on indirect tests.

## Decision Log

- Decision: Treat `feat-041` as a frontend-only feature that reuses current backend contracts.
  Rationale: The user selected the frontend-first path, and current profile plus household/member APIs already provide enough data to build a small but meaningful settings hub.
  Date/Author: 2026-05-07 / Orchestrator.

- Decision: Prefer overview and actionable shortcuts inside `/settings` instead of duplicating full household management forms there.
  Rationale: This keeps the feature scoped, avoids UI duplication, and respects the existing route ownership of household-specific operations while still improving discoverability.
  Date/Author: 2026-05-07 / Orchestrator.

- Decision: Preserve the current avatar/display-name workflow as a subsection of the new settings hub rather than replacing it.
  Rationale: The current profile-edit surface already exists and has product value; `feat-041` should expand the page around it, not destabilize it.
  Date/Author: 2026-05-07 / Orchestrator.

- Decision: Use a single long-form `/settings` page with stacked cards/sections instead of tabs or sub-navigation.
  Rationale: A single-page layout is the smallest truthful IA that closes the discoverability gap without adding route complexity or creating a second navigation system inside Settings.
  Date/Author: 2026-05-07 / Orchestrator.

- Decision: Show household membership as a compact list of all current memberships rather than inventing a primary or “most relevant” household concept.
  Rationale: Current contracts clearly support household listing and role display, but this planning pass found no trustworthy “primary household” field. Listing memberships avoids fabricated prioritization logic.
  Date/Author: 2026-05-07 / Orchestrator.

- Decision: Omit editable preference controls from `feat-041`; at most allow a small read-only account context row only when backed directly by existing profile fields and trivial to render.
  Rationale: This keeps the feature frontend-first and avoids implying unsupported persistence for speculative preferences.
  Date/Author: 2026-05-07 / Orchestrator.

## Outcomes & Retrospective

- Target outcome: `/settings` becomes a reliable single-page control center where users can manage their profile, see all current household memberships and roles, and navigate directly to existing household actions from one place.
- Verification target: the route renders the expanded hub states correctly for users with and without households, preserves profile editing, shows role-sensitive household action shortcuts, and passes focused frontend tests plus full repo verification.
- Expected acceptance artifact: successful settings-page tests and a passing `./init.sh` transcript recorded in harness evidence.
- Expected follow-up boundary: if implementation reveals real demand for durable user preference storage beyond current profile fields, log that as a later fullstack feature instead of expanding `feat-041` in place.

## Context and Orientation

- User-facing navigation and route surface:
  - `apps/web/src/app/(protected)/settings/page.tsx` — current App Router entry for `/settings`.
  - `apps/web/src/views/app/profile-settings-page.tsx` — current page orchestrator, currently profile-only.
  - `apps/web/src/views/app/more-page.tsx` — secondary mobile/discovery path into Settings.
  - `apps/web/src/lib/constants/paths.ts` and `apps/web/src/lib/constants/navigation.ts` — settings route and shell labels.
- Existing personal-profile surface:
  - `apps/web/src/components/profile/profile-avatar-section.tsx`
  - `apps/web/src/components/profile/profile-avatar-dialog.tsx`
  - `apps/web/src/components/profile/profile-display-name-form.tsx`
  - `apps/web/src/hooks/api/use-profile.ts`
  - `apps/web/src/api/profile.ts`
  - `apps/web/src/types/profile.ts`
- Existing household/member capabilities available for reuse or linking:
  - `apps/web/src/views/app/household-detail-page.tsx`
  - `apps/web/src/components/household/household-settings-card.tsx`
  - `apps/web/src/components/household/household-members-card.tsx`
  - `apps/web/src/components/household/household-danger-zone-card.tsx`
  - `apps/web/src/stores/household.store.ts`
  - `apps/web/src/api/household.ts`
  - `apps/web/src/api/invitation.ts`
- Existing backend/runtime contracts that must remain the source of truth, not be redefined in UI:
  - `apps/worker/src/routes/profile.ts` with `GET/PATCH /api/v1/users/me`
  - `apps/worker/src/routes/households.ts` with household detail/member/update/leave/remove routes
  - Invitation preview/create/accept handlers already used by other web surfaces
- Plan and harness continuity:
  - `docs/PLANS.md`
  - `docs/exec-plans/__plan-template__.md`
  - `docs/exec-plans/index.md`
  - `harness/features/feat-041.json`
  - `harness/feature_index.json`
  - `harness/progress.md`

## Standards and Implementation Notes

### Required references for implementation

- Planning and shared execution rules:
  - `AGENTS.md`
  - `ARCHITECTURE.md`
  - `docs/PLANS.md`
  - `docs/exec-plans/__plan-template__.md`
  - `docs/exec-plans/index.md`
  - `docs/knowledge/harness-engineering.md`
  - `docs/knowledge/codex-exec-plan.md`
  - `docs/references/index.md`
- Frontend standards required by scope:
  - `docs/FRONTEND.md`
  - `docs/references/frontend/project-folder-structure.md`
  - `docs/references/frontend/component-structure-pattern.md`
  - `docs/references/frontend/naming-and-conventions-pattern.md`
  - `docs/references/frontend/i18n-label-pattern.md`
  - `docs/references/frontend/api-react-query-pattern.md` if profile hooks/query organization changes
  - `docs/references/frontend/zustand-store-pattern.md` if household store shape changes
- Shared standards required by scope:
  - `docs/references/shared/type-naming-pattern.md`
- Required shadcn governance pre-read for UI work:
  - `.agents/skills/shadcn/SKILL.md`
  - `.agents/skills/shadcn/rules/styling.md`
  - `.agents/skills/shadcn/rules/forms.md`
  - `.agents/skills/shadcn/rules/composition.md`

### Concrete coding constraints derived from standards matrix

- Keep App Router page files thin: route-level files should only hand off to a view/orchestrator component.
- Keep view orchestration in `apps/web/src/views/app/*` and feature-bounded smart components in `apps/web/src/components/settings/*` or `apps/web/src/components/profile/*`.
- Use `kebab-case` file names, `export const` component exports, and barrel `index.ts` files only for public components.
- Promote code to shared locations only when it is truly cross-feature reusable; do not use `lib` as a dumping ground for settings-specific logic.
- All user-facing copy and validation messages must use i18n keys in `vi.json`; no JSX hardcoded strings.
- Use existing shadcn primitives and composition patterns (`Card`, `Alert`, `Badge`, `Separator`, `Skeleton`, `Tabs` only if truly needed). Do not invent primitive wrappers.
- For any settings form rows added in this feature, use `FieldGroup` + `Field`, prefer horizontal settings layout where appropriate, and preserve accessible labels/descriptions.
- If the settings hub needs role/action badges, use semantic tokens or `Badge` variants rather than raw color utilities.
- The UI must represent backend truth only: role-sensitive actions should be shown or hidden based on existing membership/role data, and links must target already-supported routes.

### Implementation Notes

- Mandatory patterns for this scope:
  - Build `/settings` as an orchestrator page composed from smaller cards/sections in this order: account summary, household membership summary, household action shortcuts, then the preserved profile edit section.
  - Prefer additive composition around the current profile-edit components instead of rewriting working form/upload logic.
  - Use overview cards and explicit action links/buttons for household-related tasks; avoid embedding heavy household-management flows unless the implementation can do so without duplicating existing pages.
  - Do not add tabs, nested route navigation, or secondary settings sub-navigation inside `/settings` for this feature.
- Companion skills recommended for implementation:
  - `test-driven-development` for adding focused settings regressions before or alongside behavior changes.
  - `frontend-patterns` for React/Next component architecture decisions.
  - `verification-before-completion` for final evidence gathering.
  - `requesting-code-review` for implementation review before merge.
  - `security-reviewer` only if implementation expands any user-input or sensitive-account handling beyond current profile edits.
  - `documentation-lookup` only if implementation needs current Next.js or shadcn API specifics.
- Common pitfalls to avoid:
  - Do not silently turn this into a backend-preferences project.
  - Do not duplicate household detail logic into Settings when a summary + shortcut suffices.
  - Do not mix household store rewrites with settings IA work unless a minimal additive store change is provably necessary.
  - Do not leave `/settings` without direct tests after materially expanding it.

## Interfaces & Dependencies

- Internal frontend interfaces:
  - `useCurrentUserProfileQuery()` and `useUpdateCurrentUserProfileMutation()` from `apps/web/src/hooks/api/use-profile.ts`
  - Household store actions/selectors from `apps/web/src/stores/household.store.ts`
  - Navigation constants from `apps/web/src/lib/constants/paths.ts`
  - i18n translation calls through the existing web i18n layer
- Existing backend/runtime contracts reused by the UI:
  - `GET /api/v1/users/me` / `PATCH /api/v1/users/me`
  - `GET /api/v1/households`
  - `GET /api/v1/households/:id`
  - `GET /api/v1/households/:id/members`
  - Existing invitation and leave/remove member endpoints reachable from existing household flows
- Layer impact check using `Types -> Config -> Repo -> Service -> Runtime -> UI` from `ARCHITECTURE.md`:
  - `Types`: possibly additive web-facing types only if current settings composition needs view models; shared runtime contracts should remain unchanged.
  - `Config`: navigation/i18n constants may change.
  - `Repo`: unchanged.
  - `Service`: unchanged.
  - `Runtime`: unchanged; UI must consume existing runtime/service contracts only.
  - `UI`: primary layer impacted.
- Hard dependency rule checks:
  - Lower layers do not depend on higher layers because this is frontend-only composition work.
  - UI must not bypass runtime/service contracts; settings components must use existing hooks/store/API adapters.
  - Data access remains through existing query hooks and household store/api boundaries.
- New dependency expectation:
  - No new dependency is expected. If implementation believes a new dependency is required for UI composition, stop and justify it explicitly in the plan/decision log before adoption.

## Plan of Work (Narrative)

1. **Implement the locked settings information architecture against current product truth.** `/settings` must remain a single route with one long-form page composed of stacked cards/sections: an account summary, a household membership summary, a household action shortcuts section, and the preserved existing profile-edit block. Do not add tabs or invent a multi-route settings IA.

2. **Restructure the current page into a thin orchestrator plus bounded settings sections.** Keep `apps/web/src/app/(protected)/settings/page.tsx` thin and move composition into a view such as an updated `profile-settings-page.tsx` or a new settings-hub page component. Introduce `apps/web/src/components/settings/*` for new cards/summary sections and keep the profile upload/edit logic in the existing profile components unless a small extraction is needed.

3. **Add household membership context using current data sources.** Reuse the existing household store/API boundaries to show whether the user has any households and, when they do, render a compact summary list of all current household memberships with each household name and the user’s role. Do not invent a primary or “most relevant” household concept. The page must also handle empty/no-household states cleanly.

4. **Preserve and embed the existing profile-edit workflow.** Keep avatar upload, display-name update, loading, retry, and error states functional inside the new settings hub. If the current profile section is too monolithic for the expanded page, split it surgically by concern while preserving behavior and public prop contracts.

5. **Keep account context concise and avoid speculative preferences.** The account summary may include a minimal read-only row only when it is directly backed by current profile data and trivial to render, but the feature must not introduce editable preference controls or any dedicated quick-add preference UI in the first pass.

6. **Localize all new content and ensure state coverage.** Add i18n keys for headings, descriptions, empty states, role labels, action labels, and error states. Ensure the page explicitly covers loading, empty, success, and error/retry states consistent with `docs/FRONTEND.md`.

7. **Add focused regression coverage and verify end-to-end readiness.** Add tests for the expanded settings view, especially profile preservation, household/no-household branching, role-aware shortcuts, and retry/error states. Finish with the standard frontend verification flow and full `./init.sh`.

## Concrete Steps (Commands)

Run from repo root unless noted otherwise.

```bash
# Baseline verification before implementation
./init.sh

# Run focused web tests while developing settings hub changes
pnpm --filter web test -- --run settings

# Frontend quality gates
pnpm --filter web lint
pnpm --filter web typecheck

# Final full-repo verification required by AGENTS.md
./init.sh
```

Expected short outputs to compare against:

- `pnpm --filter web test -- --run settings` shows the new/updated settings tests passing (for example, `N passed, 0 failed`).
- `pnpm --filter web lint` completes without errors.
- `pnpm --filter web typecheck` completes without TypeScript errors.
- `./init.sh` completes with install/harness checks/lint/type-check/tests/build succeeding.

## Validation and Acceptance

- Happy path — user with household membership:
  - Visiting `/settings` shows one long-form page with account summary, household membership summary, household action shortcuts, and the existing profile-edit section.
  - The membership summary lists every current household membership with truthful role labels.
  - Profile updates (display name and avatar path) still behave as before.
  - Household-related shortcuts navigate to existing valid routes or trigger existing bounded flows.
- Happy path — user without household membership:
  - `/settings` still renders a coherent hub, profile controls remain available, and the household area shows an explicit empty state with a single next-step CTA to the existing `/onboarding` route.
- Validation/error paths:
  - Profile load failure still renders retry support.
  - Household data loading or missing-membership states do not crash the page; they render an alert/empty fallback instead.
  - Role-sensitive actions follow this exact matrix and are hidden when not allowed by current role/data:
    - no household memberships: show only the `/onboarding` CTA in the household area.
    - household member: show shortcuts to view the household detail route and leave the household only.
    - household admin: show shortcuts to view household detail, manage members, open household settings, invite members, and leave/archive only when those actions already exist on the linked household surface.
- Unauthorized/forbidden:
  - The protected route remains protected through existing app auth gating; the settings UI must not expose privileged household management affordances to non-admin roles if current data shows they are not allowed.
- Regression checks:
  - Existing profile editing behavior continues to pass targeted tests.
  - New settings-hub view tests cover household/no-household branches, action visibility, and error states.
- Acceptance artifact:
  - A passing settings-page test transcript and `./init.sh` output recorded in `harness/progress.md` and `harness/features/feat-041.json` evidence.

## Idempotence & Recovery

- UI and harness edits are safe to re-run because they are deterministic source changes.
- If the settings information architecture becomes too broad during implementation, revert to the last committed state and re-apply only the profile-preserving hub sections defined in this plan.
- If a proposed preference control lacks a real persistence field in `/api/v1/users/me`, remove or downgrade it to read-only summary text rather than inventing fake state.
- If household-store composition changes cause instability, fall back to read-only summary plus route shortcuts and log a follow-up instead of broadening store refactors inside `feat-041`.

## Artifacts and Notes

- Expected artifacts after execution:
  - Expanded `/settings` route implementation with feature-bounded components.
  - New or updated web tests covering the settings hub.
  - Updated i18n keys for the new settings content.
  - Updated harness feature and progress records with concrete verification evidence.
  - A commit limited to the expected settings/harness/planning files.

## Risks and Blockers

- Risk: the feature may sprawl into a full household-settings rewrite.
  - Mitigation: keep `/settings` focused on summary + shortcuts + preserved profile editing, not full duplication of household detail management.
- Risk: mixed state-management patterns (React Query + Zustand) may tempt a broad refactor.
  - Mitigation: prefer minimal composition adapters and read-only selectors rather than architectural rewrites.
- Risk: new UI could imply unsupported preference persistence.
  - Mitigation: only show editable controls that map to existing contracts; otherwise render read-only context or defer.
- Risk: direct `/settings` coverage remains weak after the change.
  - Mitigation: treat new targeted tests as mandatory definition-of-done work.
- Blocker threshold: if implementation finds a planned shortcut without an existing truthful route target, or current household data cannot support the planned membership list, pause and record a follow-up instead of expanding scope silently.

## Open Decisions

- None at plan creation time. If implementation discovers a missing truthful route target or unsupported household action, stop and log a new decision or follow-up instead of expanding scope silently.

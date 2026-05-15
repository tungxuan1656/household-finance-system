# Household action card refactor

## Purpose / Big Picture

Refactor the household list and household detail pages to match the newer profile/settings page pattern: route-level views stay thin, UI states are delegated to small feature components, and primary actions are presented as clear card CTAs. End users will see an always-available "create household" card at the end of the households grid, and admins will see an always-available "invite member" card below the member list. The CTA UI is now backed by a shared callback-driven `ActionCard` that can be reused for future actions such as creating budgets.

## Scope

- Change `apps/web/src/views/app/households-page.tsx` to use `PageShell`, `DataState`, and smaller feature components.
- Add focused household view components under `apps/web/src/views/app/households/`.
- Change `apps/web/src/views/app/household-detail-page.tsx` to use `PageShell` and `DataState` for loading/error states.
- Add `apps/web/src/components/shared/action-card.tsx` as a generic reusable action card with optional outer title/description, dashed content, media slot, action copy, and `onAction` callback.
- Change `apps/web/src/components/household/household-create-dialog.tsx` so callers can supply a custom trigger while preserving the existing dialog/form behavior.
- Change `apps/web/src/components/household/household-invite-dialog.tsx` so admins can open it from an invite card below members while preserving invite generation/copy behavior.
- Change `apps/web/src/components/household/household-members-card.tsx` so it only owns the member list, while `apps/web/src/views/app/household-detail-page.tsx` renders invite CTA as a sibling card below the member card for admins.
- Update Vietnamese i18n only if new visible labels are required.
- Update harness artifacts and progress log.
- Out of scope: backend/API changes, new household/invitation behavior, component/page render tests, new shadcn primitive installation.

## Non-negotiable Requirements

- Use `PageShell` for route-level app page layout.
- Use `DataState` from `apps/web/src/components/shared/data-state.tsx` for loading/empty/error state cards where it fits.
- Keep `HouseholdCreateDialog` and `HouseholdInviteDialog` behavior-compatible with current callers.
- Create household card must always render as the last grid item, even when households already exist.
- Invite member card must render as a separate sibling card below the member card for admins, not nested inside `HouseholdMembersCard`.
- Shared `ActionCard` must support no-header rendering when `title` and `description` are omitted.
- Shared `ActionCard` button must be centered, `size='sm'`, `variant='default'`, use `actionLabel`, and call `onAction` so callers own follow-up behavior.
- Use shadcn primitives directly and preserve accessibility: dialog title/description, button semantics, retry actions.

## Progress

- [x] 2026-05-14: Read frontend/shadcn/product docs and existing household/profile patterns.
- [x] 2026-05-14: GitNexus upstream impact checks returned LOW risk for touched household symbols.
- [x] 2026-05-14: Implemented PageShell/DataState route refactor, create/invite action cards, custom dialog triggers, and localized copy.
- [x] 2026-05-14: Ran focused Vitest, lint, typecheck, and test verification.
- [x] 2026-05-14: Updated harness feature evidence and progress log.
- [x] 2026-05-14: Extracted generic shared ActionCard and rewired household create/invite actions to open controlled dialogs via callbacks.
- [x] 2026-05-14: Removed household UI/source-contract test per user request and kept verification on lint/typecheck/test/init.

## Surprises & Discoveries

- `DataState` already exists and returns children directly for success state, so it can wrap page and detail loading/error branches without adding extra success markup.
- `AvatarGroup` exists in `apps/web/src/components/ui/avatar.tsx`, so the invite CTA can match the provided visual direction without adding a new primitive.
- The generic action card needs an omitted-header mode because the user provided a second visual showing the card without outer title/description.

## Decision Log

- Decision: Use custom trigger props on existing dialogs instead of moving dialog state into action cards.
  Rationale: This preserves form/invite behavior and lets the action cards stay presentational.
  Date/Author: 2026-05-14 / Orchestrator
- Decision: Render invite card in `HouseholdDetailPage` as a sibling below `HouseholdMembersCard`, not nested inside it.
  Rationale: User explicitly requested splitting invite member action card into an outside card.
  Date/Author: 2026-05-14 / User + Orchestrator
- Decision: Use a shared callback-driven `ActionCard` and let callers own dialog state instead of passing dialog triggers into the card.
  Rationale: User requested the action button callback outward so the same card can power household, invite-member, budget, and future actions.
  Date/Author: 2026-05-14 / User + Orchestrator

## Outcomes & Retrospective

- Household list and detail routes now share the PageShell/DataState pattern used by the refactored settings pages.
- The create-household CTA is always appended as the final grid item, including empty success states.
- A shared `ActionCard` now supports optional header text, dashed action content, custom media, action title/description/label, and a centered default small button that calls `onAction`.
- The household create and admin invite-member CTAs reuse the shared `ActionCard` and open existing dialogs through parent-owned controlled state instead of nested dialog triggers.
- Admin invite-member CTA is rendered as a separate card below the member card and reuses the existing invite dialog through controlled state.
- Household UI/source-contract test was removed per user request; verification remains through lint, typecheck, full tests, and final init.
- Verification passed: focused household source-contract Vitest passed; `./init.sh lint` passed; `./init.sh typecheck` passed after adding the localized load-failure key; `./init.sh test` passed; final full `./init.sh` passed with `Done!`; final `gitnexus_detect_changes(scope: all)` returned LOW risk with 12 changed files and 0 affected processes.

## Context and Orientation

- `apps/web/src/views/app/households-page.tsx`: household list route view, owns loading/error/create orchestration.
- `apps/web/src/views/app/household-detail-page.tsx`: household detail route view, owns route param, fetch, settings/member/danger-zone composition.
- `apps/web/src/components/household/household-create-dialog.tsx`: create household dialog and form.
- `apps/web/src/components/household/household-invite-dialog.tsx`: invite-link dialog.
- `apps/web/src/components/household/household-members-card.tsx`: member list and admin member actions.
- `apps/web/src/components/shared/data-state.tsx`: reusable card state component for loading/empty/error.
- `apps/web/src/components/shared/action-card.tsx`: reusable callback-driven card CTA for feature actions.

## Required Standards / Reference Docs

- `docs/FRONTEND.md`: app route pages use `PageShell`; state coverage required; no component/page render tests.
- `.agents/skills/shadcn/SKILL.md`: use shadcn primitives directly; full Card anatomy; semantic tokens; `gap-*`; `AvatarFallback`; icons in buttons use `data-icon`.
- `docs/references/frontend/project-folder-structure.md`: route views in `views/`, shared UI only after real reuse.
- `docs/references/frontend/component-structure-pattern.md`: split near 200 lines or mixed concerns; named exports.
- `docs/references/frontend/naming-and-conventions-pattern.md`: kebab-case files, named exports, import order.
- `docs/references/frontend/form-pattern.md`: preserve existing create form validation/field structure.
- `docs/references/frontend/dialog-and-form-pattern.md`: dialogs keep title/description and accessible triggers.
- `docs/references/frontend/i18n-label-pattern.md`: no hardcoded user-facing text.

## Plan of Work (Narrative)

1. Add `apps/web/src/components/shared/action-card.tsx` as a generic card CTA with optional outer title/description, dashed content, media slot, action title/description/label, and `onAction` callback.
2. Add household-specific action-card adapters in `apps/web/src/components/household/household-action-card.tsx` for create-household and invite-member variants.
3. Add `apps/web/src/views/app/households/households-list-section.tsx` to render the responsive household grid and always append the create-household action card.
4. Update `HouseholdCreateDialog` with an optional `trigger` prop, including `trigger={null}` for callback-owned controlled dialogs while existing default button behavior remains.
5. Update `HouseholdInviteDialog` with optional controlled `isOpen`/`onOpenChange` and nullable `trigger` props so `HouseholdDetailPage` can place the callback action below the member card.
6. Update `HouseholdMembersCard` to own only member list, loading/error/empty, and remove-member behavior.
7. Update `HouseholdsPage` to use `PageShell`, `DataState`, and the new grid section, preserving load/create/retry behavior.
8. Update `HouseholdDetailPage` to use `PageShell`, `DataState`, and keep settings/members/danger zone composition unchanged.
9. Add or update i18n strings only for new card descriptions if existing labels are insufficient.
10. Update harness feature record and progress log with verification evidence.

## Concrete Steps (Commands)

Run from repo root unless noted:

```bash
./init.sh lint
./init.sh typecheck
./init.sh test
./init.sh
```

Expected short outputs:

```text
OK
OK
OK
Done!
```

If focused debugging is needed, run only the relevant manual one-file command, then still run the required init checks before completion.

## Validation and Acceptance

- Household list route uses `PageShell` and no longer owns a custom route `<header>/<h1>`.
- Loading and blocking error states render through `DataState` with retry action.
- Household list success state renders household summary cards and the create household card as the last grid item.
- Empty household list still shows the create card because it is the only grid item/action.
- Clicking create card opens the create dialog; successful create closes and resets the form as before.
- Shared `ActionCard` source exposes optional `title`/`description`, action icon/title/description/label props, `onAction`, `size='sm'`, `variant='default'`, and dashed content styling.
- Household detail loading/error states render through `DataState` with retry action.
- Admin household detail renders invite member card as a separate sibling card below current members; clicking it opens invite dialog.
- Non-admin household detail does not render the invite card.
- `./init.sh lint`, `./init.sh typecheck`, `./init.sh test`, and final `./init.sh` pass.

## Idempotence & Recovery

- All edits are source-only frontend changes and are safe to re-run.
- No migrations, destructive commands, dependency installs, or generated files are required.
- Recovery is normal git checkout/revert of touched files.

## Artifacts and Notes

- GitNexus impact checks before editing:
  - `HouseholdsPage`: LOW risk, 0 impacted symbols/processes.
  - `HouseholdDetailPage`: LOW risk, 0 impacted symbols/processes.
  - `HouseholdMembersCard`: LOW risk, 0 impacted symbols/processes.
  - `HouseholdCreateDialog`: LOW risk, 0 impacted symbols/processes.
  - `HouseholdInviteDialog`: LOW risk, 0 impacted symbols/processes.

## Interfaces & Dependencies

- Uses existing shadcn primitives: `Card`, `Button`, `Dialog`, `Badge`, `Avatar`.
- Uses existing `DataState` interface:
  - `isLoading?: boolean`
  - `isEmpty?: boolean`
  - `isError?: boolean`
  - `title?: string`
  - `emptyTitle?: string`
  - `emptyDescription?: string`
  - `errorTitle?: string`
  - `errorDescription?: string`
  - `action?: ReactNode`
- No backend contracts change.

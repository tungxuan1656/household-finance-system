# Profile and More settings UI refactor

---

## Title

Refactor More shortcuts and Profile settings cards

## Purpose / Big Picture

This frontend-focused change improves the protected More and Profile Settings screens with clearer mobile-first account navigation. Users will see a More page shortcut card with wrapping icon/arrow rows and the current app version from root `package.json`, and a Profile Settings page with three stacked cards: avatar, profile/security, and danger-zone account actions. Sign out and Firebase account deletion require `AlertDialog` confirmation; password change and Firebase account deletion use Firebase client SDK reauthentication.

## Scope

- Change `apps/web/src/views/app/more-page.tsx` to orchestrate a shortcut-list More page and app version footer.
- Add More page child UI under `apps/web/src/views/app/more/`.
- Change `apps/web/src/views/app/profile-settings-page.tsx` to remove tabs/households and orchestrate only profile query/update state.
- Add Profile Settings child UI under `apps/web/src/views/app/profile-settings/`.
- Add reusable confirm dialog at `apps/web/src/components/shared/confirm-dialog.tsx`.
- Extend profile form schema in `apps/web/src/lib/forms/profile.schema.ts` for password-change UI validation.
- Add Vietnamese i18n keys in `apps/web/src/lib/i18n/locales/vi.json`.
- Add or update focused source-contract tests only if needed for non-render behavior/source guarantees; do not add component/page render tests.
- Update harness records: `harness/feature_index.json`, a new `harness/features/feat-057.json`, and `harness/progress.md`.
- Out of scope: worker/backend data cleanup for deleted users, email update, household membership display on Profile Settings, command palette/keyboard shortcut support, and changing routes or app shell navigation.

## Non-negotiable Requirements

- Use existing shadcn primitives directly: `Card`, `Button`, `AlertDialog`, `Field`, `FieldGroup`, `Input`, `Separator`, and existing `Avatar` primitives where appropriate.
- Do not use custom inline style or raw color classes for cards/buttons/icons; use semantic tokens and primitive variants.
- More page rows show an icon on the left and `ArrowRight` on the right; no shortcut-key pills.
- More page footer shows version from root `package.json` (`0.1.0` at plan creation time), not a duplicated hardcoded app version constant.
- Profile Settings has no tabs and no households section.
- Profile Settings card order is avatar, profile/security, account actions.
- Email is visible but read-only; display name and avatar remain editable with existing API paths.
- Password-change section submits through Firebase client SDK after current-password reauthentication; do not collect passwords without submitting them.
- Sign out and delete account both open a confirmation dialog before action.
- Delete account deletes only the Firebase sign-in account after current-password reauthentication, then performs best-effort session cleanup; UI copy must not imply backend data deletion.
- All user-facing labels use `t(...)` and keys in `apps/web/src/lib/i18n/locales/vi.json`.

## Progress

- [x] Create ExecPlan and register it as active in `docs/exec-plans/index.md` (2026-05-14).
- [x] Run GitNexus upstream impact checks for `MorePage`, `ProfileSettingsPage`, `ProfileAvatarSection`, `ProfileDisplayNameForm`, and `signOutCurrentSession` (attempted; GitNexus unavailable after `./init.sh sync`).
- [x] Implement More page shortcut card and version footer.
- [x] Implement shared `ConfirmDialog`.
- [x] Implement Profile Settings stacked cards and deferred password/delete flows.
- [x] Update i18n labels and harness feature evidence.
- [x] Run lint, typecheck, Playwright CLI validation, and GitNexus change detection (change detection attempted; GitNexus unavailable).
- [x] Follow-up: switch `ConfirmDialog` to `AlertDialog`, fix narrow More shortcut wrapping, implement Firebase password change/delete, and restyle account actions as danger-zone rows.

## Surprises & Discoveries

- Root `package.json` currently declares version `0.1.0`.
- Current `profile-settings-page.tsx` mixes profile editing and household membership display; the user explicitly moved households out of this page for a later/other page.
- GitNexus MCP returned `Connection closed` / `Not connected` for impact checks even after `./init.sh sync` returned `OK`; record this as unavailable evidence rather than skipping the required step.
- The initially planned password form would have collected real secrets while the API was deferred. TypeScript review flagged this as a blocker, so the first implementation used a non-interactive section; the follow-up now wires password change to Firebase so collected secrets are used immediately and reset on success.
- `AlertDialogContent` does not accept `onInteractOutside`; the final shared confirm dialog guards close through `onOpenChange` and `onEscapeKeyDown` only.

## Decision Log

- Decision: Do not use tabs on `ProfileSettingsPage`.
  Rationale: User clarified Profile Settings should only show three stacked cards and no households.
  Date/Author: 2026-05-14 / User + Orchestrator.
- Decision: More page uses shortcut-list card, not keyboard shortcut hints.
  Rationale: User requested right arrows instead of shortcut keys and icons for each row.
  Date/Author: 2026-05-14 / User + Orchestrator.
- Decision: Add a reusable confirm dialog.
  Rationale: Sign out and delete account both need warning alerts, and future destructive flows can reuse the same ref-based dialog pattern.
  Date/Author: 2026-05-14 / User + Orchestrator.
- Decision: Keep password change as explanatory deferred UI, not an interactive form.
  Rationale: Backend/API is out of scope, and collecting real passwords without submitting them is unnecessary sensitive-data handling.
  Date/Author: 2026-05-14 / Orchestrator after TypeScript review.
- Decision: Implement password change through Firebase client SDK instead of waiting for a worker API.
  Rationale: User requested the actual password-change feature and this app already uses Firebase email/password as the identity provider.
  Date/Author: 2026-05-14 / User + Orchestrator.
- Decision: Switch shared confirm dialog to shadcn `AlertDialog`.
  Rationale: User explicitly requested AlertDialog and destructive/account confirmation flows need alert-dialog semantics.
  Date/Author: 2026-05-14 / User.
- Decision: Delete account means Firebase sign-in account deletion only for this follow-up.
  Rationale: The app has Firebase auth helpers available, while server-side data deletion needs a separate backend contract and must not be implied by UI copy.
  Date/Author: 2026-05-14 / User + Orchestrator.

## Follow-up Scope: AlertDialog, Security, and Danger Zone

- Change `apps/web/src/components/shared/confirm-dialog.tsx` to use `AlertDialog*` primitives while preserving the existing imperative `ConfirmDialogHandle` API.
- Fix `apps/web/src/views/app/more/more-shortcuts-card.tsx` text wrapping so labels/descriptions wrap at narrow widths instead of truncating.
- Add Firebase auth helpers in `apps/web/src/lib/auth/firebase-auth.ts` for current-password reauthentication, password update, and current-user deletion.
- Add session-service functions in `apps/web/src/lib/auth/session-service.ts` for password update and account deletion/cleanup.
- Change `apps/web/src/views/app/profile-settings/profile-details-card.tsx` from deferred password copy to an active password-change form using the existing `passwordChangeSchema`.
- Restyle `apps/web/src/views/app/profile-settings/account-actions-card.tsx` as danger-zone rows with icon-left, title/description, arrow-right, and confirm dialogs; delete account requires current password before calling Firebase delete.
- Update `apps/web/src/lib/i18n/locales/vi.json` and source-contract tests.
- Out of scope: backend data deletion for user-owned records. Firebase account deletion will clear identity/local session; backend cleanup remains future server work and UI copy must not imply full data purge.

## Follow-up Verification

- `pnpm --filter web exec vitest run src/lib/auth/firebase-auth.test.ts`
- `./init.sh lint`
- `./init.sh typecheck`
- `./init.sh test`
- Full `./init.sh`
- GitNexus impact and detect changes are required but may remain unavailable; record exact output.

## Outcomes & Retrospective

- Implemented More shortcut-list UI with narrow-width wrapping, root package version footer, Profile Settings stacked cards, reusable AlertDialog-backed confirm dialog, Firebase password change, Firebase sign-in account deletion, danger-zone action rows, i18n updates, and focused source-contract/Firebase auth coverage. Worker/backend user-data cleanup remains out of scope. GitNexus checks were attempted but unavailable after sync.

## Context and Orientation

- `apps/web/src/views/app/more-page.tsx`: protected More hub currently renders one quick-links card.
- `apps/web/src/views/app/profile-settings-page.tsx`: current settings view fetches profile, updates avatar/display name, and renders household memberships; memberships will be removed from this page.
- `apps/web/src/components/profile/profile-avatar-section.tsx`: existing smart avatar upload/crop/upload section; reuse inside an avatar card rather than duplicating upload logic.
- `apps/web/src/components/profile/profile-display-name-form.tsx`: existing display-name form; reuse in the profile card.
- `apps/web/src/lib/auth/session-service.ts`: exposes `signOutCurrentSession()` used by layout sign-out flow.
- `apps/web/src/components/ui/alert-dialog.tsx`, `apps/web/src/components/ui/card.tsx`, `apps/web/src/components/ui/field.tsx`: shadcn primitives for alert dialog/card/form composition.

## Standards and Coding Constraints

- `docs/FRONTEND.md`: mobile-first, use shadcn primitives directly, state coverage for loading/error/retry, no web component/page render tests.
- `.agents/skills/shadcn/SKILL.md`: compose primitives, use built-in variants, semantic colors, no `space-*`, use `gap-*`, Card uses full anatomy, Dialog always has a title, Avatar always has fallback.
- `docs/references/frontend/web/project-folder-structure.md`: view orchestrators stay in `views/`; reusable cross-feature dialog belongs in `components/shared`; shadcn primitives remain in `components/ui`.
- `docs/references/frontend/web/component-structure-pattern.md`: split near 200 lines or when 3+ concerns mix; page/view orchestrates and child feature components own bounded concerns.
- `docs/references/frontend/web/form-pattern.md`: forms use `zod`, `react-hook-form`, `FieldGroup`, `Field`, validation states, and i18n validation messages.
- `docs/references/frontend/web/dialog-and-form-pattern.md`: dialogs own open state and use ref pattern; use `DialogClose asChild` or equivalent safe cancel behavior; no custom dialog spacing unless needed.
- `docs/references/frontend/web/naming-and-conventions-pattern.md`: kebab-case files, named exports, import order, English comments only, future API comments use `// TODO: connect to ... once available`.
- `docs/references/frontend/web/i18n-label-pattern.md`: no hardcoded user-facing strings; keys must be semantic and synchronized for locale files.

## Plan of Work (Narrative)

1. Run GitNexus impact checks before touching target symbols. If any check returns HIGH or CRITICAL, stop and warn before editing.
2. Add `apps/web/src/components/shared/confirm-dialog.tsx` with `ConfirmDialogHandle`, `ConfirmDialogProps`, `forwardRef`, internal open/submitting state, async confirm handling, and shadcn `AlertDialog`/`Button` composition. Export from `apps/web/src/components/shared/index.ts` if that barrel exists or create/update the smallest appropriate barrel.
3. Add More page child component `apps/web/src/views/app/more/more-shortcuts-card.tsx`. Define a small row list with icon objects from the existing icon library, labels/descriptions from i18n, hrefs from `PATHS`, and `ArrowRight`. Use `CardHeader`, `CardContent`, and `Separator`; rows should be accessible links with focus-visible state and no shortcut-key display.
4. Update `apps/web/src/views/app/more-page.tsx` to render the header, `MoreShortcutsCard`, and a small version footer. Import `version` from root `package.json` if TypeScript config supports JSON imports; otherwise add a minimal frontend constant that reads package metadata at build time without duplicating version text manually. Verify typecheck decides the final method.
5. Add Profile Settings child components under `apps/web/src/views/app/profile-settings/`:
   - `profile-avatar-card.tsx`: wraps `ProfileAvatarSection` in a full `Card` anatomy.
   - `profile-details-card.tsx`: displays readonly email, `ProfileDisplayNameForm`, and password-change form using `FieldGroup` and password inputs. Submission calls Firebase password change through session service and resets on success.
   - `account-actions-card.tsx`: renders sign-out and Firebase delete account actions as danger-zone rows and owns two `ConfirmDialog` refs. Sign out calls `signOutCurrentSession` only after confirm. Delete account asks for the current password, calls Firebase deletion through session service, then clears local/session state.
6. Update `apps/web/src/views/app/profile-settings-page.tsx`: remove household store/effect/link/badge imports and all membership rendering; keep profile loading/error/retry and update mutation; render the three new cards with `isBusy` passed to avatar/display-name controls.
7. Extend `apps/web/src/lib/forms/profile.schema.ts` with a password-change schema and exported inferred type. Rules: current password required; new password minimum 8; confirm password must match; messages from i18n.
8. Update `apps/web/src/lib/i18n/locales/vi.json` for all new More, Profile, Account Actions, ConfirmDialog/common action, password validation, and deferred API strings.
9. Add/update harness feature record `feat-057` and progress log. Keep feature status `in-progress` until verification passes, then set `done` with evidence.
10. Run verification and Playwright CLI manual browser checks. Record evidence snippets in the plan, harness feature file, and progress log.

## Concrete Steps (Commands)

Run from repo root unless stated otherwise.

```bash
./init.sh lint
```

Expected: prints `OK`.

```bash
./init.sh typecheck
```

Expected: prints `OK`.

```bash
./init.sh test
```

Expected: prints `OK` if focused/source-contract tests are added or existing tests are affected.

```bash
./init.sh
```

Expected final full verification: prints `Done!`.

Playwright CLI validation after starting/using the web app in the existing project-approved way:

```bash
# Use the playwright-cli skill/tooling to inspect protected More and Profile Settings screens.
```

Expected browser assertions: More card rows show icons and right arrows, version is visible, Profile Settings shows exactly avatar/profile/account cards, no households section appears, sign-out and delete-account actions open confirmation dialogs.

## Validation and Acceptance

- More page acceptance:
  - It renders a shortcut-style `Card` with icon-left and arrow-right rows.
  - No shortcut key pills appear.
  - Version footer displays `0.1.0` from root `package.json`.
  - Existing routes still navigate through `PATHS.ADD_EXPENSE`, `PATHS.HOUSEHOLDS`, `PATHS.SETTINGS`, and `PATHS.ONBOARDING` as applicable.
- Profile Settings acceptance:
  - Loading and profile-load error/retry states remain present.
  - Page renders three cards in order: avatar, profile/security, account actions.
  - Household memberships are absent.
  - Avatar upload and display-name submit still use `useUpdateCurrentUserProfileMutation`.
  - Email is visible and not editable.
  - Password-change section validates current/new/confirm password, calls Firebase reauthentication/password update, and resets after success.
  - Sign out opens confirm dialog; confirm calls `signOutCurrentSession`.
  - Delete account opens destructive alert dialog, requires current password, deletes the Firebase sign-in account, and copy does not claim backend data cleanup.
- Accessibility acceptance:
  - Confirmations have visible `AlertDialogTitle` and optional `AlertDialogDescription`.
  - Links/buttons are keyboard-focusable with visible focus states.
  - Password inputs include appropriate autocomplete hints and validation errors.
- Verification acceptance:
  - `./init.sh lint` passes.
  - `./init.sh typecheck` passes.
  - Playwright CLI evidence confirms the UI behavior above.
  - `gitnexus_detect_changes({ scope: "all" })` is recorded before completion summary.

## Idempotence & Recovery

- Code edits are safe to re-run because they only add/replace frontend source files and docs/harness metadata.
- No database migrations or destructive backend operations are included.
- If JSON/i18n changes break parsing, recover by reverting the touched JSON hunks and validating with `python3 -m json.tool <file>`.
- If root `package.json` JSON import fails typecheck, replace with a small generated/constant helper only after documenting why direct import is not supported.
- If confirm dialog async sign-out fails, keep dialog open and allow retry; do not clear local session unless `signOutCurrentSession` handles that path.

## Artifacts and Notes

- Required evidence to paste after implementation:
  - GitNexus impact result summary: unavailable; impact calls returned MCP `Connection closed` / `Not connected` even after `./init.sh sync` returned `OK`.
  - Focused Vitest: `pnpm --filter web exec vitest run src/lib/auth/firebase-auth.test.ts` passed (8 tests, 2 files).
  - `./init.sh lint` output: `OK`.
  - `./init.sh typecheck` output: `OK`.
  - Playwright CLI observation summary: mocked authenticated browser session showed More shortcut rows wrapping with icons/right arrows and version `0.1.0`; Profile Settings showed avatar, profile/password form, and danger-zone cards with no households; sign-out/delete opened alert dialogs and delete required current password before enabling confirm.
  - `./init.sh test` output: `OK`.
  - Full `./init.sh` output: `Done!`.
  - GitNexus change detection summary: unavailable; `gitnexus_detect_changes(scope: "all")` returned `Not connected`.

## Interfaces & Dependencies

- `ConfirmDialogHandle` contract:
  - `open: () => void`
  - `close: () => void`
- `ConfirmDialogProps` contract:
  - `title: string`
  - `description?: string`
  - `confirmLabel?: string`
  - `cancelLabel?: string`
  - `variant?: 'default' | 'destructive'`
  - `confirmDisabled?: boolean`
  - `confirmLoading?: boolean`
  - `onConfirm?: () => void | Promise<void>`
  - `onCancel?: () => void`
  - `children?: ReactNode`
  - plus safe `AlertDialogContent` props except `children` and `onEscapeKeyDown`.
- Existing dependency: `signOutCurrentSession()` from `apps/web/src/lib/auth/session-service.ts`.
- Existing dependency: `changeCurrentUserPassword()` and `deleteCurrentUserAccount()` from `apps/web/src/lib/auth/session-service.ts`.
- Existing dependency: `ProfileAvatarSection` and `ProfileDisplayNameForm` from `apps/web/src/components/profile`.
- Existing dependency: `PATHS` from `apps/web/src/lib/constants/paths`.
- Companion skills during implementation: `test-driven-development` for behavior changes, `typescript-reviewer` for TypeScript/React review, `verification-before-completion` before claiming completion, and `playwright-cli` for browser UI validation.
